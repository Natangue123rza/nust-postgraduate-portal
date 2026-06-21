// src/pages/coordinator/AssignProposalEvaluators.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function AssignProposalEvaluators() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [proposals, setProposals] = useState([])
  const [staff, setStaff] = useState([])
  const [reviews, setReviews] = useState([])
  const [selected, setSelected] = useState({})
  const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(null)
  const [submitting, setSubmitting] = useState(null)
  const [returning, setReturning] = useState(null)

  const fetchData = async () => {
    try {
      const [pRes, eRes, rRes] = await Promise.all([
        fetch('http://localhost:5000/api/proposals/all?departmentId=' + user.department_id),
       fetch('http://localhost:5000/api/auth/supervisors?departmentId=' + user.department_id),
        fetch('http://localhost:5000/api/proposals/reviews-all?departmentId=' + user.department_id)
      ])
      setProposals(await pRes.json())
    setStaff(await eRes.json())
      setReviews(await rRes.json())
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchData() }, [user.department_id])

  const reviewsFor = (proposalId) => reviews.filter(r => r.proposal_id === proposalId)

  const handleAssign = async (proposalId) => {
    const evaluatorId = selected[proposalId]
    if (!evaluatorId) { alert('Please choose an evaluator.'); return }
    setSaving(proposalId)
    try {
      const res = await fetch('http://localhost:5000/api/proposals/assign-evaluator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, evaluatorId })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      setSelected({ ...selected, [proposalId]: '' })
      fetchData()
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSaving(null)
    }
  }

const handleSubmitToFaculty = async (proposalId) => {
    setSubmitting(proposalId)
    try {
      const res = await fetch('http://localhost:5000/api/proposals/submit-to-faculty/' + proposalId, {
        method: 'PUT'
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      fetchData()
} catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSubmitting(null)
    }
  }

  const handleReturnForRevision = async (proposalId) => {
    if (!window.confirm('Return this proposal to the student for revision? They will revise with their supervisor and resubmit.')) return
    setReturning(proposalId)
    try {
      const res = await fetch('http://localhost:5000/api/proposals/return-for-revision/' + proposalId, {
        method: 'PUT'
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      fetchData()
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setReturning(null)
    }
  }

  const statusLabel = (s) => s === 'Approved' ? '✅ Approved' : s === 'Feedback' ? '📝 Feedback given' : '⏳ Pending'

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ backgroundColor: '#002147', color: 'white', padding: '25px 30px', borderRadius: '8px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Assign Proposal Evaluators</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Evaluators give feedback (no marks) and approve when satisfied — two approvals are needed.
          </p>
        </div>

        <button onClick={() => navigate('/coordinator')} style={{
          backgroundColor: 'transparent', border: '1px solid #002147', color: '#002147',
          padding: '8px 16px', borderRadius: '4px', marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
        }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading proposals..." />}

        {!loading && proposals.length === 0 && (
          <div style={{ backgroundColor: '#fff3e0', border: '1px solid #ff9800', padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#e65100' }}>
            No proposals are ready for evaluator assignment yet.
          </div>
        )}

        {!loading && proposals.map(p => {
          const prReviews = reviewsFor(p.id)
          const approvals = prReviews.filter(r => r.status === 'Approved').length
          return (
            <div key={p.id} style={{
              backgroundColor: 'white', border: '1px solid #dddddd',
              borderLeft: '4px solid ' + (p.degree === 'PhD' ? '#8B0000' : '#002147'),
              borderRadius: '8px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h3 style={{ color: '#002147', margin: 0, fontSize: '16px' }}>
                  {p.student_name} <span style={{ fontSize: '11px', color: '#666' }}>({p.degree})</span>
                </h3>
                <span style={{
                  backgroundColor: approvals >= 2 ? '#e6f4ea' : '#fff3e0',
                  color: approvals >= 2 ? '#2e7d32' : '#e65100',
                  border: '1px solid ' + (approvals >= 2 ? '#4caf50' : '#ff9800'),
                  padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                }}>
                  {approvals} of 2 approvals
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#333', margin: '0 0 12px 0' }}>{p.title}</p>

              {prReviews.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
              {prReviews.map(r => (
                    <div key={r.id} style={{
                      backgroundColor: '#f9f9f9', border: '1px solid #eeeeee', borderRadius: '4px',
                      padding: '8px 12px', marginBottom: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#002147' }}>{r.evaluator_name}</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>{statusLabel(r.status)}</span>
                      </div>
                      {r.feedback && (
                        <p style={{ fontSize: '12px', color: '#444', margin: '6px 0 0 0', fontStyle: 'italic', lineHeight: '1.4' }}>
                          "{r.feedback}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={selected[p.id] || ''}
                  onChange={(e) => setSelected({ ...selected, [p.id]: e.target.value })}
                  style={{ flex: 1, minWidth: '200px', padding: '10px', border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px', backgroundColor: 'white' }}>
                  <option value="">-- Choose an evaluator --</option>
                {staff.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(p.id)}
                  disabled={saving === p.id}
                  style={{
                    backgroundColor: saving === p.id ? '#cccccc' : '#002147', color: 'white', border: 'none',
                    padding: '10px 18px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold',
                    cursor: saving === p.id ? 'not-allowed' : 'pointer'
                  }}>
        {saving === p.id ? 'Assigning...' : 'Assign Evaluator'}
                </button>
              </div>

              {p.hdc_decision === 'approved' ? (
                <div style={{
                  marginTop: '14px', backgroundColor: '#e6f4ea', border: '1px solid #4caf50',
                  color: '#2e7d32', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                }}>
                  ✅ Submitted to Faculty Representative
                </div>
 ) : (
                <div style={{ marginTop: '14px' }}>
                  <button
                    onClick={() => handleSubmitToFaculty(p.id)}
                    disabled={approvals < 2 || submitting === p.id}
                    style={{
                      width: '100%',
                      backgroundColor: (approvals < 2 || submitting === p.id) ? '#cccccc' : '#8B0000',
                      color: 'white', border: 'none', padding: '11px', borderRadius: '4px',
                      fontSize: '13px', fontWeight: 'bold',
                      cursor: (approvals < 2 || submitting === p.id) ? 'not-allowed' : 'pointer'
                    }}>
                    {submitting === p.id
                      ? 'Submitting...'
                      : (approvals < 2 ? 'Needs 2 approvals to submit' : 'Submit to Faculty Representative')}
                  </button>
                  {prReviews.some(r => r.status === 'Feedback') && approvals < 2 && (
                    <button
                      onClick={() => handleReturnForRevision(p.id)}
                      disabled={returning === p.id}
                      style={{
                        width: '100%', marginTop: '8px',
                        backgroundColor: 'transparent', color: '#8B0000',
                        border: '1px solid #8B0000', padding: '10px', borderRadius: '4px',
                        fontSize: '13px', fontWeight: 'bold',
                        cursor: returning === p.id ? 'not-allowed' : 'pointer'
                      }}>
                      {returning === p.id ? 'Returning...' : 'Return to student for revision'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default AssignProposalEvaluators