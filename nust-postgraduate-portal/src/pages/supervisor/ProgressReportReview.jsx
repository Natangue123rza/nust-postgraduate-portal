// src/pages/supervisor/ProgressReportReview.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

function ProgressReportReview() {

  const navigate = useNavigate()

  // Students and reports from database
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Supervisor comment
  const [supervisorComment, setSupervisorComment] = useState('')
  const [saved, setSaved] = useState(false)

  // Fetch assigned students from database when page loads
 useEffect(() => {
  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/supervisor-students/${user.id}`
      )
      const data = await response.json()
      setStudents(data)
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }
  fetchStudents()
}, [user.id])

  // Fetch report when student is selected
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student)
    setSaved(false)
    setSupervisorComment('')
    setReport(null)
    setLoading(true)

    try {
      const response = await fetch(`http://localhost:5000/api/progress/student/${student.id}`)
      const data = await response.json()

      if (data.length > 0) {
        setReport(data[0])
        // If supervisor already commented, show it
        if (data[0].supervisor_comments) {
          setSupervisorComment(data[0].supervisor_comments)
          setSaved(true)
        }
      } else {
        setReport(null)
      }
    } catch (err) {
      console.error('Error fetching report:', err)
    } finally {
      setLoading(false)
    }
  }

  // Save supervisor comments to database
  const handleSave = async () => {

    if (!supervisorComment) {
      alert('Please write your comments before saving.')
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/progress/supervisor-comment/${report.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supervisorComments: supervisorComment })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message)
        return
      }

      setSaved(true)
      alert('Comments saved successfully!')

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    }
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
          <h1 style={{ margin: 0, fontSize: '20px' }}>Progress Report Review</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Review student progress reports and add supervisor comments
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

        {/* Student Selection */}
        <h2 style={{
          color: '#002147',
          marginBottom: '20px',
          fontSize: '18px',
          borderLeft: '4px solid #8B0000',
          paddingLeft: '10px'
        }}>
          Select Student
        </h2>

{/* No students assigned yet */}
{!loading && students.length === 0 && (
  <div style={{
    backgroundColor: '#fff3e0',
    border: '1px solid #ff9800',
    padding: '25px',
    borderRadius: '8px',
    color: '#e65100',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '25px'
  }}>
    ⏳ <strong>No students assigned yet.</strong>

    <p style={{
      marginTop: '8px',
      fontSize: '13px'
    }}>
      You will be notified when the HOD assigns students to you.
    </p>
  </div>
)}

        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          marginBottom: '30px'
        }}>
          {students.map(student => (
            <div
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              style={{
                backgroundColor: selectedStudent?.id === student.id ? '#002147' : 'white',
                color: selectedStudent?.id === student.id ? 'white' : '#333333',
                border: '1px solid #dddddd',
                borderTop: `4px solid ${student.degree === 'PhD' ? '#8B0000' : '#002147'}`,
                padding: '15px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
              }}>
              <h3 style={{ marginBottom: '6px', fontSize: '14px' }}>{student.name}</h3>
              <span style={{
                backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
                {student.degree}
              </span>
            </div>
          ))}
        </div>

        {/* Loading */}
       {loading && <LoadingSpinner message="Loading report..." />}

        {/* No report found */}
        {selectedStudent && !loading && !report && (
          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            padding: '20px',
            borderRadius: '8px',
            color: '#e65100',
            fontSize: '14px'
          }}>
            ⚠️ {selectedStudent.name} has not submitted a progress report yet.
          </div>
        )}

        {/* Show report when found */}
        {selectedStudent && !loading && report && (
          <div>

            {/* Report header */}
            <div style={{
              backgroundColor: '#f0f7ff',
              border: '1px solid #002147',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px'
            }}>
              <strong>Student:</strong> {selectedStudent.name} |
              <strong> Degree:</strong> {selectedStudent.degree} |
              <strong> Semester:</strong> {report.semester} |
              <strong> Submitted:</strong> {new Date(report.submitted_at).toLocaleDateString()}
            </div>

            {/* Section 1 */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h4 style={{ color: '#8B0000', marginBottom: '8px' }}>1. Research Problem</h4>
              <p style={{ fontSize: '14px', color: '#333' }}>{report.research_problem}</p>
            </div>

            {/* Section 2 */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h4 style={{ color: '#8B0000', marginBottom: '8px' }}>2. Research Objectives</h4>
              <p style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-line' }}>{report.objectives}</p>
            </div>

            {/* Section 3 */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h4 style={{ color: '#8B0000', marginBottom: '12px' }}>3. Evaluation</h4>

              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#002147' }}>Activities Completed:</p>
              <p style={{ fontSize: '14px', color: '#333', marginBottom: '10px' }}>{report.activities_completed}</p>

              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#002147' }}>Activities In Progress:</p>
              <p style={{ fontSize: '14px', color: '#333', marginBottom: '10px' }}>{report.activities_in_progress}</p>

              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#002147' }}>Activities Outstanding:</p>
              <p style={{ fontSize: '14px', color: '#333', marginBottom: '15px' }}>{report.activities_outstanding}</p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { label: 'On Schedule', value: report.on_schedule },
                  { label: 'On Budget', value: report.on_budget },
                  { label: 'On Target', value: report.on_target }
                ].map(item => (
                  <span key={item.label} style={{
                    backgroundColor: item.value === 'yes' ? '#e6f4ea' : '#fff3e0',
                    color: item.value === 'yes' ? '#2e7d32' : '#e65100',
                    border: `1px solid ${item.value === 'yes' ? '#4caf50' : '#ff9800'}`,
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.label}: {item.value === 'yes' ? '✅' : '⚠️'}
                  </span>
                ))}
              </div>
            </div>

            {/* Sections 4-7 */}
            {[
              { num: 4, title: 'Adjustments to Scope', value: report.adjustments },
              { num: 5, title: 'Challenges', value: report.challenges },
              { num: 6, title: 'Risks', value: report.risks },
              { num: 7, title: 'Student Comments', value: report.student_comments }
            ].map(section => (
              <div key={section.num} style={{
                backgroundColor: 'white',
                padding: '20px 25px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
              }}>
                <h4 style={{ color: '#8B0000', marginBottom: '8px' }}>
                  {section.num}. {section.title}
                </h4>
                <p style={{ fontSize: '14px', color: '#333' }}>{section.value}</p>
              </div>
            ))}

            {/* Section 8 - Supervisor Comments */}
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
              border: '2px solid #002147'
            }}>
              <h3 style={{
                color: '#002147',
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '10px',
                marginBottom: '15px'
              }}>
                8. Supervisor Comments
              </h3>

              {saved ? (
                <div>
                  <div style={{
                    backgroundColor: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#333',
                    marginBottom: '10px'
                  }}>
                    {supervisorComment}
                  </div>
                  <span style={{
                    backgroundColor: '#e6f4ea',
                    color: '#2e7d32',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    ✅ Comments saved
                  </span>
                </div>
              ) : (
                <div>
                  <textarea
                    value={supervisorComment}
                    onChange={(e) => setSupervisorComment(e.target.value)}
                    placeholder="Write your comments on this progress report..."
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #cccccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical',
                      marginBottom: '15px'
                    }}
                  />
                  <button
                    onClick={handleSave}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#002147',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                    Save Supervisor Comments
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default ProgressReportReview