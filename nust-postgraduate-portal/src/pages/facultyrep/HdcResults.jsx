// src/pages/facultyrep/HdcResults.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function HdcResults() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [evals, setEvals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/evaluations/pending-hdc?facultyId=' + user.faculty_id)
      setEvals(await res.json())
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchData() }, [user.faculty_id])

  const byStudent = {}
  evals.forEach(e => {
    if (!byStudent[e.student_id]) {
      byStudent[e.student_id] = { studentId: e.student_id, name: e.student_name, degree: e.degree, marks: [] }
    }
    byStudent[e.student_id].marks.push(e)
  })
  const students = Object.values(byStudent)

  const handleApprove = async (studentId, name) => {
    if (!window.confirm('Record HDC approval of the marks for ' + name + '?')) return
    setSaving(studentId)
    try {
      const res = await fetch('http://localhost:5000/api/evaluations/hdc-approve/' + studentId, { method: 'PUT' })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      fetchData()
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ backgroundColor: '#002147', color: 'white', padding: '25px 30px', borderRadius: '8px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>HDC Results Approval</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Marks submitted by coordinators, awaiting HDC approval
          </p>
        </div>

        <button onClick={() => navigate('/faculty-rep')} style={{
          backgroundColor: 'transparent', border: '1px solid #002147', color: '#002147',
          padding: '8px 16px', borderRadius: '4px', marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
        }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading..." />}

        {!loading && students.length === 0 && (
          <div style={{ backgroundColor: '#fff3e0', border: '1px solid #ff9800', padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#e65100' }}>
            No marks are awaiting HDC approval.
          </div>
        )}

        {!loading && students.map(s => (
          <div key={s.studentId} style={{
            backgroundColor: 'white', border: '1px solid #dddddd',
            borderLeft: '4px solid ' + (s.degree === 'PhD' ? '#8B0000' : '#002147'),
            borderRadius: '8px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
          }}>
            <h3 style={{ color: '#002147', margin: '0 0 10px 0', fontSize: '16px' }}>
              {s.name} <span style={{ fontSize: '11px', color: '#666' }}>({s.degree})</span>
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {s.marks.map(m => (
                <span key={m.id} style={{
                  backgroundColor: '#f5f5f5', color: '#002147', border: '1px solid #ddd',
                  padding: '4px 10px', borderRadius: '4px', fontSize: '12px'
                }}>
                  {m.examiner_name || 'Examiner'}: <strong>{m.total_mark}/100</strong>
                </span>
              ))}
            </div>
            <button
              onClick={() => handleApprove(s.studentId, s.name)}
              disabled={saving === s.studentId}
              style={{
                backgroundColor: '#2e7d32', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '4px', fontSize: '13px',
                fontWeight: 'bold', cursor: saving === s.studentId ? 'not-allowed' : 'pointer'
              }}>
              {saving === s.studentId ? '...' : '✅ Record HDC Approval'}
            </button>
          </div>
        ))}

      </div>
    </div>
  )
}

export default HdcResults