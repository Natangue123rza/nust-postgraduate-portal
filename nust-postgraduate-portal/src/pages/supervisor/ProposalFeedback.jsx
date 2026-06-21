// src/pages/supervisor/ProposalFeedback.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function ProposalFeedback() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/proposals/supervisor-feedback/' + user.id)
        setRows(await res.json())
      } catch (err) {
        console.error('Error fetching feedback:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeedback()
  }, [user.id])

  // Group the flat review rows by proposal
  const proposals = []
  const byId = {}
  rows.forEach(r => {
    if (!byId[r.proposal_id]) {
      byId[r.proposal_id] = {
        proposal_id: r.proposal_id,
        title: r.proposal_title,
        student_name: r.student_name,
        degree: r.degree,
        reviews: []
      }
      proposals.push(byId[r.proposal_id])
    }
    byId[r.proposal_id].reviews.push(r)
  })

  const statusLabel = (s) => s === 'Approved' ? '✅ Approved' : s === 'Feedback' ? '📝 Feedback given' : '⏳ Pending'

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ backgroundColor: '#002147', color: 'white', padding: '25px 30px', borderRadius: '8px', marginBottom: '25px' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Evaluator Feedback</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Evaluator feedback on your students' proposals — visible to you and the coordinator, not the student.
          </p>
        </div>

        {loading && <LoadingSpinner message="Loading feedback..." />}

        {!loading && proposals.length === 0 && (
          <div style={{ backgroundColor: '#fff3e0', border: '1px solid #ff9800', padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#e65100' }}>
            No evaluator feedback on your students' proposals yet.
          </div>
        )}

        {!loading && proposals.map(p => {
          const approvals = p.reviews.filter(r => r.status === 'Approved').length
          return (
            <div key={p.proposal_id} style={{
              backgroundColor: 'white', border: '1px solid #dddddd',
              borderLeft: '4px solid ' + (p.degree === 'PhD' ? '#8B0000' : '#002147'),
              borderRadius: '8px', padding: '20px', marginBottom: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
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
              <p style={{ fontSize: '13px', color: '#333', margin: '0 0 14px 0' }}>{p.title}</p>

              {p.reviews.map(r => (
                <div key={r.review_id} style={{
                  backgroundColor: '#f9f9f9', border: '1px solid #eeeeee', borderRadius: '4px',
                  padding: '10px 12px', marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#002147', fontWeight: 'bold' }}>{r.evaluator_name}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>{statusLabel(r.status)}</span>
                  </div>
                  {r.feedback ? (
                    <p style={{ fontSize: '12px', color: '#444', margin: '6px 0 0 0', fontStyle: 'italic', lineHeight: '1.4' }}>
                      "{r.feedback}"
                    </p>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#999', margin: '6px 0 0 0' }}>
                      No feedback submitted yet.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default ProposalFeedback