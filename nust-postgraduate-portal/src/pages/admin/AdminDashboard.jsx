// src/pages/admin/AdminDashboard.jsx
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {

  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      <Navbar />

      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Welcome banner */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>Welcome, {user.name}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Administrative Staff — Namibia University of Science and Technology
          </p>
        </div>

        {/* Info note */}
        <div style={{
          backgroundColor: '#f0f7ff', border: '1px solid #002147',
          padding: '15px 20px', borderRadius: '8px',
          marginBottom: '30px', fontSize: '13px', color: '#002147'
        }}>
          ℹ️ As administrative staff, you manage external examiner accounts.
          External examiners are not part of NUST and therefore require accounts
          to be created for them, unlike students and staff who log in via NUST SSO.
        </div>

        {/* Section title */}
        <h2 style={{
          color: '#002147', marginBottom: '20px', fontSize: '18px',
          borderLeft: '4px solid #8B0000', paddingLeft: '10px'
        }}>
          Administrative Actions
        </h2>

        {/* Action cards */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div
            onClick={() => navigate('/admin/examiners')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderTop: '4px solid #002147',
              padding: '25px', borderRadius: '8px',
              cursor: 'pointer', width: '260px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>
              👤 Manage External Examiners
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Create and view external examiner accounts for any department
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard