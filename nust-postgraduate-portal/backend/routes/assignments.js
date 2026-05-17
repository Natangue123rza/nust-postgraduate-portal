// backend/routes/assignments.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/assignments/assign
// HOD assigns examiners to a student
router.post('/assign', async (req, res) => {

  const { studentId, internalExaminerId, externalExaminerId } = req.body

  try {

    // Delete existing assignments for this student
    await poolPromise.query(
      'DELETE FROM examiner_assignments WHERE student_id = ?',
      [studentId]
    )

    // Insert internal examiner
    await poolPromise.query(
      'INSERT INTO examiner_assignments (student_id, examiner_id, examiner_type) VALUES (?, ?, ?)',
      [studentId, internalExaminerId, 'internal']
    )

    // Insert external examiner if PhD
    if (externalExaminerId) {
      await poolPromise.query(
        'INSERT INTO examiner_assignments (student_id, examiner_id, examiner_type) VALUES (?, ?, ?)',
        [studentId, externalExaminerId, 'external']
      )
    }

    res.json({ message: 'Examiners assigned successfully!' })

  } catch (err) {
    console.error('Assignment error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/assignments/examiner/:examinerId
// Get all students assigned to this examiner
router.get('/examiner/:examinerId', async (req, res) => {

  const { examinerId } = req.params

  try {

    const [rows] = await poolPromise.query(
      `SELECT ea.*, u.name as student_name, u.degree, u.email
       FROM examiner_assignments ea
       JOIN users u ON ea.student_id = u.id
       WHERE ea.examiner_id = ?`,
      [examinerId]
    )

    res.json(rows)

  } catch (err) {
    console.error('Fetch assignments error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/assignments/student/:studentId
// Get all examiners assigned to this student
router.get('/student/:studentId', async (req, res) => {

  const { studentId } = req.params

  try {

    const [rows] = await poolPromise.query(
      `SELECT ea.*, u.name as examiner_name, u.email
       FROM examiner_assignments ea
       JOIN users u ON ea.examiner_id = u.id
       WHERE ea.student_id = ?`,
      [studentId]
    )

    res.json(rows)

  } catch (err) {
    console.error('Fetch student assignments error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/assignments/student-documents/:studentId
// Get thesis and proposal for an assigned student
router.get('/student-documents/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    // Get proposal
    const [proposals] = await poolPromise.query(
      'SELECT * FROM proposals WHERE student_id = ?',
      [studentId]
    )

    // Get thesis
    const [theses] = await poolPromise.query(
      'SELECT * FROM theses WHERE student_id = ?',
      [studentId]
    )

    res.json({
      proposal: proposals.length > 0 ? proposals[0] : null,
      thesis: theses.length > 0 ? theses[0] : null
    })

  } catch (err) {
    console.error('Error fetching documents:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router