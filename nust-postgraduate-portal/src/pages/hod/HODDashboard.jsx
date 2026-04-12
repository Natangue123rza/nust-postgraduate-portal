// src/pages/hod/HODDashboard.jsx
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
//This is the main page the HOD sees when they logging in

function HODDashboard() {
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
            HOD Dashboard
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Faculty of Computing and Informatics
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
          HOD Actions
        </h2>

        {/* Cards */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>

          {/* Assign Examiners Card */}
          <div
            onClick={() => navigate('/hod/assign-examiners')}
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
              👤 Assign Examiners
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Assign examiners to Masters and PhD students
            </p>
          </div>

          {/* View Submissions Card */}
          <div
            onClick={() => navigate('/hod/submissions')}
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
              📋 View Submissions
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              View all student thesis submissions
            </p>
          </div>

          {/* HDC Decision Card */}
          <div
            onClick={() => navigate('/hod/hdc-decision')}
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
              ✅ HDC Decision
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Record HDC proposal approval outcomes
            </p>
          </div>

{/* Set Deadlines Card */}
<div
  onClick={() => navigate('/hod/deadlines')}
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
    ⏰ Set Deadlines
  </h3>
  <p style={{ fontSize: '13px', color: '#666666' }}>
    Set submission deadlines for proposals and theses
  </p>
</div>

        </div>
      </div>
    </div>
  )

}


// We export it so other files (like our router) can use it
export default HODDashboard