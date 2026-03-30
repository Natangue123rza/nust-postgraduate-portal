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

            display: 'flex' ,
            justifyContent: 'space-between' ,
            alignItems: 'center' ,
            padding: '10px 20px' ,
            backgroundColor: '#003366' ,
            color: 'white'
        }}>

            {/* Left side - Portal name */}
            <h2 style={{margin: 0 }}>
                NUST Postgraduate Portal
            </h2>

            {/* Right side - User info and logout */}
            {user && (
                <div style={{ display: 'flex', alignItems: 'center' , gap: '15px'}}>
                
                    {/* Show logged in user's name and role  */}
                      <span>Welcome, {user.name}</span>
          <span style={{
            backgroundColor: '#0055a5',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            textTransform: 'uppercase'
          }}>
            {user.role}
            </span>

            {/* Logout button */}
            <button
            onClick ={handleLogout}
            style={{
                backgroundColor: 'white' ,
             color: '#003366',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
                Logout
                </button>

                </div>
            ) }

            </nav>
    )
}

export default Navbar