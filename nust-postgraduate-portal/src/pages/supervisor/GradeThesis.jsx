// src/pages/supervisor/GradeThesis.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { calculateFinalMark } from '../../utils/calculateMarks'

function GradeThesis() {

  const navigate = useNavigate()
  const { user } = useAuth()

  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [existingEvaluation, setExistingEvaluation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  // Form fields
  const [sectionA, setSectionA] = useState('')
  const [sectionB, setSectionB] = useState('')
  const [sectionC, setSectionC] = useState('')
  const [sectionD, setSectionD] = useState('')
  const [sectionE, setSectionE] = useState('')
  const [commentA, setCommentA] = useState('')
  const [commentB, setCommentB] = useState('')
  const [commentC, setCommentC] = useState('')
  const [commentD, setCommentD] = useState('')
  const [commentE, setCommentE] = useState('')
  const [overallAssessment, setOverallAssessment] = useState('')
  const [recommendation, setRecommendation] = useState('')

  const totalMarks =
    (Number(sectionA) || 0) +
    (Number(sectionB) || 0) +
    (Number(sectionC) || 0) +
    (Number(sectionD) || 0) +
    (Number(sectionE) || 0)

  // Fetch assigned students whose thesis is approved
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/auth/supervisor-students/${user.id}`
        )
        const data = await response.json()

        // Filter only students with approved thesis
        const approvedStudents = []
        for (const student of data) {
          const thesisRes = await fetch(
            `http://localhost:5000/api/theses/student/${student.id}`
          )
          const thesisData = await thesisRes.json()
          if (thesisData.length > 0 && thesisData[0].supervisor_status === 'approved') {
            approvedStudents.push(student)
          }
        }
        setStudents(approvedStudents)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [user.id])

  // Check existing evaluation
  useEffect(() => {
    if (!selectedStudent) return
    const checkExisting = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/evaluations/student/${selectedStudent.id}`
        )
        const data = await response.json()
        const myEval = data.find(e => e.examiner_id === user.id)
        setExistingEvaluation(myEval || null)
      } catch (err) {
        console.error('Error:', err)
      }
    }
    checkExisting()
  }, [selectedStudent, user.id])

  const validateMarks = () => {
    if (sectionA < 0 || sectionA > 20) return 'Section A must be between 0 and 20'
    if (sectionB < 0 || sectionB > 30) return 'Section B must be between 0 and 30'
    if (sectionC < 0 || sectionC > 20) return 'Section C must be between 0 and 20'
    if (sectionD < 0 || sectionD > 20) return 'Section D must be between 0 and 20'
    if (sectionE < 0 || sectionE > 10) return 'Section E must be between 0 and 10'
    return null
  }

  const handleSubmit = async () => {

    if (!selectedStudent) { alert('Please select a student.'); return }
    if (!overallAssessment) { alert('Please write an overall assessment.'); return }
    if (!sectionA || !sectionB || !sectionC || !sectionD || !sectionE) {
      alert('Please fill in all sections.'); return
    }
    const error = validateMarks()
    if (error) { alert(error); return }
    if (!recommendation) { alert('Please select a recommendation.'); return }

    // Confirmation popup
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to submit this evaluation?\n\nOnce submitted, you CANNOT modify the marks.\n\nTotal Mark: ${totalMarks}/100`
    )
    if (!confirmed) return

    try {
      const response = await fetch('http://localhost:5000/api/evaluations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          examinerId: user.id,
          examinerType: 'internal',
          sectionA: Number(sectionA),
          sectionB: Number(sectionB),
          sectionC: Number(sectionC),
          sectionD: Number(sectionD),
          sectionE: Number(sectionE),
          totalMark: totalMarks,
          overallAssessment,
          recommendation,
          commentA, commentB, commentC, commentD, commentE
        })
      })

      const data = await response.json()
      if (!response.ok) { alert(data.message); return }
      setSubmitted(true)

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Grade Thesis</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Internal Examiner Evaluation — {user.name}
          </p>
        </div>

        <button onClick={() => navigate('/supervisor')} style={{
          backgroundColor: 'transparent', border: '1px solid #002147',
          color: '#002147', padding: '8px 16px', borderRadius: '4px',
          marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
        }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading students..." />}

        {/* No students with approved thesis */}
        {!loading && students.length === 0 && (
          <div style={{
            backgroundColor: '#fff3e0', border: '1px solid #ff9800',
            padding: '25px', borderRadius: '8px',
            textAlign: 'center', color: '#e65100'
          }}>
            ⏳ No approved theses to grade yet.
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              You can only grade a thesis after you have approved it.
            </p>
          </div>
        )}

        {/* Student selection */}
        {!loading && students.length > 0 && (
          <div>
            <h2 style={{
              color: '#002147', marginBottom: '20px', fontSize: '18px',
              borderLeft: '4px solid #8B0000', paddingLeft: '10px'
            }}>
              Select Student to Grade
            </h2>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {students.map(student => (
                <div
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student)
                    setExistingEvaluation(null)
                    setSubmitted(false)
                  }}
                  style={{
                    backgroundColor: selectedStudent?.id === student.id ? '#002147' : 'white',
                    color: selectedStudent?.id === student.id ? 'white' : '#333',
                    border: '1px solid #dddddd',
                    borderTop: `4px solid ${student.degree === 'PhD' ? '#8B0000' : '#002147'}`,
                    padding: '15px 20px', borderRadius: '8px',
                    cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                  }}>
                  <h3 style={{ marginBottom: '6px', fontSize: '14px' }}>{student.name}</h3>
                  <span style={{
                    backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                    color: 'white', padding: '2px 8px',
                    borderRadius: '12px', fontSize: '11px'
                  }}>
                    {student.degree}
                  </span>
                </div>
              ))}
            </div>

            {/* Already evaluated - read only */}
            {selectedStudent && existingEvaluation && !submitted && (
              <div style={{
                backgroundColor: '#f0f7ff', border: '2px solid #002147',
                padding: '25px', borderRadius: '8px', marginBottom: '20px'
              }}>
                <h3 style={{ color: '#002147', marginBottom: '15px' }}>
                  ✅ You have already graded {selectedStudent.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                  Submitted: {new Date(existingEvaluation.submitted_at).toLocaleDateString()}
                </p>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                  {[
                    { label: 'Section A — Intellectual Merit', mark: existingEvaluation.section_a, max: 20 },
                    { label: 'Section B — Scientific Merit', mark: existingEvaluation.section_b, max: 30 },
                    { label: 'Section C — Quality of Results', mark: existingEvaluation.section_c, max: 20 },
                    { label: 'Section D — Presentation', mark: existingEvaluation.section_d, max: 20 },
                    { label: 'Section E — Creativity', mark: existingEvaluation.section_e, max: 10 }
                  ].map(s => (
                    <div key={s.label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px'
                    }}>
                      <span>{s.label}</span>
                      <span style={{ fontWeight: 'bold', color: '#002147' }}>
                        {s.mark}/{s.max}
                      </span>
                    </div>
                  ))}
                  <div style={{
                    backgroundColor: '#002147', color: 'white',
                    padding: '12px 15px', borderRadius: '6px',
                    display: 'flex', justifyContent: 'space-between', marginTop: '15px'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>Total Mark:</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {existingEvaluation.total_mark}/100
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Evaluation form */}
            {selectedStudent && !existingEvaluation && !submitted && (
              <div>

                {/* Part A */}
                <div style={{
                  backgroundColor: 'white', padding: '25px',
                  borderRadius: '8px', marginBottom: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                }}>
                  <h3 style={{
                    color: '#8B0000', borderBottom: '2px solid #f0f0f0',
                    paddingBottom: '10px', marginBottom: '15px'
                  }}>
                    Part A: Overall Assessment
                  </h3>
                  <textarea
                    value={overallAssessment}
                    onChange={(e) => setOverallAssessment(e.target.value)}
                    placeholder="Write your overall assessment..."
                    rows={6}
                    style={{
                      width: '100%', padding: '10px',
                      border: '1px solid #cccccc', borderRadius: '4px',
                      fontSize: '14px', resize: 'vertical'
                    }}
                  />
                </div>

                {/* Part B */}
                <div style={{
                  backgroundColor: 'white', padding: '25px',
                  borderRadius: '8px', marginBottom: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                }}>
                  <h3 style={{
                    color: '#8B0000', borderBottom: '2px solid #f0f0f0',
                    paddingBottom: '10px', marginBottom: '20px'
                  }}>
                    Part B: Allocation of Marks
                  </h3>

                  {[
                    { label: 'Section A: Intellectual Merit', max: 20, value: sectionA, setter: setSectionA, comment: commentA, commentSetter: setCommentA },
                    { label: 'Section B: Scientific Merit', max: 30, value: sectionB, setter: setSectionB, comment: commentB, commentSetter: setCommentB },
                    { label: 'Section C: Quality of Results', max: 20, value: sectionC, setter: setSectionC, comment: commentC, commentSetter: setCommentC },
                    { label: 'Section D: Presentation & Structure', max: 20, value: sectionD, setter: setSectionD, comment: commentD, commentSetter: setCommentD },
                    { label: 'Section E: Student Creativity', max: 10, value: sectionE, setter: setSectionE, comment: commentE, commentSetter: setCommentE }
                  ].map(section => (
                    <div key={section.label} style={{ marginBottom: '20px' }}>
                      <label style={{
                        fontWeight: 'bold', color: '#002147',
                        display: 'block', marginBottom: '6px'
                      }}>
                        {section.label} (0 - {section.max} marks)
                      </label>
                      <input
                        type="number" min="0" max={section.max}
                        value={section.value}
                        onChange={(e) => section.setter(e.target.value)}
                        style={{
                          width: '100px', padding: '8px',
                          border: '1px solid #cccccc', borderRadius: '4px',
                          fontSize: '14px', marginBottom: '8px'
                        }}
                      />
                      <textarea
                        value={section.comment}
                        onChange={(e) => section.commentSetter(e.target.value)}
                        placeholder={`Comments on ${section.label}...`}
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
                    padding: '15px 20px', borderRadius: '6px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>Total Marks:</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {totalMarks} / 100
                    </span>
                  </div>
                </div>

                {/* Part C */}
                <div style={{
                  backgroundColor: 'white', padding: '25px',
                  borderRadius: '8px', marginBottom: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                }}>
                  <h3 style={{
                    color: '#8B0000', borderBottom: '2px solid #f0f0f0',
                    paddingBottom: '10px', marginBottom: '15px'
                  }}>
                    Part C: Recommendation
                  </h3>
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <label key={opt} style={{
                      display: 'flex', alignItems: 'flex-start',
                      gap: '10px', marginBottom: '12px',
                      fontSize: '14px', cursor: 'pointer'
                    }}>
                      <input
                        type="radio" value={opt}
                        checked={recommendation === opt}
                        onChange={(e) => setRecommendation(e.target.value)}
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

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  style={{
                    width: '100%', padding: '14px',
                    backgroundColor: '#002147', color: 'white',
                    border: 'none', borderRadius: '4px',
                    fontSize: '16px', fontWeight: 'bold',
                    marginBottom: '30px', cursor: 'pointer'
                  }}>
                  Submit Evaluation
                </button>

              </div>
            )}

            {/* Success */}
            {submitted && (
              <div style={{
                backgroundColor: '#e6f4ea', border: '1px solid #4caf50',
                padding: '30px', borderRadius: '8px', textAlign: 'center'
              }}>
                <h2 style={{ color: '#2e7d32', marginBottom: '10px' }}>
                  ✅ Evaluation Submitted Successfully!
                </h2>
                <p style={{ color: '#333', marginBottom: '5px' }}>
                  Student: <strong>{selectedStudent?.name}</strong>
                </p>
                <p style={{ color: '#333', marginBottom: '20px' }}>
                  Total Mark: <strong>{totalMarks}/100</strong>
                </p>
                <button
                  onClick={() => navigate('/supervisor')}
                  style={{
                    backgroundColor: '#002147', color: 'white',
                    border: 'none', padding: '10px 25px',
                    borderRadius: '4px', fontSize: '14px', cursor: 'pointer'
                  }}>
                  Back to Dashboard
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

export default GradeThesis