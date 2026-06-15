// src/pages/superadmin/ManageFacultyReps.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function ManageFacultyReps() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [faculties, setFaculties] = useState([])
  const [staff, setStaff] = useState([])
  const [selected, setSelected] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  const fetchData = async () => {
    try {
      const [facRes, staffRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/faculties'),
        fetch('http://localhost:5000/api/auth/faculty-staff')
      ])
      setFaculties(await facRes.json())
      setStaff(await staffRes.json())
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAssign = async (facultyId) => {
    const userId = selected[facultyId]
    if (!userId) {
      alert('Please choose a staff member first.')
      return
    }
    setSaving(facultyId)
    try {
      const res = await fetch('http://localhost:5000/api/auth/assign-faculty-rep', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, facultyId })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      setSelected({ ...selected, [facultyId]: '' })
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

        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Faculty Representatives</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Appoint the HDC representative for each faculty
          </p>
        </div>

        <button onClick={() => navigate('/superadmin')} style={{
          backgroundColor: 'transparent', border: '1px solid #002147',
          color: '#002147', padding: '8px 16px', borderRadius: '4px',
          marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
        }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading faculties..." />}

        {!loading && faculties.map(faculty => {
          const candidates = staff.filter(s => s.faculty_id === faculty.id)
          return (
            <div key={faculty.id} style={{
              backgroundColor: 'white', border: '1px solid #dddddd',
              borderRadius: '8px', padding: '20px', marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{ color: '#002147', margin: '0 0 5px 0', fontSize: '16px' }}>{faculty.name}</h3>
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 15px 0' }}>
                Current representative: <strong>{faculty.rep_name || 'Not assigned'}</strong>
                {faculty.rep_email ? ' (' + faculty.rep_email + ')' : ''}
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={selected[faculty.id] || ''}
                  onChange={(e) => setSelected({ ...selected, [faculty.id]: e.target.value })}
                  style={{
                    flex: 1, minWidth: '220px', padding: '10px',
                    border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px', backgroundColor: 'white'
                  }}>
                  <option value="">-- Choose a staff member --</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(faculty.id)}
                  disabled={saving === faculty.id}
                  style={{
                    backgroundColor: saving === faculty.id ? '#cccccc' : '#002147',
                    color: 'white', border: 'none', padding: '10px 18px',
                    borderRadius: '4px', fontSize: '14px', fontWeight: 'bold',
                    cursor: saving === faculty.id ? 'not-allowed' : 'pointer'
                  }}>
                  {saving === faculty.id ? 'Saving...' : (faculty.rep_id ? 'Change Rep' : 'Assign Rep')}
                </button>
              </div>

              {candidates.length === 0 && (
                <p style={{ fontSize: '12px', color: '#e65100', margin: '10px 0 0 0' }}>
                  No supervisors or coordinators in this faculty to choose from yet.
                </p>
              )}
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default ManageFacultyReps