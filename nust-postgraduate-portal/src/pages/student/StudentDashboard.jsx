// src/pages/student/StudentDashboard.jsx
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function StudentDashboard() {

  // Get logged in user info
  const { user } = useAuth()
  const navigate = useNavigate()

 return (
    <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '1100px',
        margin: '0 auto'
      }}>

        {/* Welcome banner */}
        <div style={{
          backgroundColor: '#002147',
          color: 'white',
          padding: '25px 30px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>
            Welcome, {user.name}
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            {user.degree} Student — Faculty of Computing and Informatics
          </p>
        </div>

        {/* Section title */}
        <h2 style={{
          color: '#002147',
          marginBottom: '20px',
          fontSize: '18px',
          borderLeft: '4px solid #8B0000',
          paddingLeft: '10px'
        }}>
          Student Actions
        </h2>

        {/* Cards container */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>

          {/* Progress Report Card */}
          <div
            onClick={() => navigate('/student/progress-report')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderTop: '4px solid #002147',
              padding: '25px',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '220px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>
              📋 Progress Report
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Submit your semester progress report to your supervisor
            </p>
          </div>

          {/* Proposal Card */}
          <div
            onClick={() => navigate('/student/proposal')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderTop: '4px solid #002147',
              padding: '25px',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '220px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>
              📄 Research Proposal
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Submit your research proposal for HDC review
            </p>
          </div>

          {/* Thesis Card */}
          <div
            onClick={() => navigate('/student/thesis')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderTop: '4px solid #002147',
              padding: '25px',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '220px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>
              🎓 Thesis Submission
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Submit your final thesis for examination
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default StudentDashboard