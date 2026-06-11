// src/pages/coordinator/CoordinatorDashboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function CoordinatorDashboard() {

  const { user } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [currentPeriod, setCurrentPeriod] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Students in the coordinator's department
        const studentsRes = await fetch(
          `http://localhost:5000/api/auth/students?departmentId=${user.department_id}`
        )
        setStudents(await studentsRes.json())

        // Current semester
        const periodRes = await fetch('http://localhost:5000/api/periods/detect')
        setCurrentPeriod(await periodRes.json())
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.department_id])

  // Count students without a supervisor
  const unassignedCount = students.filter(s => !s.supervisor_id).length

  return (
    <div>
      <Navbar />

      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Welcome banner */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '25px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>Welcome, {user.name}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
           {user.faculty_name || 'Namibia University of Science and Technology'}
          </p>
        </div>

        {/* Semester banner */}
        {currentPeriod && (
          <div style={{
            backgroundColor: '#8B0000', color: 'white',
            padding: '15px 25px', borderRadius: '8px', marginBottom: '30px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#ffcccc' }}>
                Current Academic Period
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
                {currentPeriod.semester} — {currentPeriod.academic_year}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#ffcccc' }}>Semester ends</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                {currentPeriod.end_date}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: 'white', padding: '20px 25px',
              borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
              flex: 1, minWidth: '150px', textAlign: 'center'
            }}>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#002147', margin: 0 }}>
                {students.length}
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                Department Students
              </p>
            </div>

            <div style={{
              backgroundColor: unassignedCount > 0 ? '#fff3e0' : 'white',
              padding: '20px 25px', borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
              flex: 1, minWidth: '150px', textAlign: 'center',
              border: unassignedCount > 0 ? '1px solid #ff9800' : '1px solid #dddddd'
            }}>
              <p style={{
                fontSize: '32px', fontWeight: 'bold',
                color: unassignedCount > 0 ? '#e65100' : '#002147', margin: 0
              }}>
                {unassignedCount}
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                Awaiting Supervisor
              </p>
            </div>
          </div>
        )}

        {/* Section title */}
        <h2 style={{
          color: '#002147', marginBottom: '20px', fontSize: '18px',
          borderLeft: '4px solid #8B0000', paddingLeft: '10px'
        }}>
          Coordinator Actions
        </h2>

        {/* Action cards */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

          {/* Assign Supervisor card */}
          <div
            onClick={() => navigate('/coordinator/assign-supervisor')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderTop: `4px solid ${unassignedCount > 0 ? '#ff9800' : '#002147'}`,
              padding: '25px', borderRadius: '8px',
              cursor: 'pointer', width: '260px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
              position: 'relative'
            }}>
            {unassignedCount > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                backgroundColor: '#ff9800', color: 'white',
                borderRadius: '50%', width: '22px', height: '22px',
                fontSize: '12px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                {unassignedCount}
              </span>
            )}
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>
              👨‍🏫 Assign Supervisors
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Assign supervisors and co-supervisors to postgraduate students in your department
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CoordinatorDashboard