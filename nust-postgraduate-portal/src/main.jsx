// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// import BrowserRouter - this enables routing for the whole app
import { BrowserRouter } from 'react-router-dom'


import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*Browser Router wraps everything so all pages can use routing */}
    <BrowserRouter>
       <App />
    </BrowserRouter>
 
 
  </StrictMode>,
)
