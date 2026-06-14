// src/pages/Login.jsx
// useNavigate lets us redirect to another page
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// Import useAuth so we can call the login function
import { useAuth } from '../context/AuthContext'




function Login() {
  // useState lets us track what the user is typing
  // email starts as empty string ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // navigate is a function we call to redirect the user
  const navigate = useNavigate()
  // Get the login function from our AuthContext
  const { login } = useAuth()

  // Demo accounts for quick-fill during presentation (seed data only)
  const demoAccounts = [
    { label: 'CS — Masters Student', email: '222012345@nust.na', password: 'student123' },
    { label: 'CS — Masters Student2', email: 'natangue@nust.na', password: 'delson123' },
    { label: 'CS — PhD Student', email: '221098765@nust.na', password: 'phd123' },
     { label: 'CS — PhD Student2', email: '211937536@nust.na', password: 'victoria123' },
    { label: 'CS — Coordinator', email: 'coordinator@nust.na', password: 'coord123' },
    { label: 'FCI — Faculty HDC Rep', email: 'faculty.rep@nust.na', password: 'rep123' },
    { label: 'CS — Supervisor', email: 'fili.nghidengwa@nust.na', password: 'supervisor123' },
    { label: 'Civil — PhD Student', email: '223009988@nust.na', password: 'student123' },
     { label: 'Civil — PhD Student2', email: '220847145@nust.na', password: 'ndeya123' },
     { label: 'Civil — Masters Student', email: '222936903@nust.na', password: 'bianca123' },
    { label: 'Civil — Coordinator', email: 'civil.coordinator@nust.na', password: 'coord123' },
    { label: 'Civil — Supervisor', email: 'civil.supervisor@nust.na', password: 'supervisor123' },
    { label: 'CS - Co-Supervisor', email: 'anna.shilongo@nust.na', password: 'supervisor123' },
    { label: 'Admin / Secretary', email: 'mary.admin@nust.na', password: 'demo123' },
    { label: 'Undergraduate (limited)', email: '224567890@nust.na', password: 'demo123' },
    { label: 'Junior Lecturer (limited)', email: 'john.junior@nust.na', password: 'demo123' }
  ]

  // Examiners are created dynamically, so fetch them from the database
  const [dbExaminers, setDbExaminers] = useState([])

  useEffect(() => {
    const fetchExaminers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/demo-examiners')
        setDbExaminers(await res.json())
      } catch (err) {
        console.error('Error fetching examiners:', err)
      }
    }
    fetchExaminers()
  }, [])

  // Map DB examiners into dropdown options (label shows email + password)
  const examinerAccounts = dbExaminers.map(ex => ({
    label: ex.name + ' — External Examiner ' + (ex.department_name ? ' (' + ex.department_name + ')' : ''),
    email: ex.email,
    password: ex.password
  }))

  // Combine hardcoded seed accounts with fetched examiner accounts
  const allAccounts = [...demoAccounts, ...examinerAccounts]

  const handleDemoSelect = (e) => {
    const selected = allAccounts.find(a => a.email === e.target.value)
    if (selected) {
      setEmail(selected.email)
      setPassword(selected.password)
    }
  }

 const handleLogin = async () => {

  // Check fields are filled
  if (!email || !password) {
    alert('Please enter your email and password.')
    return
  }

  try {

    // Send login request to our backend API
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    // Get response data
    const data = await response.json()

    // If login failed
    if (!response.ok) {
      alert(data.message || 'Invalid email or password.')
      return
    }

    // Save token to localStorage
    localStorage.setItem('token', data.token)

    // Save user to AuthContext
    login(data.user)

    // Redirect based on role
if (data.user.role === 'student') {
  navigate('/student')
} else if (data.user.role === 'supervisor') {
  navigate('/supervisor')
} else if (data.user.role === 'examiner') {
  navigate('/examiner')
} else if (data.user.role === 'coordinator') {
  navigate('/coordinator')
} else if (data.user.role === 'faculty_rep') {
  navigate('/faculty-rep')
} else if (data.user.role === 'admin_staff') {
  navigate('/admin')
} else {
  navigate('/dashboard')
}

  } catch (err) {
    alert('Could not connect to server. Please try again.')
    console.error(err)
  }

}

  return (
    <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5'
  }}>

    <div style={{
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '600px'
    }}>

      {/* University header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#002147', fontSize: '20px' }}>
          NAMIBIA UNIVERSITY OF SCIENCE AND TECHNOLOGY
        </h1>
       <h2 style={{ color: '#8B0000', fontSize: '16px', marginTop: '5px' }}>
          Postgraduate Research Portal
        </h2>
        <p style={{ color: '#888888', fontSize: '12px', marginTop: '8px' }}>
          Sign in with your NUST credentials
        </p>
        <hr style={{ marginTop: '15px', borderColor: '#002147' }} />
      </div>

      {/* Email field */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: 'bold',
          color: '#002147'
        }}>
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #cccccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Password field */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: 'bold',
          color: '#002147'
        }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #cccccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Login button */}
      <button
        onClick={handleLogin}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#002147',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor:"pointer"
        }}>
        Login
      </button>
      {/* Demo account quick-fill (development only) */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #cccccc' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#888888', marginBottom: '6px' }}>
          Demo account quick-fill (development only)
        </label>
        <select
          onChange={handleDemoSelect}
          defaultValue=""
          style={{
            width: '100%', padding: '8px',
            border: '1px solid #cccccc', borderRadius: '4px',
            fontSize: '13px', backgroundColor: 'white'
          }}>
          <option value="">-- Select a demo account --</option>
        {allAccounts.map(a => (
            <option key={a.email} value={a.email}>{a.label}</option>
          ))}
        </select>
        <p style={{ fontSize: '11px', color: '#aaaaaa', marginTop: '6px' }}>
          In production, all users sign in via NUST SSO. These are seed accounts for demonstration only.
        </p>
      </div>

    {/* Footer note */}
      <p style={{
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '12px',
        color: '#888888'
      }}>
        For all NUST postgraduate students and staff
      </p>

    </div>
  </div>
  )
}

export default Login