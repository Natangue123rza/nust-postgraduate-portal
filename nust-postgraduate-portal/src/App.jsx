// src/App.jsx

// We import Routes and Route from react-router-dom
// Routes = the container that holds all our routes
// Route = one single path-to-page mapping
import { Routes, Route } from 'react-router-dom'

// Import our ProtectedRoute guard
import ProtectedRoute from './routes/ProtectedRoute'


// Import all our pages so we can use them
import Login from './pages/Login'
import StudentDashboard from './pages/student/StudentDashboard'
import HODDashboard from './pages/hod/HODDashboard'
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import ExaminerDashboard from './pages/examiner/ExaminerDashboard'
import ProgressReport from './pages/student/ProgressReport'


function App() {
  return (
    <Routes>
    { /*Login is Public - anyone can see it*/ }
    <Route path="/" element={<Login />} />

    {/* Student route - only students allowed */ }
    <Route path='/student' element={
      <ProtectedRoute allowedRoles={['student']}>
        <StudentDashboard/>
        </ProtectedRoute>
    }/>

    {/* HOD route -only HOD allowed */}
    <Route path="/hod" element={
      <ProtectedRoute allowedRoles={['hod']}>
        <HODDashboard />
      </ProtectedRoute>
    } />

    {/* Supervisor route - only supervisor allowed */}
    <Route  path="/supervisor" element= {
      <ProtectedRoute allowedRoles={['supervisor']}>
      <SupervisorDashboard/>
      </ProtectedRoute>
    }/>

    {/* Examiner route - only examiner allowed */}
    <Route path="/examiner" element={
      <ProtectedRoute allowedRoles={['examiner']}>
       <ExaminerDashboard/>
      </ProtectedRoute>
    }
     />

     {/* Student Progress Report - only student allowed */}
    {/* Student Progress Report - only students allowed */}
<Route path="/student/progress-report" element={
  <ProtectedRoute allowedRoles={['student']}>
    <ProgressReport />
  </ProtectedRoute>
} />

     
    </Routes>
  )
}

export default App