// src/pages/student/Results.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { calculateFinalMark } from '../../utils/calculateMarks'
import LoadingSpinner from '../../components/LoadingSpinner'

function Results() {

  const { user } = useAuth()
  const navigate = useNavigate()

  const [proposal, setProposal] = useState(null)
  const [thesis, setThesis] = useState(null)
  const [reports, setReports] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {

        const proposalRes = await fetch(
          `http://localhost:5000/api/proposals/student/${user.id}`
        )
        const proposalData = await proposalRes.json()
        setProposal(proposalData.length > 0 ? proposalData[0] : null)

        const thesisRes = await fetch(
          `http://localhost:5000/api/theses/student/${user.id}`
        )
        const thesisData = await thesisRes.json()
        setThesis(thesisData.length > 0 ? thesisData[0] : null)

        const reportsRes = await fetch(
          `http://localhost:5000/api/progress/student/${user.id}`
        )
        const reportsData = await reportsRes.json()
        setReports(reportsData)

        // Only released evaluations come back
        const evalRes = await fetch(
          `http://localhost:5000/api/evaluations/student/${user.id}`
        )
        const evalData = await evalRes.json()
        setEvaluations(evalData)

      } catch (err) {
        console.error('Error fetching results:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [user.id])

  // Calculate final mark
  const getFinalMark = () => {
    if (evaluations.length === 0) return null

    if (user.degree === 'Masters') {
      return calculateFinalMark('Masters', evaluations[0].total_mark)
    }

    if (user.degree === 'PhD') {
      if (evaluations.length === 1) {
        return calculateFinalMark('PhD', evaluations[0].total_mark, null)
      }
      return calculateFinalMark(
        'PhD',
        evaluations[0].total_mark,
        evaluations[1].total_mark
      )
    }
  }

  const finalMark = getFinalMark()

  // Status badge helper
  const statusBadge = (status, fallback = 'Not Submitted') => {
    const text = status || fallback
    const isGood = ['Approved', 'Reviewed', 'Submitted — Awaiting Examiner Assignment'].includes(text)
    const isBad = text === 'Rejected'

    return (
      <span style={{
        backgroundColor: isGood ? '#e6f4ea' : isBad ? '#fce4e4' : '#fff3e0',
        color: isGood ? '#2e7d32' : isBad ? '#c62828' : '#e65100',
        border: `1px solid ${isGood ? '#4caf50' : isBad ? '#ef5350' : '#ff9800'}`,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {text}
      </span>
    )
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
          <h1 style={{ margin: 0, fontSize: '20px' }}>My Results & Status</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
              {user.programme_name || 'Namibia University of Science and Technology'} - {user.degree} Student
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/student')}
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

        {loading && <LoadingSpinner message="Loading your results..." />}

        {!loading && (
          <div>

            {/* Proposal Status */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ color: '#002147', marginBottom: '5px', fontSize: '16px' }}>
                    📄 Research Proposal
                  </h3>
                  {proposal ? (
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      {proposal.title} — Submitted: {new Date(proposal.submitted_at).toLocaleDateString()}
                    </p>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#666' }}>Not submitted yet</p>
                  )}
                  {proposal?.hdc_comments && (
                    <p style={{ fontSize: '13px', color: '#333', marginTop: '8px' }}>
                      <strong>HDC Comments:</strong> {proposal.hdc_comments}
                    </p>
                  )}
                </div>
                {statusBadge(proposal?.status)}
              </div>
            </div>

            {/* Progress Reports */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{ color: '#002147', marginBottom: '15px', fontSize: '16px' }}>
                📋 Progress Reports
              </h3>

              {reports.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#666' }}>
                  No progress reports submitted yet.
                </p>
              ) : (
                reports.map(report => (
                  <div key={report.id} style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    padding: '12px 15px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '3px' }}>
                        {report.semester}
                      </p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        Submitted: {new Date(report.submitted_at).toLocaleDateString()}
                      </p>
                      {report.supervisor_comments && (
                        <p style={{ fontSize: '12px', color: '#333', marginTop: '5px' }}>
                          <strong>Supervisor:</strong> {report.supervisor_comments}
                        </p>
                      )}
                    </div>
                    {statusBadge(
                      report.supervisor_comments ? 'Reviewed' : 'Pending Review'
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Thesis Status */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ color: '#002147', marginBottom: '5px', fontSize: '16px' }}>
                    🎓 Thesis Submission
                  </h3>
                  {thesis ? (
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      {thesis.title} — Submitted: {new Date(thesis.submitted_at).toLocaleDateString()}
                    </p>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#666' }}>Not submitted yet</p>
                  )}
                </div>
                {statusBadge(thesis?.status)}
              </div>
            </div>

            {/* Examination Results */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px 25px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{ color: '#002147', marginBottom: '15px', fontSize: '16px' }}>
                📝 Examination Results
              </h3>

              {/* Results not released yet */}
              {evaluations.length === 0 && (
                <div style={{
                  backgroundColor: '#fff3e0',
                  border: '1px solid #ff9800',
                  padding: '15px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#e65100'
                }}>
                  ⏳ Your examination results have not been released yet. 
                  You will be notified when the HOD releases your results.
                </div>
              )}

              {/* Results released */}
              {evaluations.length > 0 && (
                <div>
                  {evaluations.map((evaluation, index) => (
                    <div key={evaluation.id} style={{
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px',
                      padding: '15px',
                      marginBottom: '15px'
                    }}>
                      {/* Examiner number - no name */}
                      <p style={{
                        fontWeight: 'bold',
                        color: '#002147',
                        marginBottom: '10px',
                        fontSize: '14px'
                      }}>
                        Examiner {index + 1} Evaluation
                      </p>

                      {/* Overall Assessment */}
                      {evaluation.overall_assessment && (
                        <div style={{
                          backgroundColor: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '4px',
                          marginBottom: '12px',
                          fontSize: '13px',
                          color: '#333'                           
                        }}>
                          <strong>Overall Assessment:</strong>
                          <p style={{ marginTop: '5px' }}>{evaluation.overall_assessment}</p>
                        </div>
                      )}

                      {/* Recommendation */}
                      <p style={{ fontSize: '13px', color: '#333', marginBottom: '10px' }}>
                        <strong>Recommendation:</strong> {
                          evaluation.recommendation === 'a' ? '✅ Thesis accepted in present form' :
                          evaluation.recommendation === 'b' ? '📝 Minor corrections required' :
                          evaluation.recommendation === 'c' ? '🔄 Resubmit for re-examination' :
                          evaluation.recommendation === 'd' ? '❌ Degree not awarded' : 'N/A'
                        }
                      </p>

                      {/* Total mark */}
                      <div style={{
                        backgroundColor: '#002147',
                        color: 'white',
                        padding: '10px 15px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>Total Mark</span>
                        <span style={{ fontWeight: 'bold' }}>
                          {evaluation.total_mark}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final Mark */}
            {finalMark && evaluations.length > 0 && (
              <div style={{
                backgroundColor: finalMark.discrepancy ? '#fff3e0' : '#002147',
                color: finalMark.discrepancy ? '#e65100' : 'white',
                padding: '25px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h2 style={{ margin: 0, marginBottom: '10px', fontSize: '18px' }}>
                  🎯 Final Result
                </h2>

                {finalMark.discrepancy ? (
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    ⚠️ Your marks are under review. Please wait for the HOD.
                  </p>
                ) : finalMark.finalMark ? (
                  <div>
                    <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '10px 0' }}>
                      {finalMark.finalMark}/100
                    </p>
                    <p style={{ fontSize: '18px', margin: 0 }}>
                      {finalMark.finalMark >= 50 ? '✅ Pass' : '❌ Fail'}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    ⏳ Awaiting all examiner results
                  </p>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

export default Results