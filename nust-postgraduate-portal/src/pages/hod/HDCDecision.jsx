// src/pages/hod/HDCDecision.jsx
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'

function HDCDecision() {

  const navigate = useNavigate()

  // Simulated proposals waiting for HDC decision
  const [proposals, setProposals] = useState([
    {
      id: 1,
      studentName: 'David Student',
      degree: 'Masters',
      title: 'Machine Learning in Healthcare',
      submittedAt: '10/04/2026',
      status: 'Pending',
      decision: '',
      comments: ''
    },
    {
      id: 2,
      studentName: 'Paulina Efriam',
      degree: 'PhD',
      title: 'Blockchain Security in African Financial Systems',
      submittedAt: '11/04/2026',
      status: 'Pending',
      decision: '',
      comments: ''
    }
  ])

  // Track which proposal is selected
  const [selectedProposal, setSelectedProposal] = useState(null)

  // Decision form fields
  const [decision, setDecision] = useState('')
  const [comments, setComments] = useState('')

  // Handle saving decision
  const handleSaveDecision = () => {

    if (!decision) {
      alert('Please select a decision.')
      return
    }

    if (!comments) {
      alert('Please add comments for your decision.')
      return
    }

    // Update the proposal status
    setProposals(proposals.map(p =>
      p.id === selectedProposal.id
        ? {
            ...p,
            status: decision === 'approved' ? 'Approved' : 'Rejected',
            decision,
            comments
          }
        : p
    ))

    // Clear selection
    setSelectedProposal(null)
    setDecision('')
    setComments('')

    alert(`Proposal ${decision === 'approved' ? 'approved' : 'rejected'} successfully!`)

  }

  // Status color helper
  const statusColor = (status) => {
    if (status === 'Approved') return { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' }
    if (status === 'Rejected') return { bg: '#fce4e4', color: '#c62828', border: '#ef5350' }
    return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' }
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
            HDC Proposal Decisions
          </h1>
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

        {/* Proposals list */}
        <h2 style={{
          color: '#002147',
          marginBottom: '20px',
          fontSize: '18px',
          borderLeft: '4px solid #8B0000',
          paddingLeft: '10px'
        }}>
          Submitted Proposals
        </h2>

        {proposals.map(proposal => (
          <div
            key={proposal.id}
            style={{
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
                <h3 style={{
                  color: '#002147',
                  marginBottom: '5px',
                  fontSize: '15px'
                }}>
                  {proposal.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  {proposal.studentName} — {proposal.degree} | Submitted: {proposal.submittedAt}
                </p>
              </div>

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

            {/* Show existing comments if decided */}
            {proposal.comments && (
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#333',
                marginBottom: '12px'
              }}>
                <strong>HOD Comments:</strong> {proposal.comments}
              </div>
            )}

            {/* Record decision button - only show if pending */}
            {proposal.status === 'Pending' && (
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

        {/* Decision form - shows when proposal selected */}
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
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#002147',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>
                Save Decision
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