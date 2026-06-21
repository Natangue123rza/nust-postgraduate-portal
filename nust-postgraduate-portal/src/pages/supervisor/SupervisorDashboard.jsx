// src/pages/supervisor/SupervisorDashboard.jsx
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function SupervisorDashboard() {

  const { user } = useAuth()
  const navigate = useNavigate()
 const [assignedStudents, setAssignedStudents] = useState([])
  const [coSupervised, setCoSupervised] = useState([])
  const [pendingReviews, setPendingReviews] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get assigned students
        const studentsRes = await fetch(
          `http://localhost:5000/api/auth/supervisor-students/${user.id}`
        )
      const students = await studentsRes.json()
        setAssignedStudents(students)

        // Students where this person is the CO-supervisor
        const coRes = await fetch('http://localhost:5000/api/auth/co-supervisor-students/' + user.id)
        setCoSupervised(await coRes.json())

        // Count pending reviews
        let pending = 0
        for (const student of students) {
          const [propRes, thesisRes] = await Promise.all([
            fetch(`http://localhost:5000/api/proposals/student/${student.id}`),
            fetch(`http://localhost:5000/api/theses/student/${student.id}`)
          ])
          const proposals = await propRes.json()
          const theses = await thesisRes.json()

          if (proposals.length > 0 && proposals[0].supervisor_status === 'Pending') pending++
          if (theses.length > 0 && theses[0].supervisor_status === 'Pending') pending++
        }
        setPendingReviews(pending)

      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.id])

  return (
    <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '1280px',
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
           {user.faculty_name || 'Namibia University of Science and Technology'}
          </p>
        </div>

        {/* Summary stats */}
        {!loading && (
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>

            {/* Assigned students */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
              flex: 1,
              minWidth: '150px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#002147', margin: 0 }}>
                {assignedStudents.length}
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                Assigned Students
              </p>
            </div>

        {/* Pending reviews */}
            <div
              onClick={() => { if (pendingReviews > 0) navigate('/supervisor/review') }}
              style={{
              backgroundColor: pendingReviews > 0 ? '#fff3e0' : 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
              flex: 1,
              minWidth: '150px',
              textAlign: 'center',
              cursor: pendingReviews > 0 ? 'pointer' : 'default',
              border: pendingReviews > 0 ? '1px solid #ff9800' : '1px solid #dddddd'
            }}>
              <p style={{
                fontSize: '32px', fontWeight: 'bold',
                color: pendingReviews > 0 ? '#e65100' : '#002147',
                margin: 0
              }}>
                {pendingReviews}
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                Pending Reviews
              </p>
            </div>

          </div>
        )}

        {/* No students assigned */}
        {!loading && assignedStudents.length === 0 && (
          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            padding: '20px',
            borderRadius: '8px',
            color: '#e65100',
            fontSize: '14px',
            marginBottom: '25px'
          }}>
            ⏳ No students assigned yet. You will be notified when the Postgraduate Coordinator assigns students to you.
          </div>
        )}

       

     {/* Students you co-supervise */}
        {!loading && coSupervised.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px 25px',
            borderRadius: '8px',
            marginBottom: '30px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
          }}>
            <h3 style={{
              color: '#002147', marginBottom: '4px',
              fontSize: '16px', borderLeft: '4px solid #8B0000', paddingLeft: '10px'
            }}>
              Students You Co-Supervise
            </h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px', paddingLeft: '14px' }}>
              You support these students alongside their main supervisor
            </p>
            {coSupervised.map(student => (
              <div key={student.id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '10px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '2px' }}>
                    {student.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Main supervisor: {student.main_supervisor_name || 'Not assigned'}
                  </p>
                </div>
                <span style={{
                  backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                  color: 'white', padding: '3px 10px',
                  borderRadius: '12px', fontSize: '11px'
                }}>
                  {student.degree}
                </span>
              </div>
            ))}
          </div>
        )}

     

        
      </div>
    </div>
  )
}

export default SupervisorDashboard