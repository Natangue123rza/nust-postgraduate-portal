// src/pages/examiner/ExaminerDashboard.jsx

import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function ExaminerDashboard() {

  const { user } = useAuth()
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState([])
  const [documents, setDocuments] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchAssignments = async () => {
      try {

        // Fetch assigned students
        const response = await fetch(
          `http://localhost:5000/api/assignments/examiner/${user.id}`
        )

        const data = await response.json()
        setAssignments(data)

        // Fetch documents for each assigned student
        const docsMap = {}

        for (const assignment of data) {

          const docRes = await fetch(
            `http://localhost:5000/api/assignments/student-documents/${assignment.student_id}`
          )

          const docData = await docRes.json()

          docsMap[assignment.student_id] = docData
        }

        setDocuments(docsMap)

      } catch (err) {
        console.error('Error fetching assignments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()

  }, [user.id])

  return (
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
          <h1 style={{
            margin: 0,
            fontSize: '22px'
          }}>
            Welcome, {user.name}
          </h1>

          <p style={{
            margin: '5px 0 0 0',
            color: '#aaaaaa',
            fontSize: '14px'
          }}>
            Examiner — Faculty of Computing and Informatics
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p style={{
            color: '#666',
            textAlign: 'center'
          }}>
            Loading your assignments...
          </p>
        )}

        {/* No assignments */}
        {!loading && assignments.length === 0 && (
          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            padding: '25px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#e65100',
            textAlign: 'center'
          }}>
            ⏳ <strong>No students assigned yet.</strong>

            <p style={{
              marginTop: '8px',
              fontSize: '13px'
            }}>
              You will be notified by the HOD when a student is assigned to you.
            </p>
          </div>
        )}

        {/* Assigned students */}
        {!loading && assignments.length > 0 && (
          <div>

            <h2 style={{
              color: '#002147',
              marginBottom: '20px',
              fontSize: '18px',
              borderLeft: '4px solid #8B0000',
              paddingLeft: '10px'
            }}>
              Your Assigned Students
            </h2>

            {assignments.map((assignment) => {

              const studentDocs = documents[assignment.student_id] || {}

              return (
                <div
                  key={assignment.id}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #dddddd',
                    borderLeft: `4px solid ${
                      assignment.degree === 'PhD'
                        ? '#8B0000'
                        : '#002147'
                    }`,
                    borderRadius: '8px',
                    padding: '25px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                  }}
                >

                  {/* Student info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>

                    <div>

                      <h3 style={{
                        color: '#002147',
                        marginBottom: '5px',
                        fontSize: '18px'
                      }}>
                        {assignment.student_name}
                      </h3>

                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center'
                      }}>

                        <span style={{
                          backgroundColor:
                            assignment.degree === 'PhD'
                              ? '#8B0000'
                              : '#002147',
                          color: 'white',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px'
                        }}>
                          {assignment.degree}
                        </span>

                        <span style={{
                          backgroundColor: '#f0f7ff',
                          color: '#002147',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          border: '1px solid #002147'
                        }}>
                          {assignment.examiner_type === 'internal'
                            ? 'Internal Examiner'
                            : 'External Examiner'}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* Documents section */}
                  <div style={{
                    backgroundColor: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                  }}>

                    <h4 style={{
                      color: '#002147',
                      marginBottom: '12px',
                      fontSize: '14px'
                    }}>
                      📁 Student Documents
                    </h4>

                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}>

                      {/* Proposal */}
                      {studentDocs.proposal?.file_name ? (
                        <a
                          href={`http://localhost:5000/api/uploads/${studentDocs.proposal.file_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: '#002147',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          📄 View Research Proposal
                        </a>
                      ) : (
                        <span style={{
                          backgroundColor: '#f0f0f0',
                          color: '#999',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}>
                          📄 No Proposal Uploaded
                        </span>
                      )}

                      {/* Thesis */}
                      {studentDocs.thesis?.file_name ? (
                        <a
                          href={`http://localhost:5000/api/uploads/${studentDocs.thesis.file_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: '#8B0000',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          🎓 View Thesis
                        </a>
                      ) : (
                        <span style={{
                          backgroundColor: '#f0f0f0',
                          color: '#999',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}>
                          🎓 No Thesis Uploaded
                        </span>
                      )}

                    </div>
                  </div>

                  {/* Evaluate button */}
                  <button
                    onClick={() => navigate('/examiner/evaluate')}
                    style={{
                      backgroundColor: '#002147',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    📝 Submit Evaluation for {assignment.student_name}
                  </button>

                </div>
              )
            })}

          </div>
        )}

      </div>
    </div>
  )
}

export default ExaminerDashboard