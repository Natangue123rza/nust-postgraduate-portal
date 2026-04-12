// backend/routes/auth.js
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()

const { poolPromise } = require('../db')

// POST /api/auth/login
// This route handles login requests from React
router.post('/login', async (req, res) => {

  // Get email and password from request body
  const { email, password } = req.body

  // Check if email and password were provided
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Please provide email and password' 
    })
  }

  try {

    // Search database for user with matching email
    const [rows] = await poolPromise.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    // If no user found
    if (rows.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      })
    }

    // Get the user from results
    const user = rows[0]

    // Check if password matches
    // For now plain text - we'll encrypt later
    if (password !== user.password) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      })
    }

    // Create JWT token
    // This token proves the user is logged in
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    // Send back token and user info
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

module.exports = router