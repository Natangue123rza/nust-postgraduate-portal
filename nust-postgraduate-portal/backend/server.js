// backend/server.js
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'))

// Import routes
const authRoutes = require('./routes/auth')
const progressRoutes = require('./routes/progress')
const periodRoutes = require('./routes/periods')
const proposalRoutes = require('./routes/proposals')
const thesisRoutes = require('./routes/theses')
const evaluationRoutes = require('./routes/evaluations')
const deadlineRoutes = require('./routes/deadlines')
const uploadRoutes = require('./routes/uploads')
const notificationRoutes = require('./routes/notifications')
const assignmentRoutes = require('./routes/assignments')

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/periods', periodRoutes)
app.use('/api/proposals', proposalRoutes)
app.use('/api/theses', thesisRoutes)
app.use('/api/evaluations', evaluationRoutes)
app.use('/api/deadlines', deadlineRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/assignments', assignmentRoutes)

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