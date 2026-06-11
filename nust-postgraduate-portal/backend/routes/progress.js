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
    onBudget,
    adjustments,
    challenges,
    risks,
    studentComments
  } = req.body

  try {

    // Block if there is an unreviewed report (must be reviewed before next)
    const [pending] = await poolPromise.query(
      `SELECT * FROM progress_reports 
       WHERE student_id = ? 
       AND (supervisor_comments IS NULL OR supervisor_comments = '')`,
      [studentId]
    )

    if (pending.length > 0) {
      return res.status(400).json({
        message: 'Your previous progress report is still awaiting supervisor review. You cannot submit a new report until it has been reviewed.'
      })
    }

    // Determine next report number from how many reports exist
    const [countRows] = await poolPromise.query(
      'SELECT COUNT(*) as count FROM progress_reports WHERE student_id = ?',
      [studentId]
    )
    const reportNumber = countRows[0].count + 1

      // Auto calculate on_schedule
// Check if submitted before the progress report deadline
let onSchedule = 'no'
let onTarget = 'no'

// Check deadline
const [deadlineRows] = await poolPromise.query(
  "SELECT deadline_date FROM deadlines WHERE deadline_type = 'progressReport'"
)

if (deadlineRows.length > 0) {
  const deadline = new Date(deadlineRows[0].deadline_date)
  const now = new Date()
  onSchedule = now <= deadline ? 'yes' : 'no'
} else {
  // No deadline set - assume on schedule
  onSchedule = 'yes'
}

// Check on target - did supervisor review previous report?
const [previousReports] = await poolPromise.query(
  `SELECT * FROM progress_reports 
   WHERE student_id = ? 
   AND supervisor_comments IS NOT NULL 
   AND supervisor_comments != ''`,
  [studentId]
)

onTarget = previousReports.length > 0 ? 'yes' : 'no'
    // Get student name
const [studentRows] = await poolPromise.query(
  'SELECT name FROM users WHERE id = ?',
  [studentId]
)
const studentName = studentRows[0].name
    // Get supervisor to notify
// Looks up THIS student's assigned supervisor + co-supervisor only
const [supRows] = await poolPromise.query(
  'SELECT supervisor_id, co_supervisor_id FROM users WHERE id = ?',
  [studentId]
)
const supervisorId = supRows[0].supervisor_id
const coSupervisorId = supRows[0].co_supervisor_id

    // Insert new report into database
   await poolPromise.query(
      `INSERT INTO progress_reports 
      (student_id, semester, report_number, research_problem, objectives, 
      activities_completed, activities_in_progress, activities_outstanding,
      on_schedule, on_budget, on_target, adjustments, challenges, 
      risks, student_comments) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId, semester, reportNumber, researchProblem, objectives,
        activitiesCompleted, activitiesInProgress, activitiesOutstanding,
        onSchedule, onBudget, onTarget, adjustments, challenges,
        risks, studentComments
      ]
    )
  

// Notify ONLY the assigned supervisor (and co-supervisor if one exists)
if (supervisorId) {
  await poolPromise.query(
    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
    [supervisorId, 'New Progress Report', studentName + ' has submitted Progress Report ' + reportNumber + '. Please review and add your comments.']
  )
}
if (coSupervisorId) {
  await poolPromise.query(
    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
    [coSupervisorId, 'New Progress Report', studentName + ' has submitted Progress Report ' + reportNumber + '. Please review and add your comments.']
  )
}

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
  const { departmentId } = req.query
  try {
    let query = `SELECT pr.*, u.name as student_name, u.degree, u.department_id
       FROM progress_reports pr
       JOIN users u ON pr.student_id = u.id`
    const params = []
    if (departmentId) {
      query += ' WHERE u.department_id = ?'
      params.push(departmentId)
    }
    query += ' ORDER BY pr.submitted_at DESC'
    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
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