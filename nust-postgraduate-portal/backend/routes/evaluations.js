// backend/routes/evaluations.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/evaluations/submit
// Examiner submits evaluation
router.post('/submit', async (req, res) => {

  const {
    studentId,
    examinerId,
    examinerType,
    sectionA,
    sectionB,
    sectionC,
    sectionD,
    sectionE,
    totalMark,
    overallAssessment,
    recommendation,
    commentA,
    commentB,
    commentC,
    commentD,
    commentE
  } = req.body

  try {

    // Check if examiner already evaluated this student
    const [existing] = await poolPromise.query(
      'SELECT * FROM evaluations WHERE student_id = ? AND examiner_id = ?',
      [studentId, examinerId]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'You have already submitted an evaluation for this student.'
      })
    }

    // Insert evaluation
    await poolPromise.query(
      `INSERT INTO evaluations 
      (student_id, examiner_id, examiner_type, section_a, section_b, 
      section_c, section_d, section_e, total_mark, overall_assessment, 
      recommendation, comment_a, comment_b, comment_c, comment_d, comment_e) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId, examinerId, examinerType,
        sectionA, sectionB, sectionC, sectionD, sectionE,
        totalMark, overallAssessment, recommendation,
        commentA, commentB, commentC, commentD, commentE
      ]
    )

    // Notify the student
await poolPromise.query(
  'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
  [
    studentId,
    'Thesis Evaluated',
    `Your thesis has been evaluated by an examiner. Log in to view your results and final mark.`
  ]
)

    // Check if we can calculate final mark
    // Get student degree
    const [studentRows] = await poolPromise.query(
      'SELECT degree FROM users WHERE id = ?',
      [studentId]
    )

    const degree = studentRows[0].degree

    // Get all evaluations for this student
    const [evaluations] = await poolPromise.query(
      'SELECT * FROM evaluations WHERE student_id = ?',
      [studentId]
    )

    let finalMarkMessage = ''

    if (degree === 'Masters') {
      // Masters - single mark is final
      finalMarkMessage = `Final mark: ${totalMark}/100`

    } else if (degree === 'PhD' && evaluations.length === 2) {
      // PhD - calculate average if both examiners submitted
      const mark1 = evaluations[0].total_mark
      const mark2 = evaluations[1].total_mark
      const difference = Math.abs(mark1 - mark2)

      if (difference > 10) {
        finalMarkMessage = `⚠️ Mark discrepancy of ${difference} points — requires HOD review`
      } else {
        const average = Math.round((mark1 + mark2) / 2)
        finalMarkMessage = `Final mark: ${average}/100 (average of ${mark1} and ${mark2})`
      }

    } else if (degree === 'PhD' && evaluations.length === 1) {
      finalMarkMessage = 'Waiting for second examiner mark'
    }

    res.json({ 
      message: 'Evaluation submitted successfully!',
      finalMarkMessage
    })

  } catch (err) {
    console.error('Evaluation error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/evaluations/student/:studentId
// Get all evaluations for a student
// GET /api/evaluations/student/:studentId
// Only returns RELEASED evaluations to student
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    const [rows] = await poolPromise.query(
      `SELECT e.*, u.name as examiner_name 
       FROM evaluations e
       JOIN users u ON e.examiner_id = u.id
       WHERE e.student_id = ? 
       AND e.is_released = TRUE
       AND e.is_voided = FALSE`,
      [studentId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})



// GET /api/evaluations/all
// HOD views all evaluations with student and examiner details
router.get('/all', async (req, res) => {
  const { departmentId } = req.query
  try {
    let query = `SELECT e.*, 
       u1.name as student_name, u1.degree, u1.department_id,
       u2.name as examiner_name
       FROM evaluations e
       JOIN users u1 ON e.student_id = u1.id
       JOIN users u2 ON e.examiner_id = u2.id`
    const params = []
    if (departmentId) {
      query += ' WHERE u1.department_id = ?'
      params.push(departmentId)
    }
    query += ' ORDER BY e.submitted_at DESC'
    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/evaluations/release/:studentId
// HOD releases marks to student
router.put('/release/:studentId', async (req, res) => {

  const { studentId } = req.params

  try {

    // Mark all evaluations for this student as released
    await poolPromise.query(
      `UPDATE evaluations 
       SET is_released = TRUE, released_at = NOW() 
       WHERE student_id = ?`,
      [studentId]
    )

    // Get student info for notification
    const [studentRows] = await poolPromise.query(
      'SELECT name FROM users WHERE id = ?',
      [studentId]
    )
    const studentName = studentRows[0].name

    // Notify student
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        studentId,
        '🎓 Results Released',
        'Your thesis examination results have been released by the HOD. Log in to view your final mark and examiner feedback.'
      ]
    )

    res.json({ message: `Results released for ${studentName}` })

  } catch (err) {
    console.error('Release error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/evaluations/examiner/:examinerId
// Get all evaluations submitted by this examiner
router.get('/examiner/:examinerId', async (req, res) => {

  const { examinerId } = req.params

  try {

    const [rows] = await poolPromise.query(
      `SELECT e.*, u.name as student_name, u.degree
       FROM evaluations e
       JOIN users u ON e.student_id = u.id
       WHERE e.examiner_id = ?`,
      [examinerId]
    )

    res.json(rows)

  } catch (err) {
    console.error('Fetch examiner evaluations error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// DELETE /api/evaluations/delete/:studentId
// HOD deletes evaluations for remarking
router.delete('/delete/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    // NEVER delete — mark as voided for accountability
    await poolPromise.query(
      `UPDATE evaluations 
       SET is_voided = TRUE, 
       voided_reason = 'Mark discrepancy — sent for remarking',
       voided_at = NOW()
       WHERE student_id = ?`,
      [studentId]
    )

  // We deliberately do NOT delete examiner_assignments here. The assign route
    // already clears old assignments when the HOD reassigns, so the examiner keeps
    // the student (and their voided mark stays visible) until a fresh examiner is set.

    res.json({ message: 'Evaluations voided for remarking — records kept for accountability' })
  } catch (err) {
    console.error('Void evaluations error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router