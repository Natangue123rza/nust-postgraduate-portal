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

    await poolPromise.query(
      `UPDATE proposals 
       SET hdc_decision = ?, hdc_comments = ?, 
       status = ? 
       WHERE id = ?`,
      [
        hdcDecision, 
        hdcComments,
        hdcDecision === 'approved' ? 'Approved' : 'Rejected',
        proposalId
      ]
    )

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

    // Notify supervisor
    if (student.supervisor_id) {
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          student.supervisor_id,
          '📄 Proposal Resubmitted',
          `${student.name} has resubmitted their research proposal (Version ${newVersion}). Please review it.`
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

module.exports = router