// backend/server.js

const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
// Allows React frontend to talk to this backend
app.use(cors())

// Allows server to read JSON from requests
app.use(express.json())

// Test route - just to confirm server is running
app.get('/', (req, res) => {
  res.json({ message: '✅ NUST Portal API is running!' })
})

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const { poolPromise } = require('./db')
    const [rows] = await poolPromise.query('SELECT * FROM users')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})




// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})