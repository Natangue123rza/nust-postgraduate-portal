// src/pages/hod/ViewSubmissions.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

function ViewSubmissions() {

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('proposals')
  const [proposals, setProposals] = useState([])
  const [theses, setTheses] = useState([])
  const [progressReports, setProgressReports] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
   const fetchAll = async () => {
  try {
    const proposalsRes = await fetch(
      `http://localhost:5000/api/proposals/all?departmentId=${user.department_id}`
    )
    setProposals(await proposalsRes.json())

    const thesesRes = await fetch(
      `http://localhost:5000/api/theses/all?departmentId=${user.department_id}`
    )
    setTheses(await thesesRes.json())

    const reportsRes = await fetch(
      `http://localhost:5000/api/progress/all?departmentId=${user.department_id}`
    )
    setProgressReports(await reportsRes.json())
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}
    fetchAll()
  }, [])

  const tabStyle = (tabName) => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: activeTab === tabName ? '3px solid #8B0000' : '3px solid transparent',
    backgroundColor: 'transparent',
    color: activeTab === tabName ? '#002147' : '#666666',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
    fontSize: '14px',
    cursor: 'pointer'
  })

  const statusColor = (status) => {
    if (status === 'Approved' || status === 'Reviewed')
      return { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' }
    if (status === 'Rejected' || status === 'Revision Required')
      return { bg: '#fce4e4', color: '#c62828', border: '#ef5350' }
    if (status === 'Awaiting Examiner Assignment')
      return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' }
    return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' }
  }

  // Group progress reports by student
  const groupedReports = progressReports.reduce((acc, report) => {
    if (!acc[report.student_id]) {
      acc[report.student_id] = {
        student_name: report.student_name,
        degree: report.degree,
        reports: []
      }
    }
    acc[report.student_id].reports.push(report)
    return acc
  }, {})

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>View All Submissions</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
          {user.faculty_name || 'Namibia University of Science and Technology'}
          </p>
        </div>

        <button
          onClick={() => navigate('/hod')}
          style={{
            backgroundColor: 'transparent', border: '1px solid #002147',
            color: '#002147', padding: '8px 16px', borderRadius: '4px',
            marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
          }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading submissions..." />}

        {!loading && (
          <div style={{
            backgroundColor: 'white', borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)', overflow: 'hidden'
          }}>

            {/* Tabs */}
            <div style={{
              display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '0 20px'
            }}>
              <button onClick={() => setActiveTab('proposals')} style={tabStyle('proposals')}>
                📄 Proposals ({proposals.length})
              </button>
              <button onClick={() => setActiveTab('theses')} style={tabStyle('theses')}>
                🎓 Theses ({theses.length})
              </button>
              <button onClick={() => setActiveTab('progressReports')} style={tabStyle('progressReports')}>
                📋 Student Progress ({Object.keys(groupedReports).length})
              </button>
            </div>

            <div style={{ padding: '20px' }}>

              {/* Proposals Tab */}
              {activeTab === 'proposals' && (
                <div>
                  <h3 style={{
                    color: '#002147', marginBottom: '15px', fontSize: '16px',
                    borderLeft: '4px solid #8B0000', paddingLeft: '10px'
                  }}>
                    Research Proposals
                  </h3>

                  {proposals.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      No proposals approved by supervisor yet.
                    </p>
                  ) : (
                    proposals.map(item => (
                      <div key={item.id} style={{
                        border: '1px solid #f0f0f0', borderRadius: '6px',
                        padding: '15px 20px', marginBottom: '12px'
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'flex-start', marginBottom: '8px'
                        }}>
                          <div>
                            <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '4px' }}>
                              {item.title}
                            </p>
                            <p style={{ fontSize: '13px', color: '#666' }}>
                              {item.student_name} — {item.degree} |
                              Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {item.file_name && (
                              
                               <a href={'http://localhost:5000/api/uploads/' + item.file_name}
                                target="_blank" rel="noopener noreferrer"
                                style={{
                                  backgroundColor: '#002147', color: 'white',
                                  padding: '5px 12px', borderRadius: '4px',
                                  fontSize: '12px', textDecoration: 'none'
                                }}>
                                📄 View PDF
                              </a>
                            )}
                            <span style={{
                              backgroundColor: statusColor(item.status).bg,
                              color: statusColor(item.status).color,
                              border: '1px solid ' + statusColor(item.status).border,
                              padding: '4px 12px', borderRadius: '12px', fontSize: '12px'
                            }}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* Supervisor comments */}
                        {item.supervisor_comments && (
                          <div style={{
                            backgroundColor: '#f0f7ff', padding: '10px',
                            borderRadius: '4px', fontSize: '13px',
                            color: '#333', marginBottom: '6px'
                          }}>
                            <strong>Supervisor Comments:</strong> {item.supervisor_comments}
                          </div>
                        )}

                        {/* HDC Comments */}
                        {item.hdc_comments && (
                          <div style={{
                            backgroundColor: '#f5f5f5', padding: '10px',
                            borderRadius: '4px', fontSize: '13px', color: '#333'
                          }}>
                            <strong>HDC Comments:</strong> {item.hdc_comments}
                          </div>
                        )}

                        {/* Ethics status */}
                        {item.status === 'Approved' && (
                          <div style={{
                            marginTop: '8px', fontSize: '12px',
                            color: item.ethics_status === 'Submitted' ? '#2e7d32' : '#e65100'
                          }}>
                            Ethics Clearance: <strong>{item.ethics_status || 'Not Submitted'}</strong>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Theses Tab */}
              {activeTab === 'theses' && (
                <div>
                  <h3 style={{
                    color: '#002147', marginBottom: '15px', fontSize: '16px',
                    borderLeft: '4px solid #8B0000', paddingLeft: '10px'
                  }}>
                    Thesis Submissions
                  </h3>

                  {theses.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      No theses approved by supervisor yet.
                    </p>
                  ) : (
                    theses.map(item => (
                      <div key={item.id} style={{
                        border: '1px solid #f0f0f0', borderRadius: '6px',
                        padding: '15px 20px', marginBottom: '12px'
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'flex-start', marginBottom: '8px'
                        }}>
                          <div>
                            <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '4px' }}>
                              {item.title}
                            </p>
                            <p style={{ fontSize: '13px', color: '#666' }}>
                              {item.student_name} — {item.degree} |
                              Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {item.file_name && (
                              
                             <a   href={'http://localhost:5000/api/uploads/' + item.file_name}
                                target="_blank" rel="noopener noreferrer"
                                style={{
                                  backgroundColor: '#8B0000', color: 'white',
                                  padding: '5px 12px', borderRadius: '4px',
                                  fontSize: '12px', textDecoration: 'none'
                                }}>
                                📄 View PDF
                              </a>
                            )}
                            <span style={{
                              backgroundColor: statusColor(item.status).bg,
                              color: statusColor(item.status).color,
                              border: '1px solid ' + statusColor(item.status).border,
                              padding: '4px 12px', borderRadius: '12px', fontSize: '12px'
                            }}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* Supervisor comments */}
                        {item.supervisor_comments && (
                          <div style={{
                            backgroundColor: '#f0f7ff', padding: '10px',
                            borderRadius: '4px', fontSize: '13px', color: '#333'
                          }}>
                            <strong>Supervisor Comments:</strong> {item.supervisor_comments}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Progress Reports Tab - Summary view for HOD */}
              {activeTab === 'progressReports' && (
                <div>
                  <h3 style={{
                    color: '#002147', marginBottom: '5px', fontSize: '16px',
                    borderLeft: '4px solid #8B0000', paddingLeft: '10px'
                  }}>
                    Student Progress Overview
                  </h3>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px', paddingLeft: '14px' }}>
                    Summary of all student progress reports
                  </p>

                  {Object.keys(groupedReports).length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      No progress reports submitted yet.
                    </p>
                  ) : (
                    Object.values(groupedReports).map((studentData, index) => (
                      <div key={index} style={{
                        border: '1px solid #f0f0f0', borderRadius: '6px',
                        padding: '15px 20px', marginBottom: '15px'
                      }}>
                        {/* Student name */}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: '12px'
                        }}>
                          <div>
                            <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '3px' }}>
                              {studentData.student_name}
                            </p>
                            <span style={{
                              backgroundColor: studentData.degree === 'PhD' ? '#8B0000' : '#002147',
                              color: 'white', padding: '2px 8px',
                              borderRadius: '12px', fontSize: '11px'
                            }}>
                              {studentData.degree}
                            </span>
                          </div>
                          <span style={{
                            backgroundColor: '#f0f7ff', color: '#002147',
                            padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
                            border: '1px solid #002147'
                          }}>
                            {studentData.reports.length} report{studentData.reports.length > 1 ? 's' : ''} submitted
                          </span>
                        </div>

                        {/* Reports summary */}
                        {studentData.reports.map(report => (
                          <div key={report.id} style={{
                            backgroundColor: '#f9f9f9', padding: '10px',
                            borderRadius: '4px', marginBottom: '8px'
                          }}>
                            <div style={{
                              display: 'flex', justifyContent: 'space-between',
                              alignItems: 'center', marginBottom: '6px'
                            }}>
                              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                                {report.semester}
                              </p>
                              <p style={{ fontSize: '11px', color: '#999' }}>
                                {new Date(report.submitted_at).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Status indicators */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {[
                                { label: 'On Schedule', value: report.on_schedule },
                                { label: 'On Budget', value: report.on_budget },
                                { label: 'On Target', value: report.on_target }
                              ].map(s => (
                                <span key={s.label} style={{
                                  backgroundColor: s.value === 'yes' ? '#e6f4ea' : '#fff3e0',
                                  color: s.value === 'yes' ? '#2e7d32' : '#e65100',
                                  border: '1px solid ' + (s.value === 'yes' ? '#4caf50' : '#ff9800'),
                                  padding: '2px 8px', borderRadius: '12px', fontSize: '11px'
                                }}>
                                  {s.label}: {s.value === 'yes' ? '✅' : '⚠️'}
                                </span>
                              ))}
                              <span style={{
                                backgroundColor: report.supervisor_comments ? '#e6f4ea' : '#fff3e0',
                                color: report.supervisor_comments ? '#2e7d32' : '#e65100',
                                border: '1px solid ' + (report.supervisor_comments ? '#4caf50' : '#ff9800'),
                                padding: '2px 8px', borderRadius: '12px', fontSize: '11px'
                              }}>
                                Supervisor Review: {report.supervisor_comments ? '✅' : '⏳'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewSubmissions