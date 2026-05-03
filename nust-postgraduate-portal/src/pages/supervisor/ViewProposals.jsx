// src/pages/supervisor/ViewProposals.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'

function ViewProposals() {

  const navigate = useNavigate()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/proposals/all')
        const data = await response.json()
        setProposals(data)
      } catch (err) {
        console.error('Error fetching proposals:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProposals()
  }, [])

  const statusColor = (status) => {
    if (status === 'Approved') return { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' }
    if (status === 'Rejected') return { bg: '#fce4e4', color: '#c62828', border: '#ef5350' }
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
          <h1 style={{ margin: 0, fontSize: '20px' }}>Research Proposals</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Student research proposal submissions
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
          <p style={{ color: '#666', textAlign: 'center' }}>Loading proposals...</p>
        )}

        {/* Proposals list */}
        {!loading && (
          <div>
            {proposals.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666'
              }}>
                No proposals submitted yet.
              </div>
            ) : (
              proposals.map(item => (
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

                  {/* Description */}
                  {item.description && (
                    <p style={{
                      fontSize: '13px',
                      color: '#444',
                      backgroundColor: '#f5f5f5',
                      padding: '10px',
                      borderRadius: '4px'
                    }}>
                      {item.description}
                    </p>
                  )}

                  {/* HDC Comments */}
                  {item.hdc_comments && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#f0f7ff',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#333'
                    }}>
                      <strong>HDC Comments:</strong> {item.hdc_comments}
                    </div>
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

export default ViewProposals