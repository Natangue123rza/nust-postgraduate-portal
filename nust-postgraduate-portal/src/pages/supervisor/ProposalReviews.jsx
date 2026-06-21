// src/pages/supervisor/ProposalReviews.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function ProposalReviews() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [feedback, setFeedback] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/proposals/my-reviews/' + user.id)
      const data = await res.json()
      setReviews(data)
      const fb = {}
      data.forEach(r => { fb[r.review_id] = r.feedback || '' })
      setFeedback(fb)
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchReviews() }, [user.id])

  const handleSubmit = async (reviewId, status) => {
    const fb = feedback[reviewId] || ''
    if (status === 'Feedback' && !fb.trim()) {
      alert('Please write your feedback before submitting.')
      return
    }
    setSaving(reviewId)
    try {
      const res = await fetch('http://localhost:5000/api/proposals/submit-review/' + reviewId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: fb, status })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      fetchReviews()
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSaving(null)
    }
  }

  const statusBadge = (s) => {
    const map = {
      Approved: { bg: '#e6f4ea', bd: '#4caf50', fg: '#2e7d32', label: '✅ Approved' },
      Feedback: { bg: '#e3f2fd', bd: '#1976d2', fg: '#0d47a1', label: '📝 Feedback given' },
      Pending: { bg: '#fff3e0', bd: '#ff9800', fg: '#e65100', label: '⏳ Awaiting your review' }
    }
    const c = map[s] || map.Pending
    return (
      <span style={{
        backgroundColor: c.bg, color: c.fg, border: '1px solid ' + c.bd,
        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
      }}>{c.label}</span>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ backgroundColor: '#002147', color: 'white', padding: '25px 30px', borderRadius: '8px', marginBottom: '25px' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Proposal Reviews</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Review assigned proposals and give feedback. Approve when you are satisfied — no marks at this stage.
          </p>
        </div>

        {loading && <LoadingSpinner message="Loading your reviews..." />}

        {!loading && reviews.length === 0 && (
          <div style={{ backgroundColor: '#fff3e0', border: '1px solid #ff9800', padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#e65100' }}>
            You have no proposals assigned for review yet.
          </div>
        )}

        {!loading && reviews.map(r => (
          <div key={r.review_id} style={{
            backgroundColor: 'white', border: '1px solid #dddddd',
            borderLeft: '4px solid ' + (r.degree === 'PhD' ? '#8B0000' : '#002147'),
            borderRadius: '8px', padding: '22px', marginBottom: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ color: '#002147', margin: 0, fontSize: '16px' }}>
                {r.student_name} <span style={{ fontSize: '11px', color: '#666' }}>({r.degree})</span>
              </h3>
              {statusBadge(r.status)}
            </div>
            <p style={{ fontSize: '14px', color: '#002147', fontWeight: 'bold', margin: '0 0 6px 0' }}>{r.title}</p>
            {r.description && (
              <p style={{ fontSize: '13px', color: '#444', margin: '0 0 14px 0', lineHeight: '1.5' }}>{r.description}</p>
            )}

            {r.file_name && (
              <a href={'http://localhost:5000/api/uploads/' + r.file_name}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-block', backgroundColor: '#002147', color: 'white',
                  padding: '7px 16px', borderRadius: '4px', fontSize: '12px',
                  textDecoration: 'none', marginBottom: '16px'
                }}>
                📄 View Proposal PDF
              </a>
            )}

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#002147', marginBottom: '6px' }}>
              Your Feedback (areas for improvement)
            </label>
            <textarea
              value={feedback[r.review_id] || ''}
              onChange={(e) => setFeedback({ ...feedback, [r.review_id]: e.target.value })}
              placeholder="Outline what the student should improve..."
              rows={4}
              style={{
                width: '100%', padding: '11px', border: '1px solid #cccccc',
                borderRadius: '4px', fontSize: '13px', resize: 'vertical', marginBottom: '12px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleSubmit(r.review_id, 'Feedback')}
                disabled={saving === r.review_id}
                style={{
                  backgroundColor: saving === r.review_id ? '#cccccc' : '#1976d2', color: 'white', border: 'none',
                  padding: '9px 18px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
                  cursor: saving === r.review_id ? 'not-allowed' : 'pointer'
                }}>
                {saving === r.review_id ? '...' : 'Submit Feedback'}
              </button>
              <button
                onClick={() => handleSubmit(r.review_id, 'Approved')}
                disabled={saving === r.review_id}
                style={{
                  backgroundColor: saving === r.review_id ? '#cccccc' : '#2e7d32', color: 'white', border: 'none',
                  padding: '9px 18px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
                  cursor: saving === r.review_id ? 'not-allowed' : 'pointer'
                }}>
                {saving === r.review_id ? '...' : '✅ Approve Proposal'}
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}

export default ProposalReviews