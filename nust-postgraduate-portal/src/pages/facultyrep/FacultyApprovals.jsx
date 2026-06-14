// src/pages/facultyrep/FacultyApprovals.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function FacultyApprovals() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState({})
  const [saving, setSaving] = useState(null)

  const fetchProposals = async () => {
    try {
      const res = await fetch(
        'http://localhost:5000/api/proposals/faculty?facultyId=' + user.faculty_id
      )
      setProposals(await res.json())
    } catch (err) {
      console.error('Error fetching proposals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [user.faculty_id])

  const handleDecision = async (proposalId, decision) => {
    const comment = comments[proposalId] || ''
    if (!comment) {
      alert('Please add a short comment before recording your decision.')
      return
    }
    setSaving(proposalId)
    try {
      const res = await fetch(
        'http://localhost:5000/api/proposals/faculty-approve/' + proposalId,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approverId: user.id, decision, comments: comment })
        }
      )
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      fetchProposals()
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSaving(null)
    }
  }

  const trailStep = (label, done, detail) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
      <span style={{
        width: '18px', height: '18px', borderRadius: '50%',
        backgroundColor: done ? '#2e7d32' : '#cccccc', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0
      }}>
        {done ? '✓' : ''}
      </span>
      <span style={{ fontSize: '13px', color: '#333' }}>
        <strong>{label}</strong>{detail ? ' — ' + detail : ''}
      </span>
    </div>
  )

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Faculty Approvals</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Record the faculty-level approval for proposals endorsed by coordinators
          </p>
        </div>

        <button onClick={() => navigate('/faculty-rep')} style={{
          backgroundColor: 'transparent', border: '1px solid #002147',
          color: '#002147', padding: '8px 16px', borderRadius: '4px',
          marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
        }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading proposals..." />}

        {!loading && proposals.length === 0 && (
          <div style={{
            backgroundColor: '#fff3e0', border: '1px solid #ff9800',
            padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#e65100'
          }}>
            No proposals are awaiting faculty-level approval yet.
          </div>
        )}

        {!loading && proposals.map(p => {
          const decided = p.faculty_status === 'Approved' || p.faculty_status === 'Rejected'
          return (
            <div key={p.id} style={{
              backgroundColor: 'white', border: '1px solid #dddddd',
              borderLeft: '4px solid ' + (p.degree === 'PhD' ? '#8B0000' : '#002147'),
              borderRadius: '8px', padding: '20px', marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h3 style={{ color: '#002147', margin: 0, fontSize: '16px' }}>{p.student_name}</h3>
                <span style={{
                  backgroundColor: p.degree === 'PhD' ? '#8B0000' : '#002147', color: 'white',
                  padding: '2px 10px', borderRadius: '12px', fontSize: '11px'
                }}>
                  {p.degree}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#333', margin: '0 0 15px 0' }}>{p.title}</p>

              <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #eeeeee', borderRadius: '6px', padding: '14px 16px', marginBottom: '15px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#002147', margin: '0 0 10px 0' }}>
                  Approval Trail
                </p>
                {trailStep('Supervisor', true, (p.supervisor_name || 'Supervisor') + ' approved')}
                {trailStep('Coordinator', true, 'Approved and forwarded to faculty')}
                {trailStep(
                  'Faculty (HDC)',
                  decided,
                  decided
                    ? (p.faculty_status + ' by ' + (p.faculty_approver_name || 'Faculty Rep') +
                       (p.faculty_approved_at ? ' on ' + new Date(p.faculty_approved_at).toLocaleDateString() : ''))
                    : 'Awaiting your decision'
                )}
              </div>

              {p.file_name && (
                <a href={'http://localhost:5000/api/uploads/' + p.file_name}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-block', backgroundColor: '#002147', color: 'white',
                    padding: '6px 14px', borderRadius: '4px', fontSize: '12px',
                    textDecoration: 'none', marginBottom: '15px'
                  }}>
                  📄 View Proposal PDF
                </a>
              )}

              {decided ? (
                <div style={{
                  backgroundColor: p.faculty_status === 'Approved' ? '#e6f4ea' : '#fce4e4',
                  border: '1px solid ' + (p.faculty_status === 'Approved' ? '#4caf50' : '#ef5350'),
                  padding: '12px 15px', borderRadius: '6px', fontSize: '13px',
                  color: p.faculty_status === 'Approved' ? '#2e7d32' : '#c62828'
                }}>
                  Faculty decision: <strong>{p.faculty_status}</strong>
                  {p.faculty_comments ? ' — ' + p.faculty_comments : ''}
                </div>
              ) : (
                <div>
                  <textarea
                    value={comments[p.id] || ''}
                    onChange={(e) => setComments({ ...comments, [p.id]: e.target.value })}
                    placeholder="Faculty committee comment..."
                    rows={2}
                    style={{
                      width: '100%', padding: '10px', border: '1px solid #cccccc',
                      borderRadius: '4px', fontSize: '13px', resize: 'vertical', marginBottom: '10px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleDecision(p.id, 'approved')}
                      disabled={saving === p.id}
                      style={{
                        backgroundColor: '#2e7d32', color: 'white', border: 'none',
                        padding: '8px 16px', borderRadius: '4px', fontSize: '13px',
                        fontWeight: 'bold', cursor: saving === p.id ? 'not-allowed' : 'pointer'
                      }}>
                      {saving === p.id ? '...' : '✅ Approve at Faculty Level'}
                    </button>
                    <button
                      onClick={() => handleDecision(p.id, 'rejected')}
                      disabled={saving === p.id}
                      style={{
                        backgroundColor: 'transparent', color: '#c62828', border: '1px solid #c62828',
                        padding: '8px 16px', borderRadius: '4px', fontSize: '13px',
                        fontWeight: 'bold', cursor: saving === p.id ? 'not-allowed' : 'pointer'
                      }}>
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default FacultyApprovals