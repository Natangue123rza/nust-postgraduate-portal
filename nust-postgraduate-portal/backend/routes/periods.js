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

// GET /api/periods/detect
// Automatically detect current semester based on date
router.get('/detect', async (req, res) => {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    let semester
    let startDate
    let endDate

    // Semester 1: February - June (ends 30 June)
    // Semester 2: July - November (ends 30 November)
    if (month >= 2 && month <= 6) {
      semester = 'Semester 1'
      startDate = `09 Feb ${year}`
      endDate = `30 Jun ${year}`
    } else if (month >= 7 && month <= 11) {
      semester = 'Semester 2'
      startDate = `13 Jul ${year}`
      endDate = `30 Nov ${year}`
    } else {
      // December or January
      semester = month === 12 ? 'Semester 2' : 'Semester 1'
      startDate = month === 12 ? `13 Jul ${year}` : `09 Feb ${year}`
      endDate = month === 12 ? `30 Nov ${year}` : `30 Jun ${year}`
    }

    // Check if active period exists
    const [existing] = await poolPromise.query(
      'SELECT * FROM academic_periods WHERE is_active = TRUE LIMIT 1'
    )

    if (existing.length === 0) {
      await poolPromise.query(
        'INSERT INTO academic_periods (academic_year, semester, is_active) VALUES (?, ?, TRUE)',
        [year.toString(), semester]
      )
    }

    res.json({
      semester,
      academic_year: year.toString(),
      start_date: startDate,
      end_date: endDate,
      message: `${semester} ${year}`
    })

  } catch (err) {
    console.error('Detect period error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router