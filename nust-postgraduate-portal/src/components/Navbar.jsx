// src/components/Navbar.jsx

import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

function Navbar() {

    // Get the logged in user and logout function from AuthContext
    const { user , logout } = useAuth()
    const navigate = useNavigate()

    // When logout is clicked , clear the user and go back to login
    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
         <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 30px',
      backgroundColor: '#002147',
      color: 'white',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
    }}>

      {/* Left side - Portal name */}
      <div>
        <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '1px' }}>
          NUST Postgraduate Portal
        </h2>
        <p style={{ margin: 0, fontSize: '11px', color: '#aaaaaa' }}>
          Faculty of Computing and Informatics
        </p>
      </div>

      {/* Right side - User info and logout */}
      {user && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>

          {/* User name */}
          <span style={{ fontSize: '14px' }}>
            {user.name}
          </span>

          {/* Role badge */}
          <span style={{
            backgroundColor: '#8B0000',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {user.role}
          </span>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: "pointer"

            }}>
            Logout
          </button>

        </div>
      )}

    </nav>
    )
}

export default Navbar