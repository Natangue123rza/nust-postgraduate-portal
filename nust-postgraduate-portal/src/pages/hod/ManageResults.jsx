// src/pages/hod/ManageResults.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'

function ManageResults() {

  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all students
        const studentsRes = await fetch('http://localhost:5000/api/auth/students')
        const studentsData = await studentsRes.json()
        setStudents(studentsData)

        // Fetch all evaluations
        const evalsRes = await fetch('http://localhost:5000/api/evaluations/all')
        const evalsData = await evalsRes.json()
        setEvaluations(evalsData)

      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Get evaluations for a specific student
  const getStudentEvaluations = (studentId) => {
    return evaluations.filter(e => e.student_id === studentId)
  }

  // Calculate final mark and check discrepancy
  const calculateResult = (studentDegree, studentEvals) => {
    if (studentEvals.length === 0) return null

    if (studentDegree === 'Masters') {
      return {
        finalMark: studentEvals[0].total_mark,
        discrepancy: false,
        status: 'Ready to Release',
        message: `Final mark: ${studentEvals[0].total_mark}/100`
      }
    }

    if (studentDegree === 'PhD') {
      if (studentEvals.length === 1) {
        return {
          finalMark: null,
          discrepancy: false,
          status: 'Awaiting Second Examiner',
          message: 'Waiting for external examiner mark'
        }
      }

      const mark1 = studentEvals[0].total_mark
      const mark2 = studentEvals[1].total_mark
      const difference = Math.abs(mark1 - mark2)

      if (difference > 10) {
        return {
          finalMark: null,
          discrepancy: true,
          difference,
          status: 'Discrepancy — Requires Review',
          message: `⚠️ ${difference} point difference between examiners (${mark1} vs ${mark2})`
        }
      }

      const average = Math.round((mark1 + mark2) / 2)
      return {
        finalMark: average,
        discrepancy: false,
        status: 'Ready to Release',
        message: `Final mark: ${average}/100 (average of ${mark1} and ${mark2})`
      }
    }
  }

  // Release marks to student
  const handleRelease = async (studentId, studentName) => {
    if (!window.confirm(`Release results to ${studentName}? This cannot be undone.`)) return

    setReleasing(studentId)

    try {
      const response = await fetch(
        `http://localhost:5000/api/evaluations/release/${studentId}`,
        { method: 'PUT' }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message)
        return
      }

      alert(`✅ Results successfully released to ${studentName}!`)

      // Refresh evaluations
      const evalsRes = await fetch('http://localhost:5000/api/evaluations/all')
      const evalsData = await evalsRes.json()
      setEvaluations(evalsData)

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    } finally {
      setReleasing(null)
    }
  }

  const statusColor = (status) => {
    if (status === 'Ready to Release') return { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' }
    if (status === 'Discrepancy — Requires Review') return { bg: '#fce4e4', color: '#c62828', border: '#ef5350' }
    if (status === 'Awaiting Second Examiner') return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' }
    return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' }
  }

  // Handle examiner reassignment for discrepancy
const handleReassign = async (studentId, studentName) => {
  if (!window.confirm(
    `Reassign examiner for ${studentName}?\n\nThis will:\n• Delete existing evaluations\n• Allow new examiner to be assigned\n• Notify the student`
  )) return

  try {
    // Delete existing evaluations for this student
    const response = await fetch(
      `http://localhost:5000/api/evaluations/delete/${studentId}`,
      { method: 'DELETE' }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.message)
      return
    }

    // Notify student
    await fetch('http://localhost:5000/api/notifications/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: studentId,
        title: '🔄 Thesis Being Remarked',
        message: 'There was a discrepancy between your examiner marks. Your thesis has been sent for remarking. You will be notified when new results are available.'
      })
    })

    alert(`✅ Evaluations cleared for ${studentName}. Please assign a new examiner.`)

    // Refresh evaluations
    const evalsRes = await fetch('http://localhost:5000/api/evaluations/all')
    const evalsData = await evalsRes.json()
    setEvaluations(evalsData)

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
          backgroundColor: '#002147',
          color: 'white',
          padding: '25px 30px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Manage Examination Results</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Review examiner marks and release results to students
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/hod')}
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

        {loading && <LoadingSpinner message="Loading results..." />}

        {!loading && (
          <div>
            {students.map(student => {
              const studentEvals = getStudentEvaluations(student.id)
              const result = calculateResult(student.degree, studentEvals)
              const isReleased = studentEvals.length > 0 && studentEvals.every(e => e.is_released)

              return (
                <div key={student.id} style={{
                  backgroundColor: 'white',
                  border: '1px solid #dddddd',
                  borderLeft: `4px solid ${student.degree === 'PhD' ? '#8B0000' : '#002147'}`,
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                }}>

                  {/* Student info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <h3 style={{ color: '#002147', marginBottom: '5px' }}>
                        {student.name}
                      </h3>
                      <span style={{
                        backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                        color: 'white',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}>
                        {student.degree}
                      </span>
                    </div>

                    {/* Released badge */}
                    {isReleased && (
                      <span style={{
                        backgroundColor: '#e6f4ea',
                        color: '#2e7d32',
                        border: '1px solid #4caf50',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ✅ Results Released
                      </span>
                    )}
                  </div>

                  {/* No evaluations yet */}
                  {studentEvals.length === 0 && (
                    <p style={{ color: '#666', fontSize: '13px' }}>
                      ⏳ No examiner evaluations submitted yet.
                    </p>
                  )}

                  {/* Show evaluations */}
                  {studentEvals.length > 0 && (
                    <div>

                      {/* Examiner marks */}
                      <div style={{ marginBottom: '15px' }}>
                        {studentEvals.map((evaluation, index) => (
                          <div key={evaluation.id} style={{
                            backgroundColor: '#f5f5f5',
                            padding: '12px 15px',
                            borderRadius: '6px',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}>
                              <span style={{ fontWeight: 'bold', color: '#002147', fontSize: '14px' }}>
                                {index === 0 ? 'Internal Examiner' : 'External Examiner'}: {evaluation.examiner_name}
                              </span>
                              <span style={{
                                backgroundColor: '#002147',
                                color: 'white',
                                padding: '3px 12px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: 'bold'
                              }}>
                                {evaluation.total_mark}/100
                              </span>
                            </div>

                            {/* Section marks */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {[
                                { label: 'A', mark: evaluation.section_a, max: 20 },
                                { label: 'B', mark: evaluation.section_b, max: 30 },
                                { label: 'C', mark: evaluation.section_c, max: 20 },
                                { label: 'D', mark: evaluation.section_d, max: 20 },
                                { label: 'E', mark: evaluation.section_e, max: 10 }
                              ].map(s => (
                                <span key={s.label} style={{
                                  backgroundColor: 'white',
                                  color: '#002147',
                                  border: '1px solid #dddddd',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  {s.label}: {s.mark}/{s.max}
                                </span>
                              ))}
                            </div>

                            {/* Recommendation */}
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                              <strong>Recommendation:</strong> {
                                evaluation.recommendation === 'a' ? 'Accept as is' :
                                evaluation.recommendation === 'b' ? 'Minor corrections' :
                                evaluation.recommendation === 'c' ? 'Resubmit' :
                                evaluation.recommendation === 'd' ? 'Reject' : 'N/A'
                              }
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Result summary */}
                      {result && (
                        <div style={{
                          padding: '12px 15px',
                          backgroundColor: statusColor(result.status).bg,
                          border: `1px solid ${statusColor(result.status).border}`,
                          borderRadius: '6px',
                          marginBottom: '15px',
                          fontSize: '14px',
                          color: statusColor(result.status).color
                        }}>
                          <strong>{result.status}</strong> — {result.message}
                        </div>
                      )}

                      {/* Release button */}
                      {result?.status === 'Ready to Release' && !isReleased && (
                        <button
                          onClick={() => handleRelease(student.id, student.name)}
                          disabled={releasing === student.id}
                          style={{
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}>
                          {releasing === student.id ? 'Releasing...' : '🚀 Release Results to Student'}
                        </button>
                      )}

                     {/* Discrepancy warning + reassign */}
{result?.discrepancy && (
  <div style={{
    backgroundColor: '#fce4e4',
    border: '1px solid #ef5350',
    padding: '15px',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#c62828'
  }}>
    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
      ⚠️ Mark Discrepancy Detected — {result.difference} point difference
    </p>
    <p style={{ marginBottom: '12px' }}>
      Internal: {studentEvals[0]?.total_mark}/100 |
      External: {studentEvals[1]?.total_mark}/100
    </p>
    <p style={{ marginBottom: '12px', fontSize: '12px' }}>
      This exceeds the 10 point threshold. You must reassign 
      an examiner for remarking before results can be released.
    </p>
    <button
      onClick={() => handleReassign(student.id, student.name)}
      style={{
        backgroundColor: '#c62828',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
      🔄 Reassign Examiner
    </button>
  </div>
)}

                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default ManageResults