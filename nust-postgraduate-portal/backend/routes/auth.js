// backend/routes/auth.js
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()

const { poolPromise } = require('../db')

// POST /api/auth/login
router.post('/login', async (req, res) => {

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Please provide email and password' 
    })
  }

  try {

    const [rows] = await poolPromise.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      })
    }

    const user = rows[0]

    if (password !== user.password) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      })
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        degree: user.degree
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/auth/students
router.get('/students', async (req, res) => {
  try {
    const [rows] = await poolPromise.query(
      "SELECT id, name, email, degree FROM users WHERE role = 'student'"
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/examiners
router.get('/examiners', async (req, res) => {
  try {
    const [rows] = await poolPromise.query(
      "SELECT id, name, email FROM users WHERE role = 'examiner'"
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/supervisor-students/:supervisorId
router.get('/supervisor-students/:supervisorId', async (req, res) => {
  const { supervisorId } = req.params
  try {
    const [rows] = await poolPromise.query(
      "SELECT id, name, email, degree FROM users WHERE role = 'student' AND supervisor_id = ?",
      [supervisorId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router