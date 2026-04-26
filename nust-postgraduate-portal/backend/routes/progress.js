// backend/routes/progress.js
const express = require('express')
const router = express.Router()
const { poolPromise } = require('../db')

// POST /api/progress/submit
// Student submits a progress report
router.post('/submit', async (req, res) => {

  const {
    studentId,
    semester,
    researchProblem,
    objectives,
    activitiesCompleted,
    activitiesInProgress,
    activitiesOutstanding,
    onSchedule,
    onBudget,
    onTarget,
    adjustments,
    challenges,
    risks,
    studentComments
  } = req.body

  try {

    // Check for duplicate submission
    const [existing] = await poolPromise.query(
      'SELECT * FROM progress_reports WHERE student_id = ? AND semester = ?',
      [studentId, semester]
    )

    // If report already exists for this semester
    if (existing.length > 0) {
      return res.status(400).json({
        message: `You have already submitted a progress report for ${semester}`
      })
    }

    // Insert new report into database
    await poolPromise.query(
      `INSERT INTO progress_reports 
      (student_id, semester, research_problem, objectives, 
      activities_completed, activities_in_progress, activities_outstanding,
      on_schedule, on_budget, on_target, adjustments, challenges, 
      risks, student_comments) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId, semester, researchProblem, objectives,
        activitiesCompleted, activitiesInProgress, activitiesOutstanding,
        onSchedule, onBudget, onTarget, adjustments, challenges,
        risks, studentComments
      ]
    )

    res.json({ message: 'Progress report submitted successfully!' })

  } catch (err) {
    console.error('Progress report error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/progress/student/:studentId
// Get all progress reports for a student
router.get('/student/:studentId', async (req, res) => {

  const { studentId } = req.params

  try {

    const [rows] = await poolPromise.query(
      `SELECT pr.*, u.name as student_name, u.degree 
       FROM progress_reports pr
       JOIN users u ON pr.student_id = u.id
       WHERE pr.student_id = ?
       ORDER BY pr.submitted_at DESC`,
      [studentId]
    )

    res.json(rows)

  } catch (err) {
    console.error('Fetch reports error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// GET /api/progress/all
// Get all progress reports - for HOD and Supervisor
router.get('/all', async (req, res) => {

  try {

    const [rows] = await poolPromise.query(
      `SELECT pr.*, u.name as student_name, u.degree 
       FROM progress_reports pr
       JOIN users u ON pr.student_id = u.id
       ORDER BY pr.submitted_at DESC`
    )

    res.json(rows)

  } catch (err) {
    console.error('Fetch all reports error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

// PUT /api/progress/supervisor-comment/:reportId
// Supervisor adds Section 8 comments
router.put('/supervisor-comment/:reportId', async (req, res) => {

  const { reportId } = req.params
  const { supervisorComments } = req.body

  try {

    await poolPromise.query(
      'UPDATE progress_reports SET supervisor_comments = ? WHERE id = ?',
      [supervisorComments, reportId]
    )

    res.json({ message: 'Supervisor comments saved successfully!' })

  } catch (err) {
    console.error('Supervisor comment error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})

module.exports = router