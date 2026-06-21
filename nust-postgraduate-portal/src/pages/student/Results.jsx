// src/pages/student/Results.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'

function Results() {

  const { user } = useAuth()
  const navigate = useNavigate()

  const [proposal, setProposal] = useState(null)
  const [thesis, setThesis] = useState(null)
  const [reports, setReports] = useState([])
const [evaluations, setEvaluations] = useState([])
  const [released, setReleased] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const proposalRes = await fetch(
          'http://localhost:5000/api/proposals/student/' + user.id
        )
        const proposalData = await proposalRes.json()
        setProposal(proposalData.length > 0 ? proposalData[0] : null)

        const thesisRes = await fetch(
          'http://localhost:5000/api/theses/student/' + user.id
        )
        const thesisData = await thesisRes.json()
        setThesis(thesisData.length > 0 ? thesisData[0] : null)

        const reportsRes = await fetch(
          'http://localhost:5000/api/progress/student/' + user.id
        )
        const reportsData = await reportsRes.json()
        setReports(reportsData)

// Only released, non-voided evaluations come back
        const evalRes = await fetch(
          'http://localhost:5000/api/evaluations/student/' + user.id
        )
        const evalData = await evalRes.json()
        setEvaluations(Array.isArray(evalData) ? evalData : [])

        // Whether the result has actually been released — same signal the dashboard uses
        const relRes = await fetch(
          'http://localhost:5000/api/evaluations/student-released/' + user.id
        )
        const relData = await relRes.json()
        setReleased(Array.isArray(relData) && relData.length > 0)
      } catch (err) {
        console.error('Error fetching results:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [user.id])

 // Final mark = average of all released marks (same rule as the HOD's Manage Results)
  // Masters needs 2 marks (supervisor + 1 external), PhD needs 3 (supervisor + 2 external)
const getFinalMark = () => {
    if (evaluations.length === 0) return null

    // Average the largest group of marks within 20 of each other — exactly the
    // coordinator's calculation. Any outlier is excluded.
    const marks = evaluations.map(function (e) { return e.total_mark })
    const sorted = marks.slice().sort(function (a, b) { return a - b })
    let bestStart = 0
    let bestLen = 1
    for (let i = 0; i < sorted.length; i++) {
      let j = i
      while (j < sorted.length && sorted[j] - sorted[i] <= 20) { j++ }
      if (j - i > bestLen) { bestLen = j - i; bestStart = i }
    }
    const agreeing = sorted.slice(bestStart, bestStart + bestLen)
    const sum = agreeing.reduce(function (a, b) { return a + b }, 0)
    return { finalMark: Math.round(sum / agreeing.length), discrepancy: false }
  }

const finalMark = getFinalMark()
  const resultsReleased = released

  // Status badge helper
  const statusBadge = (status, fallback) => {
    const text = status || fallback || 'Not Submitted'
    const isGood = ['Approved', 'Reviewed', 'Result Released', 'Submitted — Awaiting Examiner Assignment'].includes(text)
    const isBad = text === 'Rejected'

    return (
      <span style={{
        backgroundColor: isGood ? '#e6f4ea' : isBad ? '#fce4e4' : '#fff3e0',
        color: isGood ? '#2e7d32' : isBad ? '#c62828' : '#e65100',
        border: '1px solid ' + (isGood ? '#4caf50' : isBad ? '#ef5350' : '#ff9800'),
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

      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

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
                  {proposal && proposal.hdc_comments && (
                    <p style={{ fontSize: '13px', color: '#333', marginTop: '8px' }}>
                      <strong>HDC Comments:</strong> {proposal.hdc_comments}
                    </p>
                  )}
                </div>
                {statusBadge(proposal ? proposal.status : null)}
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
                    {statusBadge(report.supervisor_comments ? 'Reviewed' : 'Pending Review')}
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
                {statusBadge(resultsReleased ? 'Result Released' : (thesis ? thesis.status : null))}
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

              {/* Not released yet */}
              {!resultsReleased && (
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

              {/* Released - confirmation only; the mark is shown below (no individual examiner marks) */}
              {resultsReleased && (
                <div style={{
                  backgroundColor: '#e6f4ea',
                  border: '1px solid #4caf50',
                  padding: '15px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#2e7d32'
                }}>
                  ✅ Your examination is complete and your result has been released. Your final mark is shown below.
                </div>
              )}
            </div>

            {/* Final Result */}
            {resultsReleased && finalMark && (
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
                ) : finalMark.finalMark !== null ? (
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
                    ⏳ Awaiting all examiner results.
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