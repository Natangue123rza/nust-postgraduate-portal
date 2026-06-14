// src/pages/examiner/ExaminerDashboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'

function ExaminerDashboard() {

  const { user } = useAuth()
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState([])
  const [documents, setDocuments] = useState({})
  const [existingEvaluations, setExistingEvaluations] = useState({})
  const [loading, setLoading] = useState(true)

  // Evaluation form state per student
  const [formData, setFormData] = useState({})
  const [submitted, setSubmitted] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignments
        const assignRes = await fetch(
          `http://localhost:5000/api/assignments/examiner/${user.id}`
        )
        const assignData = await assignRes.json()
        setAssignments(assignData)

        // Fetch docs and existing evaluations for each student
        const docsMap = {}
        const evalsMap = {}

        for (const assignment of assignData) {
          // Documents
          const docRes = await fetch(
            `http://localhost:5000/api/assignments/student-documents/${assignment.student_id}`
          )
          docsMap[assignment.student_id] = await docRes.json()

          // Existing evaluations
          const evalRes = await fetch(
            `http://localhost:5000/api/evaluations/student/${assignment.student_id}`
          )
          const evalData = await evalRes.json()
          const myEval = evalData.find(e => e.examiner_id === user.id)
          if (myEval) evalsMap[assignment.student_id] = myEval
        }

        setDocuments(docsMap)
        setExistingEvaluations(evalsMap)

      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.id])

  // Update form field for a specific student
  const updateForm = (studentId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
  }

  const getForm = (studentId) => formData[studentId] || {}

  const getTotalMarks = (studentId) => {
    const f = getForm(studentId)
    return (Number(f.sectionA) || 0) +
      (Number(f.sectionB) || 0) +
      (Number(f.sectionC) || 0) +
      (Number(f.sectionD) || 0) +
      (Number(f.sectionE) || 0)
  }

  const handleSubmit = async (studentId, studentName) => {
    const f = getForm(studentId)

    if (!f.overallAssessment) { alert('Please write an overall assessment.'); return }
    if (!f.sectionA || !f.sectionB || !f.sectionC || !f.sectionD || !f.sectionE) {
      alert('Please fill in all mark sections.'); return
    }
    if (!f.recommendation) { alert('Please select a recommendation.'); return }

    // Validate ranges
    if (f.sectionA > 20) { alert('Section A max is 20'); return }
    if (f.sectionB > 30) { alert('Section B max is 30'); return }
    if (f.sectionC > 20) { alert('Section C max is 20'); return }
    if (f.sectionD > 20) { alert('Section D max is 20'); return }
    if (f.sectionE > 10) { alert('Section E max is 10'); return }

    // Confirmation popup
    const confirmed = window.confirm(
      `⚠️ Submit evaluation for ${studentName}?\n\nTotal Mark: ${getTotalMarks(studentId)}/100\n\nOnce submitted you CANNOT modify the marks.`
    )
    if (!confirmed) return

    try {
      const response = await fetch('http://localhost:5000/api/evaluations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          examinerId: user.id,
          examinerType: 'external',
          sectionA: Number(f.sectionA),
          sectionB: Number(f.sectionB),
          sectionC: Number(f.sectionC),
          sectionD: Number(f.sectionD),
          sectionE: Number(f.sectionE),
          totalMark: getTotalMarks(studentId),
          overallAssessment: f.overallAssessment,
          recommendation: f.recommendation,
          commentA: f.commentA || '',
          commentB: f.commentB || '',
          commentC: f.commentC || '',
          commentD: f.commentD || '',
          commentE: f.commentE || ''
        })
      })

      const data = await response.json()
      if (!response.ok) { alert(data.message); return }

      setSubmitted(prev => ({ ...prev, [studentId]: true }))
      setExistingEvaluations(prev => ({
        ...prev,
        [studentId]: { total_mark: getTotalMarks(studentId) }
      }))

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    }
  }

  return (
    <div>
      <Navbar />

      <div style={{ padding: '30px', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>Welcome, {user.name}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
           {user.faculty_name || 'Namibia University of Science and Technology'}
          </p>
        </div>

        {loading && <LoadingSpinner message="Loading your assignments..." />}

        {/* No assignments */}
        {!loading && assignments.length === 0 && (
          <div style={{
            backgroundColor: '#fff3e0', border: '1px solid #ff9800',
            padding: '25px', borderRadius: '8px',
            textAlign: 'center', color: '#e65100', fontSize: '14px'
          }}>
            ⏳ <strong>No students assigned yet.</strong>
            <p style={{ marginTop: '8px', fontSize: '13px' }}>
              You will be notified by the HOD when a student is assigned to you.
            </p>
          </div>
        )}

        {/* Assigned students with embedded evaluation */}
        {!loading && assignments.map(assignment => {
          const studentDocs = documents[assignment.student_id] || {}
          const existingEval = existingEvaluations[assignment.student_id]
          const isSubmitted = submitted[assignment.student_id]
          const f = getForm(assignment.student_id)

          return (
            <div key={assignment.id} style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderLeft: `4px solid ${assignment.degree === 'PhD' ? '#8B0000' : '#002147'}`,
              borderRadius: '8px', padding: '25px',
              marginBottom: '30px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>

              {/* Student info */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '20px'
              }}>
                <div>
                  <h2 style={{ color: '#002147', marginBottom: '5px', fontSize: '20px' }}>
                    {assignment.student_name}
                  </h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{
                      backgroundColor: assignment.degree === 'PhD' ? '#8B0000' : '#002147',
                      color: 'white', padding: '3px 10px',
                      borderRadius: '12px', fontSize: '11px'
                    }}>
                      {assignment.degree}
                    </span>
                    <span style={{
                      backgroundColor: '#f0f7ff', color: '#002147',
                      padding: '3px 10px', borderRadius: '12px',
                      fontSize: '11px', border: '1px solid #002147'
                    }}>
                      {assignment.examiner_type === 'internal' ? 'Internal Examiner' : 'External Examiner'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div style={{
                backgroundColor: '#f5f5f5', padding: '15px',
                borderRadius: '6px', marginBottom: '20px'
              }}>
                <h4 style={{ color: '#002147', marginBottom: '12px', fontSize: '14px' }}>
                  📁 Student Documents
                </h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

                  {studentDocs.proposal?.file_name ? (
                    
                    <a  href={`http://localhost:5000/api/uploads/${studentDocs.proposal.file_name}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#002147', color: 'white',
                        padding: '8px 16px', borderRadius: '4px',
                        fontSize: '13px', textDecoration: 'none'
                      }}>
                      📄 View Research Proposal
                    </a>
                  ) : (
                    <span style={{
                      backgroundColor: '#f0f0f0', color: '#999',
                      padding: '8px 16px', borderRadius: '4px', fontSize: '13px'
                    }}>
                      📄 No Proposal Uploaded
                    </span>
                  )}

                  {studentDocs.thesis?.file_name ? (
                    
                   <a  href={`http://localhost:5000/api/uploads/${studentDocs.thesis.file_name}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#8B0000', color: 'white',
                        padding: '8px 16px', borderRadius: '4px',
                        fontSize: '13px', textDecoration: 'none'
                      }}>
                      🎓 View Thesis
                    </a>
                  ) : (
                    <span style={{
                      backgroundColor: '#f0f0f0', color: '#999',
                      padding: '8px 16px', borderRadius: '4px', fontSize: '13px'
                    }}>
                      🎓 No Thesis Uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* Already evaluated - read only */}
              {(existingEval && !isSubmitted) && (
                <div style={{
                  backgroundColor: '#f0f7ff', border: '2px solid #002147',
                  padding: '20px', borderRadius: '8px'
                }}>
                  <h3 style={{ color: '#002147', marginBottom: '10px' }}>
                    ✅ Evaluation Already Submitted
                  </h3>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                    You have already submitted your evaluation for this student.
                    This record is read-only.
                  </p>
                  <div style={{
                    backgroundColor: '#002147', color: 'white',
                    padding: '12px 15px', borderRadius: '6px',
                    display: 'flex', justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>Total Mark Submitted:</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {existingEval.total_mark}/100
                    </span>
                  </div>
                </div>
              )}

              {/* Success message */}
              {isSubmitted && (
                <div style={{
                  backgroundColor: '#e6f4ea', border: '1px solid #4caf50',
                  padding: '20px', borderRadius: '8px', textAlign: 'center'
                }}>
                  <h3 style={{ color: '#2e7d32', marginBottom: '10px' }}>
                    ✅ Evaluation Submitted Successfully!
                  </h3>
                  <p style={{ color: '#333' }}>
                    Total Mark: <strong>{getTotalMarks(assignment.student_id)}/100</strong>
                  </p>
                </div>
              )}

              {/* Evaluation form - only if not submitted */}
              {!existingEval && !isSubmitted && (
                <div>
                  <h3 style={{
                    color: '#002147', marginBottom: '20px',
                    fontSize: '18px', borderLeft: '4px solid #8B0000',
                    paddingLeft: '10px'
                  }}>
                    📝 Submit Evaluation
                  </h3>

                  {/* Part A */}
                  <div style={{
                    backgroundColor: '#f9f9f9', padding: '20px',
                    borderRadius: '8px', marginBottom: '15px',
                    border: '1px solid #eeeeee'
                  }}>
                    <h4 style={{ color: '#8B0000', marginBottom: '10px' }}>
                      Part A: Overall Assessment
                    </h4>
                    <textarea
                      value={f.overallAssessment || ''}
                      onChange={(e) => updateForm(assignment.student_id, 'overallAssessment', e.target.value)}
                      placeholder="Write your overall assessment..."
                      rows={5}
                      style={{
                        width: '100%', padding: '10px',
                        border: '1px solid #cccccc', borderRadius: '4px',
                        fontSize: '14px', resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Part B */}
                  <div style={{
                    backgroundColor: '#f9f9f9', padding: '20px',
                    borderRadius: '8px', marginBottom: '15px',
                    border: '1px solid #eeeeee'
                  }}>
                    <h4 style={{ color: '#8B0000', marginBottom: '15px' }}>
                      Part B: Allocation of Marks
                    </h4>

                    {[
                      { key: 'sectionA', commentKey: 'commentA', label: 'Section A: Intellectual Merit', max: 20 },
                      { key: 'sectionB', commentKey: 'commentB', label: 'Section B: Scientific Merit', max: 30 },
                      { key: 'sectionC', commentKey: 'commentC', label: 'Section C: Quality of Results', max: 20 },
                      { key: 'sectionD', commentKey: 'commentD', label: 'Section D: Presentation & Structure', max: 20 },
                      { key: 'sectionE', commentKey: 'commentE', label: 'Section E: Student Creativity', max: 10 }
                    ].map(section => (
                      <div key={section.key} style={{ marginBottom: '15px' }}>
                        <label style={{
                          fontWeight: 'bold', color: '#002147',
                          display: 'block', marginBottom: '5px', fontSize: '13px'
                        }}>
                          {section.label} (0 - {section.max})
                        </label>
                        <input
                          type="number" min="0" max={section.max}
                          value={f[section.key] || ''}
                          onChange={(e) => updateForm(assignment.student_id, section.key, e.target.value)}
                          style={{
                            width: '100px', padding: '8px',
                            border: '1px solid #cccccc', borderRadius: '4px',
                            fontSize: '14px', marginBottom: '6px'
                          }}
                        />
                        <textarea
                          value={f[section.commentKey] || ''}
                          onChange={(e) => updateForm(assignment.student_id, section.commentKey, e.target.value)}
                          placeholder={`Comments...`}
                          rows={2}
                          style={{
                            width: '100%', padding: '8px',
                            border: '1px solid #cccccc', borderRadius: '4px',
                            fontSize: '13px', resize: 'vertical'
                          }}
                        />
                      </div>
                    ))}

                    {/* Live total */}
                    <div style={{
                      backgroundColor: '#002147', color: 'white',
                      padding: '12px 15px', borderRadius: '6px',
                      display: 'flex', justifyContent: 'space-between'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>Total Marks:</span>
                      <span style={{ fontSize: '22px', fontWeight: 'bold' }}>
                        {getTotalMarks(assignment.student_id)} / 100
                      </span>
                    </div>
                  </div>

                  {/* Part C */}
                  <div style={{
                    backgroundColor: '#f9f9f9', padding: '20px',
                    borderRadius: '8px', marginBottom: '15px',
                    border: '1px solid #eeeeee'
                  }}>
                    <h4 style={{ color: '#8B0000', marginBottom: '12px' }}>
                      Part C: Recommendation
                    </h4>
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <label key={opt} style={{
                        display: 'flex', alignItems: 'flex-start',
                        gap: '10px', marginBottom: '10px',
                        fontSize: '14px', cursor: 'pointer'
                      }}>
                        <input
                          type="radio" value={opt}
                          checked={f.recommendation === opt}
                          onChange={(e) => updateForm(assignment.student_id, 'recommendation', e.target.value)}
                          style={{ marginTop: '3px' }}
                        />
                        <span>
                          {opt === 'a' && 'Thesis accepted in present form'}
                          {opt === 'b' && 'Accepted after minor corrections'}
                          {opt === 'c' && 'Revise and resubmit for re-examination'}
                          {opt === 'd' && 'Degree NOT awarded — thesis rejected'}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={() => handleSubmit(assignment.student_id, assignment.student_name)}
                    style={{
                      width: '100%', padding: '14px',
                      backgroundColor: '#002147', color: 'white',
                      border: 'none', borderRadius: '4px',
                      fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                    Submit Evaluation for {assignment.student_name}
                  </button>

                </div>
              )}

            </div>
          )
        })}

      </div>
    </div>
  )
}

export default ExaminerDashboard