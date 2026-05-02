// src/pages/student/Results.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { calculateFinalMark } from '../../utils/calculateMarks'

function Results() {

  const { user } = useAuth()
  const navigate = useNavigate()

  // Data from database
  const [proposal, setProposal] = useState(null)
  const [thesis, setThesis] = useState(null)
  const [reports, setReports] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all student data when page loads
  useEffect(() => {
    const fetchAll = async () => {
      try {

        // Fetch proposal
        const proposalRes = await fetch(
          `http://localhost:5000/api/proposals/student/${user.id}`
        )
        const proposalData = await proposalRes.json()
        setProposal(proposalData.length > 0 ? proposalData[0] : null)

        // Fetch thesis
        const thesisRes = await fetch(
          `http://localhost:5000/api/theses/student/${user.id}`
        )
        const thesisData = await thesisRes.json()
        setThesis(thesisData.length > 0 ? thesisData[0] : null)

        // Fetch progress reports
        const reportsRes = await fetch(
          `http://localhost:5000/api/progress/student/${user.id}`
        )
        const reportsData = await reportsRes.json()
        setReports(reportsData)

        // Fetch evaluations
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

  // Calculate final mark based on degree type
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
            My Results & Status
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            {user.degree} Student — Faculty of Computing and Informatics
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

        {/* Loading */}
        {loading && (
          <p style={{ color: '#666', textAlign: 'center' }}>
            Loading your results...
          </p>
        )}

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
                  {proposal && (
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      {proposal.title} — Submitted: {new Date(proposal.submitted_at).toLocaleDateString()}
                    </p>
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
                  {thesis && (
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      {thesis.title} — Submitted: {new Date(thesis.submitted_at).toLocaleDateString()}
                    </p>
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

              {evaluations.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#666' }}>
                  No examination results yet.
                </p>
              ) : (
                <div>
                  {evaluations.map((evaluation, index) => (
                    <div key={evaluation.id} style={{
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px',
                      padding: '12px 15px',
                      marginBottom: '10px'
                    }}>
                      <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '5px' }}>
                        {index === 0 ? 'Internal Examiner' : 'External Examiner'}
                      </p>
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Section A', mark: evaluation.section_a, max: 20 },
                          { label: 'Section B', mark: evaluation.section_b, max: 30 },
                          { label: 'Section C', mark: evaluation.section_c, max: 20 },
                          { label: 'Section D', mark: evaluation.section_d, max: 20 },
                          { label: 'Section E', mark: evaluation.section_e, max: 10 }
                        ].map(s => (
                          <span key={s.label} style={{
                            backgroundColor: '#f0f7ff',
                            color: '#002147',
                            padding: '3px 10px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {s.label}: {s.mark}/{s.max}
                          </span>
                        ))}
                      </div>
                      <p style={{
                        marginTop: '8px',
                        fontWeight: 'bold',
                        color: '#002147',
                        fontSize: '14px'
                      }}>
                        Total: {evaluation.total_mark}/100
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final Mark */}
            {finalMark && (
              <div style={{
                backgroundColor: finalMark.discrepancy ? '#fff3e0' : '#002147',
                color: 'white',
                padding: '25px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h2 style={{ margin: 0, marginBottom: '10px', fontSize: '18px' }}>
                  🎯 Final Result
                </h2>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {finalMark.message}
                </p>
                {finalMark.finalMark && (
                  <p style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    margin: '10px 0 0 0'
                  }}>
                    {finalMark.finalMark}/100
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