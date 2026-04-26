// backend/server.js
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Import routes
const authRoutes = require('./routes/auth')
const progressRoutes = require('./routes/progress')
const periodRoutes = require('./routes/periods')

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/periods', periodRoutes)

// Test route
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