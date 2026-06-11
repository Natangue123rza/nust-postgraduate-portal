// src/pages/DefaultDashboard.jsx
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function DefaultDashboard() {

  const { user } = useAuth()

  // Different message based on role
  const getRoleMessage = () => {
    switch (user.role) {
      case 'undergraduate':
        return {
          icon: '🎓',
          title: 'Postgraduate Portal Access',
          message: 'This portal is for postgraduate (Masters and PhD) students only.',
          detail: 'Our records show you are registered as an undergraduate student. If you believe this is an error, please contact your faculty office.'
        }
      case 'junior_lecturer':
        return {
          icon: '👨‍🏫',
          title: 'No Postgraduate Responsibilities',
          message: 'You are not currently assigned to supervise any postgraduate students.',
          detail: 'This portal is used by postgraduate supervisors, examiners, and coordinators. If you have been assigned postgraduate students, please contact your HOD.'
        }
      case 'admin_staff':
        return {
          icon: '🗂️',
          title: 'Administrative Access',
          message: 'You do not have an active role in the postgraduate research workflow.',
          detail: 'This portal is used by postgraduate students and academic staff. Administrative tasks are handled through other NUST systems.'
        }
      default:
        return {
          icon: 'ℹ️',
          title: 'Limited Access',
          message: 'Your account does not have access to the postgraduate research portal.',
          detail: 'If you believe you should have access, please contact your faculty administration.'
        }
    }
  }

  const info = getRoleMessage()

  return (
    <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '700px',
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
            Namibia University of Science and Technology
          </p>
        </div>

        {/* Limited access card */}
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
          textAlign: 'center',
          borderTop: '4px solid #8B0000'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>
            {info.icon}
          </div>
          <h2 style={{ color: '#002147', marginBottom: '15px', fontSize: '20px' }}>
            {info.title}
          </h2>
          <p style={{ color: '#333', fontSize: '15px', marginBottom: '15px', lineHeight: '1.5' }}>
            {info.message}
          </p>
          <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.5' }}>
            {info.detail}
          </p>

          {/* Profile info */}
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            padding: '15px',
            marginTop: '25px',
            textAlign: 'left'
          }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              Your NUST Profile
            </p>
            <p style={{ fontSize: '14px', color: '#002147', marginBottom: '3px' }}>
              <strong>Name:</strong> {user.name}
            </p>
            <p style={{ fontSize: '14px', color: '#002147', marginBottom: '3px' }}>
              <strong>Email:</strong> {user.email}
            </p>
            <p style={{ fontSize: '14px', color: '#002147' }}>
              <strong>Account Type:</strong> {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Info note about SSO */}
        <div style={{
          backgroundColor: '#f0f7ff',
          border: '1px solid #002147',
          padding: '15px 20px',
          borderRadius: '8px',
          marginTop: '20px',
          fontSize: '13px',
          color: '#002147'
        }}>
          ℹ️ You are logged in through your NUST account. Access to this portal is
          determined automatically based on your role at the university.
        </div>

      </div>
    </div>
  )
}

export default DefaultDashboard