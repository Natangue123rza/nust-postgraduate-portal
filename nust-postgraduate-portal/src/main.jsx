// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// import BrowserRouter - this enables routing for the whole app
import { BrowserRouter } from 'react-router-dom'

// Import our AuthProvider so the whole app knows who is logged in
import { AuthProvider } from './context/AuthContext'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*Browser Router wraps everything so all pages can use routing */}
    <BrowserRouter 
     future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
    >
 {/* AuthProvider wraps everything so all pages can see who is logged in */}

    <AuthProvider>
       <App />
     </AuthProvider>
    </BrowserRouter>
 
 
  </StrictMode>,
)
