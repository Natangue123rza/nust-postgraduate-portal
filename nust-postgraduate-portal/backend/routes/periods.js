// backend/routes/periods.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// GET /api/periods/active
// Get the current active academic period
router.get('/active', async (req, res) => {

  try {

    const [rows] = await poolPromise.query(
      'SELECT * FROM academic_periods WHERE is_active = TRUE LIMIT 1'
    )

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: 'No active academic period found' 
      })
    }

    res.json(rows[0])

  } catch (err) {
    console.error('Fetch period error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// POST /api/periods/set
// HOD sets a new active academic period
router.post('/set', async (req, res) => {

  const { academicYear, semester } = req.body

  try {

    // Deactivate all current periods
    await poolPromise.query(
      'UPDATE academic_periods SET is_active = FALSE'
    )

    // Insert new active period
    await poolPromise.query(
      'INSERT INTO academic_periods (academic_year, semester, is_active) VALUES (?, ?, TRUE)',
      [academicYear, semester]
    )

    res.json({ 
      message: `Academic period set to ${semester} ${academicYear}` 
    })

  } catch (err) {
    console.error('Set period error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

module.exports = router