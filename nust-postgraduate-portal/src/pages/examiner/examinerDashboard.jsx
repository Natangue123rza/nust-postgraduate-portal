// src/pages/examiner/ExaminerDashboard.jsx
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function ExaminerDashboard() {

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
            Examiner — Faculty of Computing and Informatics
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
          Examiner Actions
        </h2>

        {/* Cards */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>

          {/* Evaluate Thesis Card */}
          <div
            onClick={() => navigate('/examiner/evaluate')}
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
              📝 Evaluate Thesis
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Submit your evaluation and marks for assigned students
            </p>
          </div>

        </div>
      </div>
    </div> 
  )
}

export default ExaminerDashboard