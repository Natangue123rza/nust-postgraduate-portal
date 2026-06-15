// src/pages/coordinator/ScheduleDefence.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function ScheduleDefence() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [defences, setDefences] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [studentId, setStudentId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')

  const fetchData = async () => {
    try {
      const [sRes, dRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/students?departmentId=' + user.department_id),
        fetch('http://localhost:5000/api/presentations?departmentId=' + user.department_id)
      ])
      setStudents(await sRes.json())
      setDefences(await dRes.json())
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user.department_id])

  const handleSchedule = async () => {
    if (!studentId) { alert('Please choose a student.'); return }
    if (!date) { alert('Please choose a date.'); return }
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/presentations/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, title, defenceDate: date, defenceTime: time, venue })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      setStudentId(''); setTitle(''); setDate(''); setTime(''); setVenue('')
      fetchData()
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid #cccccc',
    borderRadius: '4px', fontSize: '14px', marginBottom: '15px'
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Schedule a Defence</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Scheduled defences appear on the portal home page for everyone
          </p>
        </div>

        <button onClick={() => navigate('/coordinator')} style={{
          backgroundColor: 'transparent', border: '1px solid #002147',
          color: '#002147', padding: '8px 16px', borderRadius: '4px',
          marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
        }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading..." />}

        {!loading && (
          <div style={{
            backgroundColor: 'white', padding: '25px', borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)', marginBottom: '30px'
          }}>
            <h3 style={{ color: '#8B0000', marginBottom: '15px', fontSize: '16px' }}>New Defence</h3>

            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px', fontSize: '13px' }}>Student</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }}>
              <option value="">-- Choose a student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.degree})</option>
              ))}
            </select>

            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px', fontSize: '13px' }}>Title / Topic</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Thesis title or topic" style={inputStyle} />

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px', fontSize: '13px' }}>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px', fontSize: '13px' }}>Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px', fontSize: '13px' }}>Venue</label>
            <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. FCI Boardroom, Block 9" style={inputStyle} />

            <button onClick={handleSchedule} disabled={saving} style={{
              backgroundColor: saving ? '#cccccc' : '#002147', color: 'white', border: 'none',
              padding: '12px 20px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}>
              {saving ? 'Scheduling...' : 'Schedule Defence'}
            </button>
          </div>
        )}

        {!loading && defences.length > 0 && (
          <div>
            <h3 style={{ color: '#002147', marginBottom: '15px', fontSize: '16px',
              borderLeft: '4px solid #8B0000', paddingLeft: '10px' }}>
              Scheduled Defences
            </h3>
            {defences.map(d => (
              <div key={d.id} style={{
                backgroundColor: 'white', border: '1px solid #dddddd',
                borderLeft: '4px solid ' + (d.degree === 'PhD' ? '#8B0000' : '#002147'),
                borderRadius: '8px', padding: '15px 20px', marginBottom: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}>
                <p style={{ fontWeight: 'bold', color: '#002147', margin: '0 0 4px 0', fontSize: '14px' }}>
                  {d.student_name} <span style={{ fontSize: '11px', color: '#666' }}>({d.degree})</span>
                </p>
                {d.title && <p style={{ fontSize: '13px', color: '#333', margin: '0 0 6px 0' }}>{d.title}</p>}
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                  📅 {d.defence_date ? new Date(d.defence_date).toLocaleDateString() : 'TBC'}
                  {d.defence_time ? ' at ' + d.defence_time : ''}
                  {d.venue ? ' · ' + d.venue : ''}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default ScheduleDefence