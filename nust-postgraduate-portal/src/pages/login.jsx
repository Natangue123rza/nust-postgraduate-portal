// src/pages/Login.jsx
import { useState } from 'react'

function Login() {
  // useState lets us track what the user is typing
  // email starts as empty string ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // This will run when the user clicks Login
  const handleLogin = () => {
    // We'll fill this in next step
    console.log('Email:', email)
    console.log('Password:', password)
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