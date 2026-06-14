// backend/routes/theses.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/theses/submit
// Student submits thesis
router.post('/submit', async (req, res) => {

  const { studentId, title, abstract, fileName } = req.body

  try {

    // Check if student already submitted a thesis
    const [existing] = await poolPromise.query(
      'SELECT * FROM theses WHERE student_id = ?',
      [studentId]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'You have already submitted your thesis.'
      })
    }

   // Insert thesis - start it in supervisor review explicitly (don't rely on the column default)
    await poolPromise.query(
      'INSERT INTO theses (student_id, title, abstract, file_name, status, supervisor_status) VALUES (?, ?, ?, ?, ?, ?)',
      [studentId, title, abstract, fileName, 'Pending Supervisor Review', 'Pending']
    )

    // Get student name + their assigned supervisor(s) to notify
    const [studentRows] = await poolPromise.query(
      'SELECT name, supervisor_id, co_supervisor_id FROM users WHERE id = ?',
      [studentId]
    )
    const studentName = studentRows[0].name
    const supervisorId = studentRows[0].supervisor_id
    const coSupervisorId = studentRows[0].co_supervisor_id

    // Notify ONLY the assigned supervisor (and co-supervisor) - they review first
    if (supervisorId) {
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [supervisorId, 'New Thesis Submitted', studentName + ' has submitted their thesis titled "' + title + '". Please review it.']
      )
    }
    if (coSupervisorId) {
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [coSupervisorId, 'New Thesis Submitted', studentName + ' has submitted their thesis titled "' + title + '". Please review it.']
      )
    }

    res.json({ message: 'Thesis submitted successfully!' })

  } catch (err) {
    console.error('Thesis error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

router.get('/all', async (req, res) => {
  const { departmentId } = req.query
  try {
    let query = `SELECT t.*, u.name as student_name, u.degree, u.department_id
       FROM theses t
       JOIN users u ON t.student_id = u.id
       WHERE t.supervisor_status = 'approved'`
    const params = []
    if (departmentId) {
      query += ' AND u.department_id = ?'
      params.push(departmentId)
    }
    query += ' ORDER BY t.submitted_at DESC'
    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/theses/student/:studentId
// Student views their own thesis
router.get('/student/:studentId', async (req, res) => {

  const { studentId } = req.params

  try {

  const [rows] = await poolPromise.query(
      'SELECT * FROM theses WHERE student_id = ? ORDER BY version DESC',
      [studentId]
    )

    res.json(rows)

  } catch (err) {
    console.error('Fetch thesis error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// PUT /api/theses/status/:thesisId
// HOD updates thesis status
router.put('/status/:thesisId', async (req, res) => {

  const { thesisId } = req.params
  const { status } = req.body

  try {

    await poolPromise.query(
      'UPDATE theses SET status = ? WHERE id = ?',
      [status, thesisId]
    )

    res.json({ message: 'Thesis status updated successfully!' })

  } catch (err) {
    console.error('Update thesis error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// PUT /api/theses/supervisor-review/:thesisId
// Supervisor approves or rejects thesis
router.put('/supervisor-review/:thesisId', async (req, res) => {

  const { thesisId } = req.params
  const { supervisorStatus, supervisorComments } = req.body

  try {

    await poolPromise.query(
      `UPDATE theses 
       SET supervisor_status = ?, supervisor_comments = ?
       WHERE id = ?`,
      [supervisorStatus, supervisorComments, thesisId]
    )

    if (supervisorStatus === 'approved') {
      await poolPromise.query(
        `UPDATE theses 
         SET status = 'Awaiting Examiner Assignment' 
         WHERE id = ?`,
        [thesisId]
      )
    } else {
      await poolPromise.query(
        `UPDATE theses SET status = 'Revision Required' WHERE id = ?`,
        [thesisId]
      )
    }

    // Get thesis details
    const [thesisRows] = await poolPromise.query(
      `SELECT t.*, u.name as student_name 
       FROM theses t 
       JOIN users u ON t.student_id = u.id 
       WHERE t.id = ?`,
      [thesisId]
    )

    const thesis = thesisRows[0]

    // Notify student
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        thesis.student_id,
        supervisorStatus === 'approved'
          ? '✅ Thesis Approved by Supervisor'
          : '❌ Thesis Needs Revision',
        supervisorStatus === 'approved'
          ? `Your thesis has been approved by your supervisor. The grading process will now begin.`
          : `Your supervisor has reviewed your thesis and requested revisions. Comments: ${supervisorComments}`
      ]
    )

    // If approved, notify ONLY the HOD in the student's own department
    if (supervisorStatus === 'approved') {
      const [deptRows] = await poolPromise.query(
        'SELECT department_id FROM users WHERE id = ?',
        [thesis.student_id]
      )
      const studentDeptId = deptRows[0].department_id

      const [hods] = await poolPromise.query(
        "SELECT id FROM users WHERE role = 'hod' AND department_id = ?",
        [studentDeptId]
      )
      for (const hod of hods) {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [hod.id, '🎓 Thesis Ready for Examiner Assignment', thesis.student_name + "'s thesis has been approved by the supervisor and is ready for examiner assignment."]
        )
      }
    }

    res.json({ message: `Thesis ${supervisorStatus} successfully!` })

  } catch (err) {
    console.error('Thesis supervisor review error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/theses/versions/:studentId
router.get('/versions/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    const [rows] = await poolPromise.query(
      `SELECT id, title, version, status, supervisor_status,
       supervisor_comments, submitted_at, file_name
       FROM theses
       WHERE student_id = ?
       ORDER BY version ASC`,
      [studentId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/theses/resubmit-version/:thesisId
// Student resubmits their thesis as a new version
router.put('/resubmit-version/:thesisId', async (req, res) => {
  const { thesisId } = req.params
  const { title, abstract, fileName } = req.body

  try {
    // Get the current (rejected) thesis
    const [rows] = await poolPromise.query(
      'SELECT * FROM theses WHERE id = ?',
      [thesisId]
    )
    const current = rows[0]
    const newVersion = current.version + 1

    // Insert a NEW row for the new version - back to supervisor review
    await poolPromise.query(
      `INSERT INTO theses 
       (student_id, title, abstract, file_name, status, supervisor_status, version)
       VALUES (?, ?, ?, ?, 'Pending Supervisor Review', 'Pending', ?)`,
      [current.student_id, title, abstract, fileName, newVersion]
    )

    // Notify the supervisor with context
    const [studentRows] = await poolPromise.query(
      'SELECT name, supervisor_id FROM users WHERE id = ?',
      [current.student_id]
    )
    const student = studentRows[0]

    if (student.supervisor_id) {
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          student.supervisor_id,
          'Thesis Resubmitted (Version ' + newVersion + ')',
          student.name + ' has resubmitted their thesis (Version ' + newVersion + ') addressing your feedback. Please review.'
        ]
      )
    }

    res.json({ message: 'Thesis resubmitted as Version ' + newVersion + '!' })

  } catch (err) {
    console.error('Thesis resubmit error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router