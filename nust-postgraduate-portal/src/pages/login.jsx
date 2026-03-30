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
    <div>
      <h1>Postgraduate Portal</h1>
      <h2>Login</h2>

      {/* Email input */}
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          
        />
      </div>

      {/* Password input */}
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          
        />
      </div>

      {/* Login button */}
      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  )
}

export default Login