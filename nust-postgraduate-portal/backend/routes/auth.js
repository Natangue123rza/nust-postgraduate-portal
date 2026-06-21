// backend/routes/auth.js
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()

const { poolPromise } = require('../db')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: 'Please provide email and password'
    })
  }

  try {
   const [rows] = await poolPromise.query(
      `SELECT u.*, f.name as faculty_name, d.name as department_name, p.name as programme_name
       FROM users u
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN programmes p ON u.programme_id = p.id
       WHERE u.email = ?`,
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const user = rows[0]

    if (password !== user.password) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

   res.json({
  message: 'Login successful',
  token,
 user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    degree: user.degree,
    faculty_id: user.faculty_id,
    department_id: user.department_id,
    programme_id: user.programme_id,
    faculty_name: user.faculty_name,
    department_name: user.department_name,
    programme_name: user.programme_name
  }
})

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/students?departmentId=X
router.get('/students', async (req, res) => {
  const { departmentId } = req.query
  try {
    let query = `SELECT u.id, u.name, u.email, u.degree, 
                 u.supervisor_id, u.co_supervisor_id,
                 u.department_id, d.name as department_name, p.name as programme_name,
                 sup.name as supervisor_name, cosup.name as co_supervisor_name
                 FROM users u
                 LEFT JOIN departments d ON u.department_id = d.id
                 LEFT JOIN programmes p ON u.programme_id = p.id
                 LEFT JOIN users sup ON u.supervisor_id = sup.id
                 LEFT JOIN users cosup ON u.co_supervisor_id = cosup.id
                 WHERE u.role = 'student'`
    const params = []

    if (departmentId) {
      query += ' AND u.department_id = ?'
      params.push(departmentId)
    }

    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/examiners?departmentId=X
router.get('/examiners', async (req, res) => {
  const { departmentId } = req.query
  try {
    let query = "SELECT id, name, email, department_id FROM users WHERE role = 'examiner'"
    const params = []

    if (departmentId) {
      query += ' AND department_id = ?'
      params.push(departmentId)
    }

    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/supervisors?departmentId=X
router.get('/supervisors', async (req, res) => {
  const { departmentId } = req.query
  try {
    let query = "SELECT id, name, email, department_id FROM users WHERE role = 'supervisor'"
    const params = []

    if (departmentId) {
      query += ' AND department_id = ?'
      params.push(departmentId)
    }

    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/supervisor-students/:supervisorId
router.get('/supervisor-students/:supervisorId', async (req, res) => {
  const { supervisorId } = req.params
  try {
    const [rows] = await poolPromise.query(
      "SELECT id, name, email, degree FROM users WHERE role = 'student' AND supervisor_id = ?",
      [supervisorId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/co-supervisor-students/:supervisorId
// Students where this person is the CO-supervisor
router.get('/co-supervisor-students/:supervisorId', async (req, res) => {
  const { supervisorId } = req.params
  try {
    const sql =
      'SELECT u.id, u.name, u.email, u.degree, s.name AS main_supervisor_name ' +
      'FROM users u ' +
      'LEFT JOIN users s ON u.supervisor_id = s.id ' +
      'WHERE u.co_supervisor_id = ?'
    const [rows] = await poolPromise.query(sql, [supervisorId])
    res.json(rows)
  } catch (err) {
    console.error('Fetch co-supervised students error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/auth/assign-supervisor
router.put('/assign-supervisor', async (req, res) => {
  const { studentId, supervisorId } = req.body

  try {
    // Update supervisor_id (null if removing)
    await poolPromise.query(
      'UPDATE users SET supervisor_id = ? WHERE id = ?',
      [supervisorId || null, studentId]
    )

    // Only send notification when assigning (not removing)
    if (supervisorId) {
      const [studentRows] = await poolPromise.query(
        'SELECT name FROM users WHERE id = ?',
        [studentId]
      )
      const studentName = studentRows[0].name

      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          supervisorId,
          'New Student Assigned',
          `${studentName} has been assigned to you as a postgraduate student.`
        ]
      )
    }

    res.json({
      message: supervisorId
        ? 'Supervisor assigned successfully!'
        : 'Supervisor removed successfully!'
    })

  } catch (err) {
    console.error('Assign supervisor error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/auth/assign-supervisors
// Coordinator assigns OR changes supervisor + co-supervisor
router.put('/assign-supervisors', async (req, res) => {
  const { studentId, supervisorId, coSupervisorId } = req.body

  try {
    // Get the current assignment first
    const [currentRows] = await poolPromise.query(
      'SELECT supervisor_id, co_supervisor_id, name FROM users WHERE id = ?',
      [studentId]
    )
    const current = currentRows[0]
    const studentName = current.name
    const oldSupervisorId = current.supervisor_id
    const oldCoSupervisorId = current.co_supervisor_id

    // Normalise for comparison
    const newSup = supervisorId ? Number(supervisorId) : null
    const newCoSup = coSupervisorId ? Number(coSupervisorId) : null

    const supervisorChanged = oldSupervisorId !== newSup
    const coSupervisorChanged = oldCoSupervisorId !== newCoSup

    // Nothing changed - don't fire duplicate notifications
    if (!supervisorChanged && !coSupervisorChanged) {
      return res.json({
        message: 'No changes made — this student already has these supervisors.'
      })
    }

    // Apply the update
    await poolPromise.query(
      'UPDATE users SET supervisor_id = ?, co_supervisor_id = ? WHERE id = ?',
      [newSup, newCoSup, studentId]
    )

    // --- Supervisor change notifications ---
    if (supervisorChanged) {
      if (newSup) {
        const verb = oldSupervisorId ? 'reassigned as the supervisor for' : 'assigned as the supervisor for'
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [newSup, 'Supervision Assignment', 'You have been ' + verb + ' ' + studentName + '.']
        )
      }
      if (oldSupervisorId) {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [oldSupervisorId, 'Supervision Change', 'You are no longer the supervisor for ' + studentName + '.']
        )
      }
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [studentId, 'Supervisor Updated',
          oldSupervisorId
            ? 'Your supervisor has been changed. Please check your supervision team.'
            : 'A supervisor has been assigned to you. Please check your supervision team.']
      )
    }

    // --- Co-supervisor change notifications ---
    if (coSupervisorChanged) {
      if (newCoSup) {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [newCoSup, 'Co-Supervision Assignment', 'You have been assigned as co-supervisor for ' + studentName + '.']
        )
      }
      if (oldCoSupervisorId) {
        await poolPromise.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [oldCoSupervisorId, 'Co-Supervision Change', 'You are no longer the co-supervisor for ' + studentName + '.']
        )
      }
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [studentId, 'Co-Supervisor Updated', 'Your co-supervisor assignment has been updated. Please check your supervision team.']
      )
    }

    res.json({ message: 'Supervision assignment updated successfully!' })
  } catch (err) {
    console.error('Assign supervisors error:', err)
    res.status(500).json({ message: 'Server error' })
  }

})


  // PUT /api/auth/remove-supervisor/:studentId
// Coordinator unassigns the supervisor (and co-supervisor) from a student
router.put('/remove-supervisor/:studentId', async (req, res) => {
  const studentId = req.params.studentId
  try {
    const [rows] = await poolPromise.query(
      'SELECT s.name AS student_name, s.supervisor_id, s.co_supervisor_id ' +
      'FROM users s WHERE s.id = ?',
      [studentId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    const student = rows[0]
    if (!student.supervisor_id) {
      return res.status(400).json({ message: 'This student has no supervisor assigned.' })
    }

    // Clear both the supervisor and co-supervisor
    await poolPromise.query(
      'UPDATE users SET supervisor_id = NULL, co_supervisor_id = NULL WHERE id = ?',
      [studentId]
    )

    // Notify the removed supervisor
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [student.supervisor_id, 'Supervision Removed',
       'You have been unassigned as supervisor for ' + student.student_name + '.']
    )

    // Notify the removed co-supervisor, if there was one
    if (student.co_supervisor_id) {
      await poolPromise.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [student.co_supervisor_id, 'Co-Supervision Removed',
         'You have been unassigned as co-supervisor for ' + student.student_name + '.']
      )
    }

    // Notify the student
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [studentId, 'Supervisor Removed',
       'Your supervisor has been unassigned. A new one will be assigned soon.']
    )

    res.json({ message: 'Supervisor removed from ' + student.student_name + '.' })
  } catch (err) {
    console.error('Remove supervisor error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/my-supervisors/:studentId
// Returns the student's supervision team with contact info
router.get('/my-supervisors/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    const sql =
      'SELECT ' +
      's.name AS supervisor_name, s.email AS supervisor_email, ds.name AS supervisor_department, ' +
      'c.name AS co_supervisor_name, c.email AS co_supervisor_email, dc.name AS co_supervisor_department ' +
      'FROM users u ' +
      'LEFT JOIN users s ON u.supervisor_id = s.id ' +
      'LEFT JOIN departments ds ON s.department_id = ds.id ' +
      'LEFT JOIN users c ON u.co_supervisor_id = c.id ' +
      'LEFT JOIN departments dc ON c.department_id = dc.id ' +
      'WHERE u.id = ?'
    const [rows] = await poolPromise.query(sql, [studentId])
    res.json(rows[0] || {})
  } catch (err) {
    console.error('Fetch supervision team error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/departments
// List all departments (for the admin examiner form dropdown)
router.get('/departments', async (req, res) => {
  try {
    const [rows] = await poolPromise.query(
      `SELECT d.id, d.name, f.name as faculty_name
       FROM departments d
       JOIN faculties f ON d.faculty_id = f.id
       ORDER BY f.name, d.name`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/all-examiners
// List all examiner accounts (admin view)
router.get('/all-examiners', async (req, res) => {
  try {
    const [rows] = await poolPromise.query(
      `SELECT u.id, u.name, u.email, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.role = 'examiner'
       ORDER BY u.name`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})


// GET /api/auth/demo-examiners
// Returns examiner accounts WITH credentials for the demo login dropdown (DEV ONLY)
router.get('/demo-examiners', async (req, res) => {
  try {
    const [rows] = await poolPromise.query(
      `SELECT u.name, u.email, u.password, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.role = 'examiner'
       ORDER BY d.name, u.name`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/faculty-staff?facultyId=X
// Academic staff (supervisors + coordinators) in a faculty — for the Faculty Rep
router.get('/faculty-staff', async (req, res) => {
  const { facultyId } = req.query
  try {
    let query =
    "SELECT u.id, u.name, u.email, u.role, u.faculty_id, u.department_id, d.name as department_name " +
      "FROM users u LEFT JOIN departments d ON u.department_id = d.id " +
      "WHERE u.role IN ('supervisor', 'coordinator')"
    const params = []
    if (facultyId) {
      query += ' AND u.faculty_id = ?'
      params.push(facultyId)
    }
    query += ' ORDER BY d.name, u.name'
    const [rows] = await poolPromise.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/auth/assign-coordinator
// Faculty Rep appoints a staff member as Coordinator, or returns them to Supervisor
router.put('/assign-coordinator', async (req, res) => {
  const { userId, makeCoordinator } = req.body
  try {
    const newRole = makeCoordinator ? 'coordinator' : 'supervisor'
    await poolPromise.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [newRole, userId]
    )
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        userId,
        makeCoordinator ? 'Appointed as Coordinator' : 'Coordinator Role Removed',
        makeCoordinator
          ? 'You have been appointed as a Postgraduate Coordinator for your department.'
          : 'Your Coordinator role has been removed. You remain a supervisor.'
      ]
    )
    res.json({ message: makeCoordinator ? 'Coordinator assigned successfully!' : 'Coordinator role removed.' })
  } catch (err) {
    console.error('Assign coordinator error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/faculties
// All faculties with their current Faculty HDC Representative (Super Admin view)
router.get('/faculties', async (req, res) => {
  try {
    const [rows] = await poolPromise.query(
      "SELECT f.id, f.name, r.id as rep_id, r.name as rep_name, r.email as rep_email " +
      "FROM faculties f " +
      "LEFT JOIN users r ON r.faculty_id = f.id AND r.role = 'faculty_rep' " +
      "GROUP BY f.id, f.name, r.id, r.name, r.email " +
      "ORDER BY f.name"
    )
    res.json(rows)
  } catch (err) {
    console.error('Faculties error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/auth/assign-faculty-rep
// Super Admin appoints a Faculty HDC Representative for a faculty
router.put('/assign-faculty-rep', async (req, res) => {
  const { userId, facultyId } = req.body
  try {
    // Step the current rep of this faculty back to supervisor (one rep per faculty)
    await poolPromise.query(
      "UPDATE users SET role = 'supervisor' WHERE role = 'faculty_rep' AND faculty_id = ?",
      [facultyId]
    )
    // Promote the chosen staff member
    await poolPromise.query(
      "UPDATE users SET role = 'faculty_rep', faculty_id = ? WHERE id = ?",
      [facultyId, userId]
    )
    await poolPromise.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [userId, 'Appointed as Faculty HDC Representative',
       'You have been appointed as the Faculty HDC Representative for your faculty.']
    )
    res.json({ message: 'Faculty Representative assigned successfully!' })
  } catch (err) {
    console.error('Assign faculty rep error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/subscription/:userId  (is this user following PG news?)
router.get('/subscription/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const [rows] = await poolPromise.query('SELECT is_pg_subscriber FROM users WHERE id = ?', [userId])
    res.json({ subscribed: rows.length ? !!rows[0].is_pg_subscriber : false })
  } catch (err) {
    console.error('Subscription get error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/auth/subscription/:userId  (follow / unfollow)
router.put('/subscription/:userId', async (req, res) => {
  const { userId } = req.params
  const { subscribed } = req.body
  try {
    await poolPromise.query('UPDATE users SET is_pg_subscriber = ? WHERE id = ?', [subscribed ? 1 : 0, userId])
    res.json({ message: subscribed ? 'You are now following postgraduate news.' : 'You have unsubscribed.' })
  } catch (err) {
    console.error('Subscription set error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})


module.exports = router