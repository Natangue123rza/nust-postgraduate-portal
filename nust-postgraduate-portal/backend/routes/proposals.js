// backend/routes/proposals.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/proposals/submit
// Student submits a proposal
router.post('/submit', async (req, res) => {

  const { studentId, title, description, fileName } = req.body

  try {

    // Check if student already submitted a proposal
    const [existing] = await poolPromise.query(
      'SELECT * FROM proposals WHERE student_id = ?',
      [studentId]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'You have already submitted a research proposal.'
      })
    }

   // Insert proposal - start it in supervisor review explicitly (don't rely on the old column default)
    await poolPromise.query(
      'INSERT INTO proposals (student_id, title, description, file_name, status, supervisor_status) VALUES (?, ?, ?, ?, ?, ?)',
      [studentId, title, description, fileName, 'Pending Supervisor Review', 'Pending']
    )

    // Get student name
// Get student name + their assigned supervisor(s)
const [studentRows] = await poolPromise.query(
  'SELECT name, supervisor_id, co_supervisor_id FROM users WHERE id = ?',
  [studentId]
)
const studentName = studentRows[0].name
const supervisorId = studentRows[0].supervisor_id
const coSupervisorId = studentRows[0].co_supervisor_id

// Notify ONLY the assigned supervisor (and co-supervisor) - they review first, before the HOD
if (supervisorId) {
  await poolPromise.query(
    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
    [supervisorId, 'New Proposal Submitted', studentName + ' has submitted a research proposal titled "' + title + '". Please review it.']
  )
}
if (coSupervisorId) {
  await poolPromise.query(
    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
    [coSupervisorId, 'New Proposal Submitted', studentName + ' has submitted a research proposal titled "' + title + '". Please review it.']
  )
}

    res.json({ message: 'Proposal submitted successfully!' })

  } catch (err) {
    console.error('Proposal error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/proposals/all
// HOD only sees proposals approved by supervisor
router.get('/all', async (req, res) => {
  const { departmentId } = req.query
  try {
    let query = `SELECT p.*, u.name as student_name, u.degree, u.department_id
       FROM proposals p
       JOIN users u ON p.student_id = u.id
       WHERE p.supervisor_status = 'approved'
       AND p.version = (
         SELECT MAX(p2.version) FROM proposals p2 WHERE p2.student_id = p.student_id
       )`
    const params = []
    if (departmentId) {
      query += ' AND u.department_id = ?'
      params.push(departmentId)
    }
    query += ' ORDER BY p.submitted_at DESC'
    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/proposals/student/:studentId
// Student views their own proposal
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    const [rows] = await poolPromise.query(
      `SELECT p.*, u.name as student_name, u.degree
       FROM proposals p
       JOIN users u ON p.student_id = u.id
       WHERE p.student_id = ?
       ORDER BY p.version DESC`,
      [studentId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/proposals/hdc-decision/:proposalId
// HOD records HDC decision
router.put('/hdc-decision/:proposalId', async (req, res) => {

  const { proposalId } = req.params
  const { hdcDecision, hdcComments } = req.body

  try {

    const newStatus = hdcDecision === 'approved' ? 'Approved' : 'Rejected'

    await poolPromise.query(
      'UPDATE proposals SET hdc_decision = ?, hdc_comments = ?, status = ? WHERE id = ?',
      [hdcDecision, hdcComments, newStatus, proposalId]
    )

    // Find which student this proposal belongs to
    const [rows] = await poolPromise.query(
      'SELECT student_id FROM proposals WHERE id = ?',
      [proposalId]
    )
    const studentId = rows.length > 0 ? rows[0].student_id : null

    // Notify the student of the committee's decision
    if (studentId) {
      if (hdcDecision === 'approved') {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [
            studentId,
            'Proposal Approved by HDC',
            'Your research proposal has been approved. Your next step is to upload your signed ethics clearance form on the proposal page.'
          ]
        )
      } else {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [
            studentId,
            'Proposal Not Approved by HDC',
            'The Higher Degrees Committee did not approve your proposal. Open it to read their feedback, then revise and resubmit.'
          ]
        )
      }
    }

    res.json({ message: 'HDC decision recorded successfully!' })

  } catch (err) {
    console.error('HDC decision error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// PUT /api/proposals/resubmit/:proposalId
// Student resubmits a rejected proposal
router.put('/resubmit/:proposalId', async (req, res) => {
  const { proposalId } = req.body
  const { title, description, fileName } = req.body

  try {
    await poolPromise.query(
      `UPDATE proposals 
       SET title = ?, description = ?, file_name = ?, 
       status = 'Pending HDC Review', hdc_decision = 'Pending',
       hdc_comments = NULL, submitted_at = NOW()
       WHERE id = ?`,
      [title, description, fileName, proposalId]
    )
    res.json({ message: 'Proposal resubmitted successfully!' })
  } catch (err) {
    console.error('Resubmit error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/proposals/supervisor-review/:proposalId
// Supervisor approves or rejects proposal
router.put('/supervisor-review/:proposalId', async (req, res) => {

  const { proposalId } = req.params
  const { supervisorStatus, supervisorComments } = req.body

  try {

    // Update supervisor status
    await poolPromise.query(
      `UPDATE proposals 
       SET supervisor_status = ?, supervisor_comments = ?
       WHERE id = ?`,
      [supervisorStatus, supervisorComments, proposalId]
    )

    // If approved update main status to show HOD
    if (supervisorStatus === 'approved') {
      await poolPromise.query(
        `UPDATE proposals SET status = 'Pending HDC Review' WHERE id = ?`,
        [proposalId]
      )
    } else {
      // If rejected keep status as pending supervisor
      await poolPromise.query(
        `UPDATE proposals SET status = 'Revision Required' WHERE id = ?`,
        [proposalId]
      )
    }

    // Get proposal details for notification
    const [proposalRows] = await poolPromise.query(
      `SELECT p.*, u.name as student_name 
       FROM proposals p 
       JOIN users u ON p.student_id = u.id 
       WHERE p.id = ?`,
      [proposalId]
    )

    const proposal = proposalRows[0]

    // Notify student
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        proposal.student_id,
        supervisorStatus === 'approved'
          ? '✅ Proposal Approved by Supervisor'
          : '❌ Proposal Needs Revision',
    supervisorStatus === 'approved'
          ? 'Your research proposal has been approved by your supervisor and forwarded to the HOD for HDC review.'
          : 'Your supervisor has requested revisions to your proposal. Open it to read their full feedback.'
      ]
    )

    res.json({ message: `Proposal ${supervisorStatus} successfully!` })

  } catch (err) {
    console.error('Supervisor review error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// PUT /api/proposals/resubmit-version/:proposalId
// Student resubmits with new version
router.put('/resubmit-version/:proposalId', async (req, res) => {
  const { proposalId } = req.params
  const { title, description, fileName } = req.body

  try {
    // Get current proposal
    const [rows] = await poolPromise.query(
      'SELECT * FROM proposals WHERE id = ?',
      [proposalId]
    )
    const current = rows[0]
    const newVersion = current.version + 1

    // Insert NEW record for new version
    await poolPromise.query(
      `INSERT INTO proposals 
       (student_id, title, description, file_name, status, supervisor_status, version)
       VALUES (?, ?, ?, ?, 'Pending Supervisor Review', 'Pending', ?)`,
      [current.student_id, title, description, fileName, newVersion]
    )

    // Get student info for notification
    const [studentRows] = await poolPromise.query(
      'SELECT name, supervisor_id FROM users WHERE id = ?',
      [current.student_id]
    )
    const student = studentRows[0]

// Work out why it's coming back, so the supervisor has context
    const cameFromHDC = (current.status === 'Rejected') || ((current.hdc_decision || '').toLowerCase() === 'rejected')
    const reviewContext = cameFromHDC
      ? ' This proposal was returned by the HDC and the student has revised it. Please re-review it before it goes back to the committee.'
      : ' The student has revised it to address your earlier feedback. Please review.'

    // Notify supervisor with context
    if (student.supervisor_id) {
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          student.supervisor_id,
          'Proposal Resubmitted (Version ' + newVersion + ')',
          student.name + ' has resubmitted their research proposal (Version ' + newVersion + ').' + reviewContext
        ]
      )
    }

    res.json({ message: `Proposal resubmitted as Version ${newVersion}!` })

  } catch (err) {
    console.error('Resubmit error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/proposals/ethics/:proposalId
// Student uploads ethics clearance
router.put('/ethics/:proposalId', async (req, res) => {

  const { proposalId } = req.params
  const { fileName } = req.body

  try {

    await poolPromise.query(
      `UPDATE proposals 
       SET ethics_file = ?, ethics_status = 'Submitted'
       WHERE id = ?`,
      [fileName, proposalId]
    )

    // Get proposal details for notification
    const [rows] = await poolPromise.query(
      `SELECT p.*, u.name as student_name, u.supervisor_id
       FROM proposals p
       JOIN users u ON p.student_id = u.id
       WHERE p.id = ?`,
      [proposalId]
    )

    const proposal = rows[0]

    // Notify supervisor
    if (proposal.supervisor_id) {
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          proposal.supervisor_id,
          '📋 Ethics Clearance Submitted',
          `${proposal.student_name} has submitted their ethics clearance form.`
        ]
      )
    }

    res.json({ message: 'Ethics clearance submitted successfully!' })

  } catch (err) {
    console.error('Ethics upload error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/proposals/versions/:studentId
// Get all versions of a student's proposal
router.get('/versions/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    const [rows] = await poolPromise.query(
      `SELECT id, title, version, status, supervisor_status, 
       supervisor_comments, submitted_at, file_name
       FROM proposals 
       WHERE student_id = ?
       ORDER BY version ASC`,
      [studentId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/proposals/ethics-review/:proposalId
// HOD confirms the ethics clearance is on file, or asks for a correct document
router.put('/ethics-review/:proposalId', async (req, res) => {

  const { proposalId } = req.params
  const { ethicsStatus } = req.body  // 'Verified' or 'Resubmit'

  try {

    await poolPromise.query(
      'UPDATE proposals SET ethics_status = ? WHERE id = ?',
      [ethicsStatus, proposalId]
    )

    const [rows] = await poolPromise.query(
      'SELECT student_id FROM proposals WHERE id = ?',
      [proposalId]
    )
    const studentId = rows.length > 0 ? rows[0].student_id : null

    if (studentId) {
      if (ethicsStatus === 'Verified') {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [studentId, 'Ethics Clearance Confirmed',
           'Your ethics clearance has been confirmed and is on file. You may proceed with your research.']
        )
      } else {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [studentId, 'Ethics Clearance — Action Needed',
           'Your uploaded ethics clearance could not be accepted. Please re-upload a valid, signed ethics clearance certificate on your proposal page.']
        )
      }
    }

    res.json({ message: 'Ethics review updated.' })

  } catch (err) {
    console.error('Ethics review error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/proposals/faculty?facultyId=X
// Coordinator-approved proposals awaiting (or holding) faculty-level approval
router.get('/faculty', async (req, res) => {
  const { facultyId } = req.query
  try {
    let query =
      "SELECT p.*, u.name as student_name, u.degree, u.faculty_id, " +
      "sup.name as supervisor_name, fac.name as faculty_approver_name " +
      "FROM proposals p " +
      "JOIN users u ON p.student_id = u.id " +
      "LEFT JOIN users sup ON u.supervisor_id = sup.id " +
      "LEFT JOIN users fac ON p.faculty_approved_by = fac.id " +
      "WHERE p.hdc_decision = 'approved' " +
      "AND p.version = (SELECT MAX(p2.version) FROM proposals p2 WHERE p2.student_id = p.student_id)"
    const params = []
    if (facultyId) {
      query += ' AND u.faculty_id = ?'
      params.push(facultyId)
    }
    query += ' ORDER BY p.submitted_at DESC'
    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    console.error('Faculty proposals error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/proposals/faculty-approve/:proposalId
// Faculty Rep records the outcome of the HDC meeting (the Rep relays, the HDC decides)
router.put('/faculty-approve/:proposalId', async (req, res) => {
  const { proposalId } = req.params
  const { approverId, decision, comments } = req.body
  try {
    const facultyStatus = decision === 'approved' ? 'Approved' : 'Revision'
    await poolPromise.query(
      'UPDATE proposals SET faculty_status = ?, faculty_approved_by = ?, faculty_comments = ?, faculty_approved_at = NOW() WHERE id = ?',
      [facultyStatus, approverId, comments || null, proposalId]
    )

    if (decision === 'approved') {
      await poolPromise.query("UPDATE proposals SET status = 'Approved' WHERE id = ?", [proposalId])
    } else {
      // Revisions: send it back so the student can revise and resubmit; surface the committee comments
      await poolPromise.query(
        "UPDATE proposals SET status = 'Revision Required', hdc_comments = ? WHERE id = ?",
        [comments || null, proposalId]
      )
    }

    const [rows] = await poolPromise.query(
      'SELECT p.student_id, u.name as student_name, u.supervisor_id FROM proposals p JOIN users u ON p.student_id = u.id WHERE p.id = ?',
      [proposalId]
    )
    if (rows.length > 0) {
      const studentId = rows[0].student_id
      const supervisorId = rows[0].supervisor_id
      const studentName = rows[0].student_name

      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          studentId,
          decision === 'approved' ? 'Proposal Approved by HDC' : 'HDC Requested Revisions',
          decision === 'approved'
            ? 'Your proposal has been approved by the Higher Degrees Committee.'
            : 'The Higher Degrees Committee has requested revisions to your proposal. Open your proposal to read the feedback, then revise and resubmit a new version.'
        ]
      )

      if (decision !== 'approved' && supervisorId) {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [
            supervisorId,
            'HDC Requested Revisions',
            'The HDC requested revisions on ' + studentName + "'s proposal. Please guide the revision; the student will resubmit a new version."
          ]
        )
      }
    }

    res.json({ message: 'HDC outcome recorded.' })
  } catch (err) {
    console.error('Faculty approve error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/proposals/assign-evaluator
// Coordinator assigns an evaluator to review a proposal (feedback only, no grading)
router.post('/assign-evaluator', async (req, res) => {
  const { proposalId, evaluatorId } = req.body
  try {
    const [existing] = await poolPromise.query(
      'SELECT id FROM proposal_reviews WHERE proposal_id = ? AND evaluator_id = ?',
      [proposalId, evaluatorId]
    )
    if (existing.length > 0) {
      return res.status(400).json({ message: 'This evaluator is already assigned to this proposal.' })
    }
    await poolPromise.query(
      'INSERT INTO proposal_reviews (proposal_id, evaluator_id) VALUES (?, ?)',
      [proposalId, evaluatorId]
    )
    const [pr] = await poolPromise.query(
      'SELECT p.title, u.name as student_name FROM proposals p JOIN users u ON p.student_id = u.id WHERE p.id = ?',
      [proposalId]
    )
    const title = pr.length > 0 ? pr[0].title : 'a proposal'
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [evaluatorId, 'Proposal to Review',
       'You have been assigned to review the proposal "' + title + '". Please provide feedback and your decision.']
    )
    res.json({ message: 'Evaluator assigned successfully!' })
  } catch (err) {
    console.error('Assign evaluator error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/proposals/reviews-all?departmentId=X
// All proposal reviews in a department (coordinator overview)
router.get('/reviews-all', async (req, res) => {
  const { departmentId } = req.query
  try {
    let query =
      "SELECT pr.id, pr.proposal_id, pr.evaluator_id, pr.feedback, pr.status, " +
      "ev.name as evaluator_name, p.title as proposal_title, p.student_id, u.name as student_name " +
      "FROM proposal_reviews pr " +
      "JOIN proposals p ON pr.proposal_id = p.id " +
      "JOIN users u ON p.student_id = u.id " +
      "LEFT JOIN users ev ON pr.evaluator_id = ev.id"
    const params = []
    if (departmentId) {
      query += ' WHERE u.department_id = ?'
      params.push(departmentId)
    }
    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    console.error('Reviews-all error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/proposals/my-reviews/:evaluatorId
// Proposals assigned to this evaluator for review
router.get('/my-reviews/:evaluatorId', async (req, res) => {
  const { evaluatorId } = req.params
  try {
    const [rows] = await poolPromise.query(
      "SELECT pr.id as review_id, pr.proposal_id, pr.feedback, pr.status, " +
      "p.title, p.description, p.file_name, p.student_id, " +
      "u.name as student_name, u.degree as degree " +
      "FROM proposal_reviews pr " +
      "JOIN proposals p ON pr.proposal_id = p.id " +
      "JOIN users u ON p.student_id = u.id " +
      "WHERE pr.evaluator_id = ? " +
      "ORDER BY pr.created_at DESC",
      [evaluatorId]
    )
    res.json(rows)
  } catch (err) {
    console.error('My-reviews error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/proposals/submit-review/:reviewId
// Evaluator submits feedback or approves (no marks at proposal stage)
router.put('/submit-review/:reviewId', async (req, res) => {
  const { reviewId } = req.params
  const { feedback, status } = req.body
  try {
    await poolPromise.query(
      'UPDATE proposal_reviews SET feedback = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [feedback, status, reviewId]
    )
    const [rows] = await poolPromise.query(
      "SELECT p.title, u.supervisor_id, u.name as student_name " +
      "FROM proposal_reviews pr " +
      "JOIN proposals p ON pr.proposal_id = p.id " +
      "JOIN users u ON p.student_id = u.id " +
      "WHERE pr.id = ?",
      [reviewId]
    )
    if (rows.length > 0 && rows[0].supervisor_id) {
      const verb = status === 'Approved' ? 'approved' : 'gave feedback on'
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [rows[0].supervisor_id, 'Proposal Evaluator Update',
         'An evaluator ' + verb + ' the proposal "' + rows[0].title + '" by ' + rows[0].student_name + '.']
      )
    }
    res.json({ message: status === 'Approved' ? 'Proposal approved!' : 'Feedback submitted!' })
  } catch (err) {
    console.error('Submit review error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/proposals/submit-to-faculty/:proposalId
// Coordinator forwards a proposal to the Faculty Rep once it has >= 2 evaluator approvals
router.put('/submit-to-faculty/:proposalId', async (req, res) => {
  const { proposalId } = req.params
  try {
    const [approvals] = await poolPromise.query(
      "SELECT COUNT(*) as count FROM proposal_reviews WHERE proposal_id = ? AND status = 'Approved'",
      [proposalId]
    )
    if (approvals[0].count < 2) {
      return res.status(400).json({ message: 'This proposal needs at least 2 evaluator approvals before it can be submitted.' })
    }
    await poolPromise.query(
      "UPDATE proposals SET hdc_decision = 'approved', status = 'Submitted to Faculty' WHERE id = ?",
      [proposalId]
    )
    const [rows] = await poolPromise.query(
      "SELECT p.title, u.faculty_id, u.name as student_name " +
      "FROM proposals p JOIN users u ON p.student_id = u.id WHERE p.id = ?",
      [proposalId]
    )
    if (rows.length > 0 && rows[0].faculty_id) {
      const [reps] = await poolPromise.query(
        "SELECT id FROM users WHERE role = 'faculty_rep' AND faculty_id = ?",
        [rows[0].faculty_id]
      )
      for (const rep of reps) {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [rep.id, 'Proposal Submitted for HDC',
           'The proposal "' + rows[0].title + '" by ' + rows[0].student_name + ' has been submitted for the HDC meeting.']
        )
      }
    }
    res.json({ message: 'Proposal submitted to the Faculty Representative.' })
  } catch (err) {
    console.error('Submit to faculty error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/proposals/supervisor-feedback/:supervisorId
// Evaluator feedback on proposals of this supervisor's (or co-supervisor's) students — read-only
router.get('/supervisor-feedback/:supervisorId', async (req, res) => {
  const { supervisorId } = req.params
  try {
    const [rows] = await poolPromise.query(
      "SELECT pr.id as review_id, pr.proposal_id, pr.feedback, pr.status, " +
      "ev.name as evaluator_name, " +
      "p.title as proposal_title, u.name as student_name, u.degree as degree " +
      "FROM proposal_reviews pr " +
      "JOIN proposals p ON pr.proposal_id = p.id " +
      "JOIN users u ON p.student_id = u.id " +
      "LEFT JOIN users ev ON pr.evaluator_id = ev.id " +
      "WHERE (u.supervisor_id = ? OR u.co_supervisor_id = ?) " +
      "ORDER BY p.id DESC, pr.id ASC",
      [supervisorId, supervisorId]
    )
    res.json(rows)
  } catch (err) {
    console.error('Supervisor feedback error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/proposals/ethics-form/:id  (student submits the in-system ethics application)
router.put('/ethics-form/:id', async (req, res) => {
  const { id } = req.params
  const { involvesHumans, dataMethods, risks, consentProcess, dataProtection, consentFileName } = req.body
  try {
    await poolPromise.query(
      "UPDATE proposals SET ethics_involves_humans = ?, ethics_data_methods = ?, ethics_risks = ?, " +
      "ethics_consent_process = ?, ethics_data_protection = ?, ethics_file = ?, ethics_status = 'Submitted' WHERE id = ?",
      [involvesHumans || null, dataMethods || null, risks || null, consentProcess || null, dataProtection || null, consentFileName || null, id]
    )
    res.json({ message: 'Ethics application submitted.' })
  } catch (err) {
    console.error('Ethics form error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})



// PUT /api/proposals/return-for-revision/:proposalId
// Coordinator sends a proposal back to the student when evaluators want changes (no 2 approvals)
router.put('/return-for-revision/:proposalId', async (req, res) => {
  const { proposalId } = req.params
  try {
    await poolPromise.query(
      "UPDATE proposals SET status = 'Revision Required' WHERE id = ?",
      [proposalId]
    )
    const [rows] = await poolPromise.query(
      "SELECT p.title, u.id as student_id, u.name as student_name, u.supervisor_id " +
      "FROM proposals p JOIN users u ON p.student_id = u.id WHERE p.id = ?",
      [proposalId]
    )
    if (rows.length > 0) {
      const r = rows[0]
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [r.student_id, 'Proposal — Revisions Requested',
         'The evaluators have requested revisions to your proposal. Please revise it with your supervisor and resubmit a new version.']
      )
      if (r.supervisor_id) {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [r.supervisor_id, 'Proposal Returned for Revision',
           'The evaluators requested revisions on ' + r.student_name + "'s proposal. Please guide the revision; the student will resubmit a new version."]
        )
      }
    }
    res.json({ message: 'Proposal returned to the student for revision.' })
  } catch (err) {
    console.error('Return for revision error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router