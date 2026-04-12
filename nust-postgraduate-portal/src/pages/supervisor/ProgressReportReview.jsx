// src/pages/supervisor/ProgressReportReview.jsx
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import fakeUsers from '../../utils/fakeUsers'

function ProgressReportReview() {

  const navigate = useNavigate()

  // Get only students
  const students = fakeUsers.filter(u => u.role === 'student')

  // Track selected student
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Supervisor comment - Section 8
  const [supervisorComment, setSupervisorComment] = useState('')

  // Track if comment was saved
  const [saved, setSaved] = useState(false)

  // Simulated progress report data
  // In real system this comes from database
  const simulatedReport = {
    researchProblem: 'Investigating the impact of machine learning on healthcare data analysis in Namibia.',
    objectives: '1. Review existing ML models\n2. Collect healthcare datasets\n3. Implement and test models\n4. Evaluate results',
    activitiesCompleted: 'Completed literature review and identified 3 suitable ML models for testing.',
    activitiesInProgress: 'Currently collecting datasets from local hospitals.',
    activitiesOutstanding: 'Model implementation and testing still outstanding.',
    onSchedule: 'yes',
    onBudget: 'yes',
    onTarget: 'no',
    adjustments: 'Scope narrowed to focus on two hospitals instead of five.',
    challenges: 'Difficulty obtaining ethical clearance from one hospital.',
    risks: 'Data availability may affect final results.',
    studentComments: 'Making steady progress despite challenges with data collection.',
    submittedAt: '12/04/2026'
  }

  const handleSave = () => {

    if (!supervisorComment) {
      alert('Please write your comments before saving.')
      return
    }

    console.log('Supervisor comment saved:', {
      student: selectedStudent.name,
      comment: supervisorComment,
      savedAt: new Date().toLocaleDateString()
    })

    setSaved(true)

  }

  return (
    <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147',
          color: 'white',
          padding: '25px 30px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>
            Progress Report Review
          </h1>
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

        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          marginBottom: '30px'
        }}>
          {students.map(student => (
            <div
              key={student.id}
              onClick={() => {
                setSelectedStudent(student)
                setSaved(false)
                setSupervisorComment('')
              }}
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
              <h3 style={{ marginBottom: '6px', fontSize: '14px' }}>
                {student.name}
              </h3>
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

        {/* Show report when student selected */}
        {selectedStudent && (
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
              <strong> Submitted:</strong> {simulatedReport.submittedAt}
            </div>

            {/* Section 1 */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h4 style={{ color: '#8B0000', marginBottom: '8px' }}>
                1. Research Problem
              </h4>
              <p style={{ fontSize: '14px', color: '#333' }}>
                {simulatedReport.researchProblem}
              </p>
            </div>

            {/* Section 2 */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h4 style={{ color: '#8B0000', marginBottom: '8px' }}>
                2. Research Objectives
              </h4>
              <p style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-line' }}>
                {simulatedReport.objectives}
              </p>
            </div>

            {/* Section 3 */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h4 style={{ color: '#8B0000', marginBottom: '12px' }}>
                3. Evaluation
              </h4>

              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#002147' }}>
                Activities Completed:
              </p>
              <p style={{ fontSize: '14px', color: '#333', marginBottom: '10px' }}>
                {simulatedReport.activitiesCompleted}
              </p>

              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#002147' }}>
                Activities In Progress:
              </p>
              <p style={{ fontSize: '14px', color: '#333', marginBottom: '10px' }}>
                {simulatedReport.activitiesInProgress}
              </p>

              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#002147' }}>
                Activities Outstanding:
              </p>
              <p style={{ fontSize: '14px', color: '#333', marginBottom: '15px' }}>
                {simulatedReport.activitiesOutstanding}
              </p>

              {/* Status indicators */}
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                {[
                  { label: 'On Schedule', value: simulatedReport.onSchedule },
                  { label: 'On Budget', value: simulatedReport.onBudget },
                  { label: 'On Target', value: simulatedReport.onTarget }
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
              { num: 4, title: 'Adjustments to Scope', value: simulatedReport.adjustments },
              { num: 5, title: 'Challenges', value: simulatedReport.challenges },
              { num: 6, title: 'Risks', value: simulatedReport.risks },
              { num: 7, title: 'Student Comments', value: simulatedReport.studentComments }
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
                <p style={{ fontSize: '14px', color: '#333' }}>
                  {section.value}
                </p>
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

              {/* Show saved comment as read only */}
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