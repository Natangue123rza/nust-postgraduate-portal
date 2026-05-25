// src/pages/supervisor/ViewTheses.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ViewTheses() {

  const navigate = useNavigate()
  const [theses, setTheses] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
useEffect(() => {
  const fetchTheses = async () => {
    try {
      const studentsRes = await fetch(
        `http://localhost:5000/api/auth/supervisor-students/${user.id}`
      )
      const students = await studentsRes.json()

      if (students.length === 0) {
        setTheses([])
        setLoading(false)
        return
      }

      const thesesRes = await fetch('http://localhost:5000/api/theses/all')
      const allTheses = await thesesRes.json()

      const studentIds = students.map(s => s.id)
      setTheses(allTheses.filter(t => studentIds.includes(t.student_id)))

    } catch (err) {
      console.error('Error fetching theses:', err)
    } finally {
      setLoading(false)
    }
  }
  fetchTheses()
}, [user.id])

  const statusColor = (status) => {
    if (status === 'Approved') return { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' }
    if (status === 'Rejected') return { bg: '#fce4e4', color: '#c62828', border: '#ef5350' }
    if (status === 'Awaiting Examiner Assignment') return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' }
    return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' }
  }

  return (
    <div>
      <Navbar />

      <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147',
          color: 'white',
          padding: '25px 30px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Thesis Submissions</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Student thesis submissions
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/supervisor')}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #002147',
            color: '#002147',
            padding: '8px 16px',
            borderRadius: '4px',
            marginBottom: '25px',
            fontSize: '13px',
            cursor: 'pointer'
          }}>
          ← Back to Dashboard
        </button>

        {/* Loading */}
        {loading && (
          <p style={{ color: '#666', textAlign: 'center' }}>Loading theses...</p>
        )}

        {/* Theses list */}
        {!loading && (
          <div>
            {theses.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666'
              }}>
                   No thesis submitted by your assigned students yet.
              </div>
            ) : (
              theses.map(item => (
                <div key={item.id} style={{
                  backgroundColor: 'white',
                  border: '1px solid #dddddd',
                  borderLeft: `4px solid ${item.degree === 'PhD' ? '#8B0000' : '#002147'}`,
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '15px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <div>
                      <h3 style={{ color: '#002147', marginBottom: '5px', fontSize: '15px' }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                        {item.student_name} — {item.degree}
                      </p>
                      <p style={{ fontSize: '12px', color: '#999' }}>
                        Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.file_name && (
                        <a
                          href={`http://localhost:5000/api/uploads/${item.file_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: '#002147',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            textDecoration: 'none'
                          }}>
                          📄 View PDF
                        </a>
                      )}
                      <span style={{
                        backgroundColor: statusColor(item.status).bg,
                        color: statusColor(item.status).color,
                        border: `1px solid ${statusColor(item.status).border}`,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Abstract */}
                  {item.abstract && (
                    <p style={{
                      fontSize: '13px',
                      color: '#444',
                      backgroundColor: '#f5f5f5',
                      padding: '10px',
                      borderRadius: '4px'
                    }}>
                      <strong>Abstract:</strong> {item.abstract}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewTheses