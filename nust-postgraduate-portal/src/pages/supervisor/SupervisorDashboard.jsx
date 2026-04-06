// src/pages/supervisor/supervisorDashboard.jsx
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";



function SupervisorDashboard() {

    const { user } = useAuth()
    const navigate = useNavigate()
 
    return(
  
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
            Supervisor — Faculty of Computing and Informatics
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
          Supervisor Actions
        </h2>

        {/* Cards */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>

          {/* View Students Card */}
          <div
            onClick={() => navigate('/supervisor/students')}
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
              👥 My Students
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              View your assigned students and their progress
            </p>
          </div>

          {/* Progress Reports Card */}
          <div
            onClick={() => navigate('/supervisor/progress-reports')}
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
              📋 Progress Reports
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Review and respond to student progress reports
            </p>
          </div>

        </div>
      </div>
    </div>
    )

}



// We export it so other files (like our router) can use it
export default SupervisorDashboard;