// src/pages/Login.jsx
// useNavigate lets us redirect to another page
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// Import useAuth so we can call the login function
import { useAuth } from '../context/AuthContext'

// Our fake user database
import fakeUsers from '../utils/fakeUsers'


function Login() {
  // useState lets us track what the user is typing
  // email starts as empty string ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // navigate is a function we call to redirect the user
  const navigate = useNavigate()
  // Get the login function from our AuthContext
  const { login } = useAuth()

  // This will run when the user clicks Login
 const handleLogin = () => {

  // Step 1: Search fakeUsers for matching email AND password
  const user = fakeUsers.find(
    (u) => u.email === email && u.password === password
  )

  // Step 2: If no user found, show error and stop
  if (!user) {
    alert('Invalid email or password. Please try again.')
    return
  }

  // Step 3: Save user to AuthContext notice board
  login(user)

  // Step 4: Redirect based on role
  if (user.role === 'student') {
    navigate('/student')
  } else if (user.role === 'hod') {
    navigate('/hod')
  } else if (user.role === 'supervisor') {
    navigate('/supervisor')
  } else if (user.role === 'examiner') {
    navigate('/examiner')
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
      maxWidth: '400px'
    }}>

      {/* University header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#002147', fontSize: '20px' }}>
          NAMIBIA UNIVERSITY OF SCIENCE AND TECHNOLOGY
        </h1>
        <h2 style={{ color: '#8B0000', fontSize: '16px', marginTop: '5px' }}>
          Postgraduate Research Portal
        </h2>
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
          fontWeight: 'bold'
        }}>
        Login
      </button>

      {/* Footer note */}
      <p style={{
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '12px',
        color: '#888888'
      }}>
        Faculty of Computing and Informatics
      </p>

    </div>
  </div>
  )
}

export default Login