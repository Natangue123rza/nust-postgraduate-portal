// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'

import Login from './pages/Login'
import StudentDashboard from './pages/student/StudentDashboard'
import HODDashboard from './pages/hod/HODDashboard'
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import ExaminerDashboard from './pages/examiner/ExaminerDashboard'
import ProgressReport from './pages/student/ProgressReport'
import AssignExaminers from './pages/hod/AssignExaminers'
import EvaluationForm from './pages/examiner/EvaluationForm'
import StudentList from './pages/supervisor/StudentList'
import ProposalUpload from './pages/student/ProposalUpload'
import ThesisSubmission from './pages/student/ThesisSubmission'
import ProgressReportReview from './pages/supervisor/ProgressReportReview'
import ViewSubmissions from './pages/hod/ViewSubmissions'
import HDCDecision from './pages/hod/HDCDecision'
import SetDeadlines from './pages/hod/SetDeadlines'
import SetAcademicPeriod from './pages/hod/SetAcademicPeriod'
import Results from './pages/student/Results'
import ViewProposals from './pages/supervisor/ViewProposals'
import ViewTheses from './pages/supervisor/ViewTheses'
import ManageResults from './pages/hod/ManageResults'
import AssignSupervisor from './pages/hod/AssignSupervisor'
import ReviewSubmissions from './pages/supervisor/ReviewSubmissions'
import GradeThesis from './pages/supervisor/GradeThesis'
import DefaultDashboard from './pages/DefaultDashboard'
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageExaminers from './pages/admin/ManageExaminers'
import FacultyRepDashboard from './pages/facultyrep/FacultyRepDashboard'
import AssignCoordinator from './pages/facultyrep/AssignCoordinator'
import FacultyApprovals from './pages/facultyrep/FacultyApprovals'

function App() {
  return (
    <Routes>
      {/* Login is public */}
      <Route path="/" element={<Login />} />

      {/* Student */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      {/* Coordinator home (kept at /hod so existing back buttons still work) */}
      <Route path="/hod" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <HODDashboard />
        </ProtectedRoute>
      } />

      {/* Supervisor */}
      <Route path="/supervisor" element={
        <ProtectedRoute allowedRoles={['supervisor']}>
          <SupervisorDashboard />
        </ProtectedRoute>
      } />

      {/* Examiner */}
      <Route path="/examiner" element={
        <ProtectedRoute allowedRoles={['examiner']}>
          <ExaminerDashboard />
        </ProtectedRoute>
      } />

      {/* Student progress report */}
      <Route path="/student/progress-report" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ProgressReport />
        </ProtectedRoute>
      } />

      {/* Coordinator: assign examiners */}
      <Route path="/hod/assign-examiners" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <AssignExaminers />
        </ProtectedRoute>
      } />

      {/* Examiner evaluation form */}
      <Route path="/examiner/evaluate" element={
        <ProtectedRoute allowedRoles={['examiner']}>
          <EvaluationForm />
        </ProtectedRoute>
      } />

      {/* Supervisor student list */}
      <Route path="/supervisor/students" element={
        <ProtectedRoute allowedRoles={['supervisor']}>
          <StudentList />
        </ProtectedRoute>
      } />

      {/* Student proposal upload */}
      <Route path="/student/proposal" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ProposalUpload />
        </ProtectedRoute>
      } />

      {/* Student thesis submission */}
      <Route path="/student/thesis" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ThesisSubmission />
        </ProtectedRoute>
      } />

      {/* Supervisor progress report review */}
      <Route path="/supervisor/progress-reports" element={
        <ProtectedRoute allowedRoles={['supervisor']}>
          <ProgressReportReview />
        </ProtectedRoute>
      } />

      {/* Coordinator: view submissions */}
      <Route path="/hod/submissions" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <ViewSubmissions />
        </ProtectedRoute>
      } />

      {/* Coordinator: HDC / proposal decision */}
      <Route path="/hod/hdc-decision" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <HDCDecision />
        </ProtectedRoute>
      } />

      {/* Coordinator: set deadlines */}
      <Route path="/hod/deadlines" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <SetDeadlines />
        </ProtectedRoute>
      } />

      {/* Coordinator: set academic period */}
      <Route path="/hod/set-period" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <SetAcademicPeriod />
        </ProtectedRoute>
      } />

      {/* Student results */}
      <Route path="/student/results" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Results />
        </ProtectedRoute>
      } />

      {/* Supervisor view proposals */}
      <Route path="/supervisor/proposals" element={
        <ProtectedRoute allowedRoles={['supervisor']}>
          <ViewProposals />
        </ProtectedRoute>
      } />

      {/* Supervisor view theses */}
      <Route path="/supervisor/theses" element={
        <ProtectedRoute allowedRoles={['supervisor']}>
          <ViewTheses />
        </ProtectedRoute>
      } />

      {/* Coordinator: manage results */}
      <Route path="/hod/results" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <ManageResults />
        </ProtectedRoute>
      } />

      {/* Coordinator: assign supervisor (legacy route, kept harmless) */}
      <Route path="/hod/assign-supervisor" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <AssignSupervisor />
        </ProtectedRoute>
      } />

      {/* Supervisor review submissions */}
      <Route path="/supervisor/review" element={
        <ProtectedRoute allowedRoles={['supervisor']}>
          <ReviewSubmissions />
        </ProtectedRoute>
      } />

      {/* Supervisor grade thesis */}
      <Route path="/supervisor/grade" element={
        <ProtectedRoute allowedRoles={['supervisor']}>
          <GradeThesis />
        </ProtectedRoute>
      } />

      {/* Default dashboard for non-postgraduate users */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['undergraduate', 'junior_lecturer', 'admin_staff']}>
          <DefaultDashboard />
        </ProtectedRoute>
      } />

      {/* Coordinator home */}
      <Route path="/coordinator" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <HODDashboard />
        </ProtectedRoute>
      } />

      {/* Coordinator: assign supervisors */}
      <Route path="/coordinator/assign-supervisor" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <CoordinatorDashboard />
        </ProtectedRoute>
      } />

      {/* Admin dashboard */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin_staff']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Admin manage examiners */}
      <Route path="/admin/examiners" element={
        <ProtectedRoute allowedRoles={['admin_staff']}>
          <ManageExaminers />
        </ProtectedRoute>
      } />

      {/* Faculty HDC Representative */}
      <Route path="/faculty-rep" element={
        <ProtectedRoute allowedRoles={['faculty_rep']}>
          <FacultyRepDashboard />
        </ProtectedRoute>
      } />
      <Route path="/faculty-rep/assign-coordinator" element={
        <ProtectedRoute allowedRoles={['faculty_rep']}>
          <AssignCoordinator />
        </ProtectedRoute>
      } />
      <Route path="/faculty-rep/approvals" element={
        <ProtectedRoute allowedRoles={['faculty_rep']}>
          <FacultyApprovals />
        </ProtectedRoute>
      } />

    </Routes>
  )
}

export default App