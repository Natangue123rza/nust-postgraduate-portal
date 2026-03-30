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

    // user holds the currently logged in user's information
    // starts as null because nobody is logged in yet
    const [user , setUser] = useState(null)

    // login function saves the user to our notice board
    const login = (userData) => {
        setUser(userData)
    }

    // logout function clears the notice board
    const logout = () => {
        setUser(null)
    }

    return (
        // We share user, login and logout with the whole app
        <AuthContext.Provider value={{ user, login , logout}}>
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

