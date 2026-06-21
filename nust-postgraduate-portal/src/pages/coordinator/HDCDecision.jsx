// src/pages/coordinator/HDCDecision.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function HDCDecision() {

  const navigate = useNavigate()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [decision, setDecision] = useState('')
  const [comments, setComments] = useState('')
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()

 // Fetch all proposals from database
useEffect(() => {
  const fetchProposals = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/proposals/all?departmentId=${user.department_id}`
      )
      const data = await response.json()
      setProposals(data)
    } catch (err) {
      console.error('Error fetching proposals:', err)
    } finally {
      setLoading(false)
    }
  }
  fetchProposals()
}, [user.department_id])

  const handleSaveDecision = async () => {

    if (!decision) {
      alert('Please select a decision.')
      return
    }

    if (!comments) {
      alert('Please add comments for your decision.')
      return
    }

    setSaving(true)

    try {

      const response = await fetch(
        `http://localhost:5000/api/proposals/hdc-decision/${selectedProposal.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hdcDecision: decision,
            hdcComments: comments
          })
        }
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
          userId: selectedProposal.student_id,
          title: decision === 'approved' ? '✅ Proposal Approved' : '❌ Proposal Rejected',
          message: decision === 'approved'
            ? `Your research proposal "${selectedProposal.title}" has been approved by the HDC committee. You may proceed with your research.`
            : `Your research proposal "${selectedProposal.title}" has been rejected by the HDC committee. Please review the comments and resubmit.`
        })
      })

      // Update local state
      setProposals(proposals.map(p =>
        p.id === selectedProposal.id
          ? {
              ...p,
              status: decision === 'approved' ? 'Approved' : 'Rejected',
              hdc_decision: decision,
              hdc_comments: comments
            }
          : p
      ))

      setSelectedProposal(null)
      setDecision('')
      setComments('')
      alert(`Proposal ${decision === 'approved' ? 'approved' : 'rejected'} successfully! Student has been notified.`)

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const statusColor = (status) => {
    if (status === 'Approved') return { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' }
    if (status === 'Rejected') return { bg: '#fce4e4', color: '#c62828', border: '#ef5350' }
    return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' }
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
          <h1 style={{ margin: 0, fontSize: '20px' }}>HDC Proposal Decisions</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Record Higher Degrees Committee decisions on student proposals
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

        {/* Loading */}
        {loading && (
          <p style={{ color: '#666', textAlign: 'center' }}>Loading proposals...</p>
        )}

        {/* No proposals */}
        {!loading && proposals.length === 0 && (
          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            padding: '20px',
            borderRadius: '8px',
            color: '#e65100',
            fontSize: '14px'
          }}>
            ⏳ No proposals submitted yet.
          </div>
        )}

        {/* Proposals list */}
        {!loading && proposals.map(proposal => (
          <div key={proposal.id} style={{
            backgroundColor: 'white',
            border: '1px solid #dddddd',
            borderLeft: `4px solid ${proposal.degree === 'PhD' ? '#8B0000' : '#002147'}`,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '15px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
          }}>

            {/* Proposal info */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div>
                <h3 style={{ color: '#002147', marginBottom: '5px', fontSize: '15px' }}>
                  {proposal.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  {proposal.student_name} — {proposal.degree} |
                  Submitted: {new Date(proposal.submitted_at).toLocaleDateString()}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* View PDF */}
                {proposal.file_name && (
                  
                  <a href={`http://localhost:5000/api/uploads/${proposal.file_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#002147',
                      color: 'white',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textDecoration: 'none'
                    }}>
                    📄 View PDF
                  </a>
                )}

                {/* Status badge */}
                <span style={{
                  backgroundColor: statusColor(proposal.status).bg,
                  color: statusColor(proposal.status).color,
                  border: `1px solid ${statusColor(proposal.status).border}`,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}>
                  {proposal.status}
                </span>
              </div>
            </div>

            {/* Supervisor comments */}
{proposal.supervisor_comments && (
  <div style={{
    backgroundColor: '#f0f7ff',
    border: '1px solid #002147',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#333',
    marginBottom: '8px'
  }}>
    <strong>Supervisor Comments:</strong> {proposal.supervisor_comments}
  </div>
)}

            {/* Existing HDC comments */}
            {proposal.hdc_comments && (
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#333',
                marginBottom: '12px'
              }}>
                <strong>HDC Comments:</strong> {proposal.hdc_comments}
              </div>
            )}

            {/* Record decision button - only for pending */}
            {proposal.status === 'Pending HDC Review' && (
              <button
                onClick={() => {
                  setSelectedProposal(proposal)
                  setDecision('')
                  setComments('')
                }}
                style={{
                  backgroundColor: '#002147',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                Record HDC Decision
              </button>
            )}

          </div>
        ))}

        {/* Decision form */}
        {selectedProposal && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
            border: '2px solid #002147',
            marginTop: '20px'
          }}>

            <h3 style={{
              color: '#002147',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              Record Decision for: {selectedProposal.title}
            </h3>

            {/* Decision radio buttons */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: '#002147',
                marginBottom: '10px'
              }}>
                HDC Decision: *
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  value="approved"
                  checked={decision === 'approved'}
                  onChange={(e) => setDecision(e.target.value)}
                />
                ✅ Approved — Student may proceed with research
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  value="rejected"
                  checked={decision === 'rejected'}
                  onChange={(e) => setDecision(e.target.value)}
                />
                ❌ Rejected — Student must revise and resubmit
              </label>
            </div>

            {/* Comments */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: '#002147',
                marginBottom: '6px'
              }}>
                HOD Comments: *
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter comments for the student..."
                rows={4}
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

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveDecision}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: saving ? '#cccccc' : '#002147',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}>
                {saving ? 'Saving...' : 'Save Decision'}
              </button>
              <button
                onClick={() => setSelectedProposal(null)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  color: '#002147',
                  border: '1px solid #002147',
                  borderRadius: '4px',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}>
                Cancel
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default HDCDecision