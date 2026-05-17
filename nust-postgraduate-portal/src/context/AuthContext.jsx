// src/context/AuthContext.jsx

// createContext creates our "notice board"
// useState lets us store the logged in user
// useContext lets any component read from the notice board
import { createContext , useState , useContext } from "react";

// This creates the actual "notice board"
// We export it so other files can read from it
export const AuthContext = createContext(null)

// This is the "wrapper" that shares user info with the whole app
// Any component inside this wrapper can see who is logged in
export function AuthProvider({ children }) {

   // Check localStorage for existing token on app start
const [user, setUser] = useState(() => {
  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')
  if (token && savedUser) {
    return JSON.parse(savedUser)
  }
  return null
})

    // Shared deadlines set by HOD
const [deadlines, setDeadlines] = useState({
    proposal: '',
    progressReport: '',
    thesis: ''
})

    // login function saves the user to our notice board
  const login = (userData) => {
  setUser(userData)
  // Save user to localStorage so they stay logged in on refresh
  localStorage.setItem('user', JSON.stringify(userData))
}

    // logout function clears the notice board
   const logout = () => {
  setUser(null)
  // Clear localStorage on logout
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}





    return (
        // We share user, login and logout with the whole app
        <AuthContext.Provider value={{ user, login , logout, deadlines, setDeadlines}}>
            {children}
        </AuthContext.Provider>
    )
}

// This is a shortcut hook so any component can easily read from the notice board
// Instead of writing useContext(AuthContext) everywhere
// we just write useAuth() -  cleaner btw!

export function useAuth() {

    return useContext(AuthContext)
}

