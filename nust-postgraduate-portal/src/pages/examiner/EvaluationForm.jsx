// src/pages/examiner/EvaluationForm.jsx
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import fakeUsers from '../../utils/fakeUsers'

function EvaluationForm() {

  const navigate = useNavigate()

  // Get only students from fakeUsers
  const students = fakeUsers.filter(u => u.role === 'student')

  // Track selected student
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Section marks - each starts at 0
  const [sectionA, setSectionA] = useState('')
  const [sectionB, setSectionB] = useState('')
  const [sectionC, setSectionC] = useState('')
  const [sectionD, setSectionD] = useState('')
  const [sectionE, setSectionE] = useState('')

  // Comments for each section
  const [commentA, setCommentA] = useState('')
  const [commentB, setCommentB] = useState('')
  const [commentC, setCommentC] = useState('')
  const [commentD, setCommentD] = useState('')
  const [commentE, setCommentE] = useState('')

  // Overall assessment text (Part A of form)
  const [overallAssessment, setOverallAssessment] = useState('')

  // Recommendation (Part C of form)
  const [recommendation, setRecommendation] = useState('')

  // Track submission
  const [submitted, setSubmitted] = useState(false)

  // Calculate total marks
  const totalMarks = 
    (Number(sectionA) || 0) +
    (Number(sectionB) || 0) +
    (Number(sectionC) || 0) +
    (Number(sectionD) || 0) +
    (Number(sectionE) || 0)

  // Validate each section is within allowed range
  const validateMarks = () => {
    if (sectionA < 0 || sectionA > 20) return 'Section A must be between 0 and 20'
    if (sectionB < 0 || sectionB > 30) return 'Section B must be between 0 and 30'
    if (sectionC < 0 || sectionC > 20) return 'Section C must be between 0 and 20'
    if (sectionD < 0 || sectionD > 20) return 'Section D must be between 0 and 20'
    if (sectionE < 0 || sectionE > 10) return 'Section E must be between 0 and 10'
    return null
  }

  const handleSubmit = () => {

    // Check student is selected
    if (!selectedStudent) {
      alert('Please select a student to evaluate.')
      return
    }

    // Check overall assessment is filled
    if (!overallAssessment) {
      alert('Please write an overall assessment.')
      return
    }

    // Check all sections are filled
    if (!sectionA || !sectionB || !sectionC || !sectionD || !sectionE) {
      alert('Please fill in marks for all sections.')
      return
    }

    // Validate mark ranges
    const error = validateMarks()
    if (error) {
      alert(error)
      return
    }

    // Check recommendation is selected
    if (!recommendation) {
      alert('Please select a recommendation.')
      return
    }

    // Build evaluation object
    const evaluation = {
      studentName: selectedStudent.name,
      studentDegree: selectedStudent.degree,
      marks: {
        sectionA: Number(sectionA),
        sectionB: Number(sectionB),
        sectionC: Number(sectionC),
        sectionD: Number(sectionD),
        sectionE: Number(sectionE),
        total: totalMarks
      },
      recommendation,
      overallAssessment,
      submittedAt: new Date().toLocaleDateString()
    }

    console.log('Evaluation submitted:', evaluation)
    setSubmitted(true)

  }

  return (
    <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '800px',
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
            Examiner's Report Form
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Faculty of Computing and Informatics — Thesis Assessment
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/examiner')}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #002147',
            color: '#002147',
            padding: '8px 16px',
            borderRadius: '4px',
            marginBottom: '25px',
            fontSize: '13px'
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
          Select Student to Evaluate
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
              onClick={() => setSelectedStudent(student)}
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

        {/* Show form only when student is selected */}
        {selectedStudent && !submitted && (
          <div>

            {/* Part A - Overall Assessment */}
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{
                color: '#8B0000',
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '10px',
                marginBottom: '15px'
              }}>
                Part A: Overall Assessment Report
              </h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                Write an overall assessment of the work (maximum 2 pages)
              </p>
              <textarea
                value={overallAssessment}
                onChange={(e) => setOverallAssessment(e.target.value)}
                placeholder="Write your overall assessment here..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Part B - Marks */}
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{
                color: '#8B0000',
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '10px',
                marginBottom: '20px'
              }}>
                Part B: Allocation of Marks
              </h3>

              {/* Section A */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontWeight: 'bold',
                  color: '#002147',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Section A: Intellectual Merit (0 - 20 marks)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={sectionA}
                  onChange={(e) => setSectionA(e.target.value)}
                  style={{
                    width: '100px',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                />
                <textarea
                  value={commentA}
                  onChange={(e) => setCommentA(e.target.value)}
                  placeholder="Comments on Section A..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Section B */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontWeight: 'bold',
                  color: '#002147',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Section B: Scientific Merit (0 - 30 marks)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={sectionB}
                  onChange={(e) => setSectionB(e.target.value)}
                  style={{
                    width: '100px',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                />
                <textarea
                  value={commentB}
                  onChange={(e) => setCommentB(e.target.value)}
                  placeholder="Comments on Section B..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Section C */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontWeight: 'bold',
                  color: '#002147',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Section C: Quality of Results (0 - 20 marks)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={sectionC}
                  onChange={(e) => setSectionC(e.target.value)}
                  style={{
                    width: '100px',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                />
                <textarea
                  value={commentC}
                  onChange={(e) => setCommentC(e.target.value)}
                  placeholder="Comments on Section C..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Section D */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontWeight: 'bold',
                  color: '#002147',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Section D: Presentation & Structure (0 - 20 marks)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={sectionD}
                  onChange={(e) => setSectionD(e.target.value)}
                  style={{
                    width: '100px',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                />
                <textarea
                  value={commentD}
                  onChange={(e) => setCommentD(e.target.value)}
                  placeholder="Comments on Section D..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Section E */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontWeight: 'bold',
                  color: '#002147',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Section E: Student Creativity (0 - 10 marks)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={sectionE}
                  onChange={(e) => setSectionE(e.target.value)}
                  style={{
                    width: '100px',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                />
                <textarea
                  value={commentE}
                  onChange={(e) => setCommentE(e.target.value)}
                  placeholder="Comments on Section E..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Live total */}
              <div style={{
                backgroundColor: '#002147',
                color: 'white',
                padding: '15px 20px',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 'bold' }}>Total Marks:</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {totalMarks} / 100
                </span>
              </div>

            </div>

            {/* Part C - Recommendation */}
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{
                color: '#8B0000',
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '10px',
                marginBottom: '15px'
              }}>
                Part C: Recommendation
              </h3>

              {['a', 'b', 'c', 'd'].map((opt, index) => (
                <label key={opt} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    value={opt}
                    checked={recommendation === opt}
                    onChange={(e) => setRecommendation(e.target.value)}
                    style={{ marginTop: '3px' }}
                  />
                  <span>
                    {opt === 'a' && 'Candidate be awarded the degree — thesis accepted in present form'}
                    {opt === 'b' && 'Candidate be awarded the degree — after minor changes to satisfaction of supervisor'}
                    {opt === 'c' && 'Candidate should be invited to do further work, revise and resubmit for re-examination'}
                    {opt === 'd' && 'Degree should NOT be awarded — thesis rejected'}
                  </span>
                </label>
              ))}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#002147',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '30px'
              }}>
              Submit Evaluation
            </button>

          </div>
        )}

        {/* Success message after submission */}
        {submitted && (
          <div style={{
            backgroundColor: '#e6f4ea',
            border: '1px solid #4caf50',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '10px' }}>
              ✅ Evaluation Submitted Successfully!
            </h2>
            <p style={{ color: '#333', marginBottom: '5px' }}>
              Student: <strong>{selectedStudent?.name}</strong>
            </p>
            <p style={{ color: '#333', marginBottom: '5px' }}>
              Degree: <strong>{selectedStudent?.degree}</strong>
            </p>
            <p style={{ color: '#333', marginBottom: '20px' }}>
              Total Mark: <strong>{totalMarks} / 100</strong>
            </p>
            <button
              onClick={() => navigate('/examiner')}
              style={{
                backgroundColor: '#002147',
                color: 'white',
                border: 'none',
                padding: '10px 25px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default EvaluationForm