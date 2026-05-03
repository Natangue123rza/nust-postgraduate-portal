// backend/routes/notifications.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// GET /api/notifications/:userId
// Get all notifications for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const [rows] = await poolPromise.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/notifications/create
// Create a new notification
router.post('/create', async (req, res) => {
  const { userId, title, message } = req.body
  try {
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [userId, title, message]
    )
    res.json({ message: 'Notification created' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/notifications/read/:notificationId
// Mark notification as read
router.put('/read/:notificationId', async (req, res) => {
  const { notificationId } = req.params
  try {
    await poolPromise.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    )
    res.json({ message: 'Notification marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/notifications/read-all/:userId
// Mark all notifications as read
router.put('/read-all/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    await poolPromise.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    )
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router