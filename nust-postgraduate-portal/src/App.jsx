// src/App.jsx

// We import Routes and Route from react-router-dom
// Routes = the container that holds all our routes
// Route = one single path-to-page mapping
import { Routes, Route } from 'react-router-dom'

// Import all our pages so we can use them
import Login from './pages/Login'
import StudentDashboard from './pages/student/StudentDashboard'
import HODDashboard from './pages/hod/HODDashboard'
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import ExaminerDashboard from './pages/examiner/ExaminerDashboard'

function App() {
  return (
    <Routes>
      {/* The first page everyone sees is Login */}
      <Route path="/" element={<Login />} />

      {/* Each role has their own dashboard route */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/hod" element={<HODDashboard />} />
      <Route path="/supervisor" element={<SupervisorDashboard />} />
      <Route path="/examiner" element={<ExaminerDashboard />} />
    </Routes>
  )
}

export default App