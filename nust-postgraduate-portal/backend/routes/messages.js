// backend/routes/messages.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/messages/send
router.post('/send', async (req, res) => {
  const { senderId, recipientId, subject, body } = req.body
  try {
    if (!recipientId || !body) {
      return res.status(400).json({ message: 'Recipient and message are required.' })
    }
    await poolPromise.query(
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
      [senderId, recipientId, subject || '(No subject)', body]
    )
    const [rows] = await poolPromise.query('SELECT name FROM users WHERE id = ?', [senderId])
    const senderName = rows.length ? rows[0].name : 'A colleague'
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [recipientId, 'New message from ' + senderName, subject || '(No subject)']
    )
    res.json({ message: 'Message sent.' })
  } catch (err) {
    console.error('Send message error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/messages/inbox/:userId
router.get('/inbox/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const [rows] = await poolPromise.query(
      "SELECT m.*, u.name as sender_name, u.role as sender_role " +
      "FROM messages m JOIN users u ON m.sender_id = u.id " +
      "WHERE m.recipient_id = ? ORDER BY m.created_at DESC",
      [userId]
    )
    res.json(rows)
  } catch (err) {
    console.error('Inbox error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/messages/sent/:userId
router.get('/sent/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const [rows] = await poolPromise.query(
      "SELECT m.*, u.name as recipient_name, u.role as recipient_role " +
      "FROM messages m JOIN users u ON m.recipient_id = u.id " +
      "WHERE m.sender_id = ? ORDER BY m.created_at DESC",
      [userId]
    )
    res.json(rows)
  } catch (err) {
    console.error('Sent error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/messages/read/:messageId
router.put('/read/:messageId', async (req, res) => {
  const { messageId } = req.params
  try {
    await poolPromise.query('UPDATE messages SET is_read = 1 WHERE id = ?', [messageId])
    res.json({ message: 'Marked as read.' })
  } catch (err) {
    console.error('Mark read error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/messages/recipients  (everyone a staff member can message)
router.get('/recipients', async (req, res) => {
  try {
    const [rows] = await poolPromise.query(
      "SELECT id, name, role FROM users " +
      "WHERE role IN ('supervisor','coordinator','faculty_rep','examiner','super_admin') " +
      "ORDER BY name ASC"
    )
    res.json(rows)
  } catch (err) {
    console.error('Recipients error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router