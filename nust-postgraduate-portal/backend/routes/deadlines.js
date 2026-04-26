// backend/routes/deadlines.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/deadlines/set
// HOD sets deadlines
router.post('/set', async (req, res) => {

  const { proposal, progressReport, thesis, hodId } = req.body

  try {

    // Delete existing deadlines
    await poolPromise.query('DELETE FROM deadlines')

    // Insert new deadlines
    if (proposal) {
      await poolPromise.query(
        'INSERT INTO deadlines (deadline_type, deadline_date, set_by) VALUES (?, ?, ?)',
        ['proposal', proposal, hodId]
      )
    }

    if (progressReport) {
      await poolPromise.query(
        'INSERT INTO deadlines (deadline_type, deadline_date, set_by) VALUES (?, ?, ?)',
        ['progressReport', progressReport, hodId]
      )
    }

    if (thesis) {
      await poolPromise.query(
        'INSERT INTO deadlines (deadline_type, deadline_date, set_by) VALUES (?, ?, ?)',
        ['thesis', thesis, hodId]
      )
    }

    res.json({ message: 'Deadlines saved successfully!' })

  } catch (err) {
    console.error('Set deadlines error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/deadlines/all
// Get all deadlines
router.get('/all', async (req, res) => {

  try {

    const [rows] = await poolPromise.query(
      'SELECT * FROM deadlines'
    )

    // Convert to object format
    const deadlines = {
      proposal: '',
      progressReport: '',
      thesis: ''
    }

    rows.forEach(row => {
      deadlines[row.deadline_type] = row.deadline_date
    })

    res.json(deadlines)

  } catch (err) {
    console.error('Fetch deadlines error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

module.exports = router