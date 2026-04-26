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

    // Insert thesis
    await poolPromise.query(
      `INSERT INTO theses 
      (student_id, title, abstract, file_name) 
      VALUES (?, ?, ?, ?)`,
      [studentId, title, abstract, fileName]
    )

    res.json({ message: 'Thesis submitted successfully!' })

  } catch (err) {
    console.error('Thesis error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/theses/all
// HOD views all theses
router.get('/all', async (req, res) => {

  try {

    const [rows] = await poolPromise.query(
      `SELECT t.*, u.name as student_name, u.degree 
       FROM theses t
       JOIN users u ON t.student_id = u.id
       ORDER BY t.submitted_at DESC`
    )

    res.json(rows)

  } catch (err) {
    console.error('Fetch theses error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/theses/student/:studentId
// Student views their own thesis
router.get('/student/:studentId', async (req, res) => {

  const { studentId } = req.params

  try {

    const [rows] = await poolPromise.query(
      'SELECT * FROM theses WHERE student_id = ?',
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

module.exports = router