// backend/routes/presentations.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/presentations/schedule
router.post('/schedule', async (req, res) => {
  const { studentId, title, defenceDate, defenceTime, venue } = req.body
  try {
    await poolPromise.query(
      'INSERT INTO presentations (student_id, title, defence_date, defence_time, venue) VALUES (?, ?, ?, ?, ?)',
      [studentId, title || null, defenceDate || null, defenceTime || null, venue || null]
    )
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [studentId, 'Defence Scheduled',
       'Your thesis defence has been scheduled. Check the portal home page for the date, time and venue.']
    )
    res.json({ message: 'Defence scheduled successfully!' })
  } catch (err) {
    console.error('Schedule defence error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/presentations/upcoming  (for the home page, all faculties)
router.get('/upcoming', async (req, res) => {
  try {
    const [rows] = await poolPromise.query(
      "SELECT pr.id, pr.title, pr.defence_date, pr.defence_time, pr.venue, " +
      "u.name as student_name, u.degree " +
      "FROM presentations pr JOIN users u ON pr.student_id = u.id " +
      "WHERE pr.defence_date >= CURDATE() " +
      "ORDER BY pr.defence_date ASC, pr.defence_time ASC"
    )
    res.json(rows)
  } catch (err) {
    console.error('Upcoming presentations error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/presentations?departmentId=X  (coordinator's department)
router.get('/', async (req, res) => {
  const { departmentId } = req.query
  try {
    let query =
      "SELECT pr.id, pr.title, pr.defence_date, pr.defence_time, pr.venue, " +
      "u.name as student_name, u.degree, u.department_id " +
      "FROM presentations pr JOIN users u ON pr.student_id = u.id"
    const params = []
    if (departmentId) {
      query += ' WHERE u.department_id = ?'
      params.push(departmentId)
    }
    query += ' ORDER BY pr.defence_date ASC'
    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router