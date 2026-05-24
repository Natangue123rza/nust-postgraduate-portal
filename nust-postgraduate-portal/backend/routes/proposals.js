// backend/routes/proposals.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/proposals/submit
// Student submits a proposal
router.post('/submit', async (req, res) => {

  const { studentId, title, description, fileName } = req.body

  try {

    // Check if student already submitted a proposal
    const [existing] = await poolPromise.query(
      'SELECT * FROM proposals WHERE student_id = ?',
      [studentId]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'You have already submitted a research proposal.'
      })
    }

    // Insert proposal
    await poolPromise.query(
      `INSERT INTO proposals 
      (student_id, title, description, file_name) 
      VALUES (?, ?, ?, ?)`,
      [studentId, title, description, fileName]
    )

    // Get student name
const [studentRows] = await poolPromise.query(
  'SELECT name FROM users WHERE id = ?',
  [studentId]
)
const studentName = studentRows[0].name

    // Get all HOD users to notify
const [hods] = await poolPromise.query(
  "SELECT id FROM users WHERE role = 'hod'"
)

// Create notification for each HOD
for (const hod of hods) {
  await poolPromise.query(
    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
    [
      hod.id,
      'New Proposal Submitted',
     `${studentName} has submitted a research proposal titled "${title}". Please review and record the HDC decision.`
    ]
  )
}

    res.json({ message: 'Proposal submitted successfully!' })

  } catch (err) {
    console.error('Proposal error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/proposals/all
// HOD views all proposals
router.get('/all', async (req, res) => {

  try {

    const [rows] = await poolPromise.query(
      `SELECT p.*, u.name as student_name, u.degree 
       FROM proposals p
       JOIN users u ON p.student_id = u.id
       ORDER BY p.submitted_at DESC`
    )

    res.json(rows)

  } catch (err) {
    console.error('Fetch proposals error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/proposals/student/:studentId
// Student views their own proposal
router.get('/student/:studentId', async (req, res) => {

  const { studentId } = req.params

  try {

    const [rows] = await poolPromise.query(
      'SELECT * FROM proposals WHERE student_id = ?',
      [studentId]
    )

    res.json(rows)

  } catch (err) {
    console.error('Fetch proposal error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// PUT /api/proposals/hdc-decision/:proposalId
// HOD records HDC decision
router.put('/hdc-decision/:proposalId', async (req, res) => {

  const { proposalId } = req.params
  const { hdcDecision, hdcComments } = req.body

  try {

    await poolPromise.query(
      `UPDATE proposals 
       SET hdc_decision = ?, hdc_comments = ?, 
       status = ? 
       WHERE id = ?`,
      [
        hdcDecision, 
        hdcComments,
        hdcDecision === 'approved' ? 'Approved' : 'Rejected',
        proposalId
      ]
    )

    res.json({ message: 'HDC decision recorded successfully!' })

  } catch (err) {
    console.error('HDC decision error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// PUT /api/proposals/resubmit/:proposalId
// Student resubmits a rejected proposal
router.put('/resubmit/:proposalId', async (req, res) => {
  const { proposalId } = req.body
  const { title, description, fileName } = req.body

  try {
    await poolPromise.query(
      `UPDATE proposals 
       SET title = ?, description = ?, file_name = ?, 
       status = 'Pending HDC Review', hdc_decision = 'Pending',
       hdc_comments = NULL, submitted_at = NOW()
       WHERE id = ?`,
      [title, description, fileName, proposalId]
    )
    res.json({ message: 'Proposal resubmitted successfully!' })
  } catch (err) {
    console.error('Resubmit error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router