// src/routes/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

//allowRoles = the list of roles allowed to see this page
function ProtectedRoute({ children , allowedRoles }) {

      // Get the current logged in user from our notice board
  const { user } = useAuth()

   // If nobody is logged in, send them back to login page
  if (!user) {
    return <Navigate to="/" />
  }

   // If user's role is not in the allowed list, send them back to login
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }

    // If all checks pass, show the actual page
  return children
}


export default ProtectedRoute