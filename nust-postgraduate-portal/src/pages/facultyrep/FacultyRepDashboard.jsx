// src/pages/facultyrep/FacultyRepDashboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function FacultyRepDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [staff, setStaff] = useState([])

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(
          'http://localhost:5000/api/auth/faculty-staff?facultyId=' + user.faculty_id
        )
        setStaff(await res.json())
      } catch (err) {
        console.error('Error fetching staff:', err)
      }
    }
    fetchStaff()
  }, [user.faculty_id])

  const coordinators = staff.filter(s => s.role === 'coordinator').length
  const supervisors = staff.filter(s => s.role === 'supervisor').length

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '25px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>Welcome, {user.name}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Faculty HDC Representative — {user.faculty_name || 'Faculty'}
          </p>
        </div>

        <p style={{ color: '#002147', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
          Faculty at a glance
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px', marginBottom: '30px'
        }}>
          {[
            { label: 'Coordinators', value: coordinators },
            { label: 'Supervisors', value: supervisors }
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: 'white', border: '1px solid #eeeeee',
              borderRadius: '8px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#002147', margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: '3px 0 0 0' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <h2 style={{
          color: '#002147', fontSize: '18px', marginBottom: '20px',
          borderLeft: '4px solid #8B0000', paddingLeft: '10px'
        }}>
          Faculty Rep Actions
        </h2>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div
            onClick={() => navigate('/faculty-rep/assign-coordinator')}
            style={{
              backgroundColor: 'white', border: '1px solid #dddddd',
              borderTop: '4px solid #002147', padding: '25px', borderRadius: '8px',
              cursor: 'pointer', width: '240px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>👥 Assign Coordinators</h3>
          <p style={{ fontSize: '13px', color: '#666666' }}>
              Appoint programme coordinators within your faculty
            </p>
          </div>

          <div
            onClick={() => navigate('/faculty-rep/approvals')}
            style={{
              backgroundColor: 'white', border: '1px solid #dddddd',
              borderTop: '4px solid #8B0000', padding: '25px', borderRadius: '8px',
              cursor: 'pointer', width: '240px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#8B0000', marginBottom: '10px' }}>✅ Faculty Approvals</h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Give faculty-level approval to endorsed proposals
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default FacultyRepDashboard