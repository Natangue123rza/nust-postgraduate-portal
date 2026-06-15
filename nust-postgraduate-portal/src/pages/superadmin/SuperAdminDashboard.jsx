// src/pages/superadmin/SuperAdminDashboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [faculties, setFaculties] = useState([])

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/faculties')
        setFaculties(await res.json())
      } catch (err) {
        console.error('Error fetching faculties:', err)
      }
    }
    fetchFaculties()
  }, [])

  const withRep = faculties.filter(f => f.rep_id).length

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
            System Administrator — Institution-wide
          </p>
        </div>

        <p style={{ color: '#002147', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
          At a glance
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px', marginBottom: '30px'
        }}>
          {[
            { label: 'Faculties', value: faculties.length },
            { label: 'Faculties with a Rep', value: withRep }
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
          Administrator Actions
        </h2>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div
            onClick={() => navigate('/superadmin/faculty-reps')}
            style={{
              backgroundColor: 'white', border: '1px solid #dddddd',
              borderTop: '4px solid #002147', padding: '25px', borderRadius: '8px',
              cursor: 'pointer', width: '240px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>🏫 Faculty Representatives</h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Appoint the HDC representative for each faculty
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SuperAdminDashboard