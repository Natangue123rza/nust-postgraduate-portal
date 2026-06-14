// src/pages/hod/ManageResults.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

function ManageResults() {

  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
   const fetchData = async () => {
  try {
    const studentsRes = await fetch(
      `http://localhost:5000/api/auth/students?departmentId=${user.department_id}`
    )
    setStudents(await studentsRes.json())

    const evalsRes = await fetch(
      `http://localhost:5000/api/evaluations/all?departmentId=${user.department_id}`
    )
    setEvaluations(await evalsRes.json())
  } catch (err) {
    console.error('Error:', err)
  } finally {
    setLoading(false)
  }
}
    fetchData()
  }, [])

  // Active evaluations only (not voided)
  const getActiveEvals = (studentId) =>
    evaluations.filter(e => e.student_id === studentId && !e.is_voided)

  // Voided evaluations (for history/accountability)
  const getVoidedEvals = (studentId) =>
    evaluations.filter(e => e.student_id === studentId && e.is_voided)

const calculateResult = (studentDegree, activeEvals) => {
    if (activeEvals.length === 0) return null

    // All the marks that currently count (voided ones are already excluded)
    const marks = activeEvals.map(function (e) { return e.total_mark })

   // Masters: 1 internal (supervisor) + 1 external = 2 marks expected
    if (studentDegree === 'Masters') {
      if (marks.length < 2) {
        return {
          finalMark: null,
          discrepancy: false,
          status: 'Awaiting Examiners',
          message: 'Waiting for all examiner marks (' + marks.length + ' of 2 submitted)'
        } 
      }

      const highest = Math.max.apply(null, marks)
      const lowest = Math.min.apply(null, marks)
      const spread = highest - lowest

      if (spread > 20) {
        return {
          finalMark: null,
          discrepancy: true,
          difference: spread,
          status: 'Discrepancy — Requires Review',
          message: '⚠️ ' + spread + ' point spread between examiners (' + marks.join(', ') + ')'
        }
      }

      const sum = marks.reduce(function (a, b) { return a + b }, 0)
      const average = Math.round(sum / marks.length)
      return {
        finalMark: average,
        discrepancy: false,
        status: 'Ready to Release',
        message: 'Final mark: ' + average + '/100 (average of ' + marks.join(', ') + ')'
      }
    }

    // PhD: 1 internal (supervisor) + 2 external = 3 marks expected
    if (studentDegree === 'PhD') {
      if (marks.length < 3) {
        return {
          finalMark: null,
          discrepancy: false,
          status: 'Awaiting Examiners',
          message: 'Waiting for all examiner marks (' + marks.length + ' of 3 submitted)'
        }
      }

      const highest = Math.max.apply(null, marks)
      const lowest = Math.min.apply(null, marks)
      const spread = highest - lowest

      // Discrepancy = the gap between the highest and lowest mark is too wide
      if (spread > 10) {
        return {
          finalMark: null,
          discrepancy: true,
          difference: spread,
          status: 'Discrepancy — Requires Review',
          message: '⚠️ ' + spread + ' point spread between examiners (' + marks.join(', ') + ')'
        }
      }

      const sum = marks.reduce(function (a, b) { return a + b }, 0)
      const average = Math.round(sum / marks.length)
      return {
        finalMark: average,
        discrepancy: false,
        status: 'Ready to Release',
        message: 'Final mark: ' + average + '/100 (average of ' + marks.join(', ') + ')'
      }
    }
  }

  const handleRelease = async (studentId, studentName) => {
    if (!window.confirm(`Release results to ${studentName}? This cannot be undone.`)) return
    setReleasing(studentId)
    try {
      const response = await fetch(
        `http://localhost:5000/api/evaluations/release/${studentId}`,
        { method: 'PUT' }
      )
      const data = await response.json()
      if (!response.ok) { alert(data.message); return }
      alert(`✅ Results released to ${studentName}!`)
      const evalsRes = await fetch('http://localhost:5000/api/evaluations/all')
      setEvaluations(await evalsRes.json())
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setReleasing(null)
    }
  }

  const handleReassign = async (studentId, studentName) => {
    if (!window.confirm(
      `Reassign examiner for ${studentName}?\n\nThis will:\n• Void existing evaluations (kept for accountability)\n• Allow new examiner to be assigned\n• Notify the student`
    )) return

    try {
      const response = await fetch(
        `http://localhost:5000/api/evaluations/delete/${studentId}`,
        { method: 'DELETE' }
      )
      const data = await response.json()
      if (!response.ok) { alert(data.message); return }

      await fetch('http://localhost:5000/api/notifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: studentId,
          title: '🔄 Thesis Being Remarked',
          message: 'There was a discrepancy between examiner marks. Your thesis has been sent for remarking.'
        })
      })

      alert(`✅ Evaluations voided for ${studentName}. Please assign a new examiner.`)
      const evalsRes = await fetch('http://localhost:5000/api/evaluations/all')
      setEvaluations(await evalsRes.json())
    } catch (err) {
      alert('Could not connect to server.')
    }
  }

  const statusColor = (status) => {
    if (status === 'Ready to Release') return { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' }
    if (status === 'Discrepancy — Requires Review') return { bg: '#fce4e4', color: '#c62828', border: '#ef5350' }
   if (status === 'Awaiting Examiners') return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' }
    return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' }
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Manage Examination Results</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Review examiner marks and release results to students
          </p>
        </div>

        <button onClick={() => navigate('/hod')} style={{
          backgroundColor: 'transparent', border: '1px solid #002147',
          color: '#002147', padding: '8px 16px', borderRadius: '4px',
          marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
        }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading results..." />}

        {!loading && students.map(student => {
          const activeEvals = getActiveEvals(student.id)
          const voidedEvals = getVoidedEvals(student.id)
          const result = calculateResult(student.degree, activeEvals)
          const isReleased = activeEvals.length > 0 && activeEvals.every(e => e.is_released)

          return (
            <div key={student.id} style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderLeft: '4px solid ' + (student.degree === 'PhD' ? '#8B0000' : '#002147'),
              borderRadius: '8px', padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>

              {/* Student info */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{ color: '#002147', marginBottom: '5px' }}>{student.name}</h3>
                  <span style={{
                    backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                    color: 'white', padding: '2px 10px',
                    borderRadius: '12px', fontSize: '11px'
                  }}>
                    {student.degree}
                  </span>
                </div>
                {isReleased && (
                  <span style={{
                    backgroundColor: '#e6f4ea', color: '#2e7d32',
                    border: '1px solid #4caf50', padding: '4px 12px',
                    borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    ✅ Results Released
                  </span>
                )}
              </div>

              {/* No evaluations */}
              {activeEvals.length === 0 && voidedEvals.length === 0 && (
                <p style={{ color: '#666', fontSize: '13px' }}>
                  ⏳ No examiner evaluations submitted yet.
                </p>
              )}

              {/* Active evaluations */}
              {activeEvals.length > 0 && (
                <div>
                  <p style={{
                    fontSize: '12px', fontWeight: 'bold',
                    color: '#002147', marginBottom: '8px'
                  }}>
                    Current Evaluations:
                  </p>
                  {activeEvals.map((evaluation, index) => (
                    <div key={evaluation.id} style={{
                      backgroundColor: '#f5f5f5', padding: '12px 15px',
                      borderRadius: '6px', marginBottom: '8px'
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '8px'
                      }}>
                        <span style={{ fontWeight: 'bold', color: '#002147', fontSize: '14px' }}>
                         {evaluation.examiner_type === 'internal' ? 'Internal Examiner' : 'External Examiner'}: {evaluation.examiner_name}
                        </span>
                        <span style={{
                          backgroundColor: '#002147', color: 'white',
                          padding: '3px 12px', borderRadius: '12px',
                          fontSize: '13px', fontWeight: 'bold'
                        }}>
                          {evaluation.total_mark}/100
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'A', mark: evaluation.section_a, max: 20 },
                          { label: 'B', mark: evaluation.section_b, max: 30 },
                          { label: 'C', mark: evaluation.section_c, max: 20 },
                          { label: 'D', mark: evaluation.section_d, max: 20 },
                          { label: 'E', mark: evaluation.section_e, max: 10 }
                        ].map(s => (
                          <span key={s.label} style={{
                            backgroundColor: 'white', color: '#002147',
                            border: '1px solid #dddddd', padding: '2px 8px',
                            borderRadius: '4px', fontSize: '12px'
                          }}>
                            {s.label}: {s.mark}/{s.max}
                          </span>
                        ))}
                      </div>
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

                  {/* Result summary */}
                  {result && (
                    <div style={{
                      padding: '12px 15px',
                      backgroundColor: statusColor(result.status).bg,
                      border: '1px solid ' + statusColor(result.status).border,
                      borderRadius: '6px', marginBottom: '15px',
                      fontSize: '14px', color: statusColor(result.status).color
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
                        backgroundColor: '#2e7d32', color: 'white',
                        border: 'none', padding: '10px 20px',
                        borderRadius: '4px', fontSize: '14px',
                        fontWeight: 'bold', cursor: 'pointer',
                        marginBottom: '10px'
                      }}>
                      {releasing === student.id ? 'Releasing...' : '✅ Approve & Release to Student'}
                    </button>
                  )}

                  {/* Discrepancy warning */}
                  {result?.discrepancy && (
                    <div style={{
                      backgroundColor: '#fce4e4', border: '1px solid #ef5350',
                      padding: '15px', borderRadius: '6px',
                      fontSize: '13px', color: '#c62828'
                    }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                        ⚠️ Mark Discrepancy — {result.difference} point difference
                      </p>
                      <p style={{ marginBottom: '12px', fontSize: '12px' }}>
                       Exceeds the 20-point threshold. Review the examiners' comments,
                        then assign another evaluator or refer to the faculty committee.
                      </p>
                      <button
                        onClick={() => handleReassign(student.id, student.name)}
                        style={{
                          backgroundColor: '#c62828', color: 'white',
                          border: 'none', padding: '8px 16px',
                          borderRadius: '4px', fontSize: '13px',
                          fontWeight: 'bold', cursor: 'pointer'
                        }}>
                        🔄 Void & Reassign Examiner
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Voided evaluations - accountability history */}
              {voidedEvals.length > 0 && (
                <div style={{
                  marginTop: '15px',
                  borderTop: '2px dashed #dddddd',
                  paddingTop: '15px'
                }}>
                  <p style={{
                    fontSize: '12px', fontWeight: 'bold',
                    color: '#c62828', marginBottom: '8px'
                  }}>
                    📋 Voided Evaluations — Kept for Accountability:
                  </p>
                  {voidedEvals.map((evaluation, index) => (
                    <div key={evaluation.id} style={{
                      backgroundColor: '#fce4e4', padding: '12px 15px',
                      borderRadius: '6px', marginBottom: '8px',
                      opacity: 0.8
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '5px'
                      }}>
                        <span style={{ fontWeight: 'bold', color: '#c62828', fontSize: '13px' }}>
                          {evaluation.examiner_name}
                          <span style={{
                            backgroundColor: '#c62828', color: 'white',
                            padding: '1px 6px', borderRadius: '4px',
                            fontSize: '10px', marginLeft: '8px'
                          }}>
                            VOIDED
                          </span>
                        </span>
                        <span style={{
                          backgroundColor: '#c62828', color: 'white',
                          padding: '3px 12px', borderRadius: '12px', fontSize: '12px'
                        }}>
                          {evaluation.total_mark}/100
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#c62828' }}>
                        Reason: {evaluation.voided_reason}
                      </p>
                      <p style={{ fontSize: '11px', color: '#999' }}>
                        Voided: {new Date(evaluation.voided_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )
        })}

      </div>
    </div>
  )
}

export default ManageResults