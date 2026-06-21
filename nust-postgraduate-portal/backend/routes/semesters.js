// backend/routes/semesters.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/semesters/add  { studentId, semesterLabel, status }
router.post('/add', async (req, res) => {
  const { studentId, semesterLabel, status } = req.body
  try {
    if (!studentId || !semesterLabel) {
      return res.status(400).json({ message: 'Student and semester are required.' })
    }
    const [existing] = await poolPromise.query(
      'SELECT id FROM student_semesters WHERE student_id = ? AND semester_label = ?',
      [studentId, semesterLabel]
    )
    if (existing.length > 0) {
      return res.status(400).json({ message: 'This semester is already recorded for the student.' })
    }
    await poolPromise.query(
      'INSERT INTO student_semesters (student_id, semester_label, status) VALUES (?, ?, ?)',
      [studentId, semesterLabel, status === 'gap' ? 'gap' : 'registered']
    )
    res.json({ message: status === 'gap' ? 'Semester marked as a gap.' : 'Semester registered.' })
  } catch (err) {
    console.error('Add semester error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/semesters/student/:studentId
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    const [rows] = await poolPromise.query(
      'SELECT * FROM student_semesters WHERE student_id = ? ORDER BY created_at ASC',
      [studentId]
    )
    res.json(rows)
  } catch (err) {
    console.error('Get semesters error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/semesters/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await poolPromise.query('DELETE FROM student_semesters WHERE id = ?', [id])
    res.json({ message: 'Record removed.' })
  } catch (err) {
    console.error('Delete semester error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router