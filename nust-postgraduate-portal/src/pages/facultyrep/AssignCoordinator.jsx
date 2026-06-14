// src/pages/facultyrep/AssignCoordinator.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function AssignCoordinator() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  const fetchStaff = async () => {
    try {
      const res = await fetch(
        'http://localhost:5000/api/auth/faculty-staff?facultyId=' + user.faculty_id
      )
      setStaff(await res.json())
    } catch (err) {
      console.error('Error fetching staff:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [user.faculty_id])

  const handleToggle = async (member) => {
    const makeCoordinator = member.role !== 'coordinator'
    const msg = makeCoordinator
      ? 'Appoint ' + member.name + ' as a Coordinator?'
      : 'Remove ' + member.name + ' as Coordinator (back to Supervisor)?'
    if (!window.confirm(msg)) return

    setSaving(member.id)
    try {
      const res = await fetch('http://localhost:5000/api/auth/assign-coordinator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: member.id, makeCoordinator })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      fetchStaff()
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
          <h1 style={{ margin: 0, fontSize: '20px' }}>Assign Coordinators</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Appoint programme coordinators within {user.faculty_name || 'your faculty'}
          </p>
        </div>

        <button onClick={() => navigate('/faculty-rep')} style={{
          backgroundColor: 'transparent', border: '1px solid #002147',
          color: '#002147', padding: '8px 16px', borderRadius: '4px',
          marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
        }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading staff..." />}

        {!loading && staff.length === 0 && (
          <div style={{
            backgroundColor: '#fff3e0', border: '1px solid #ff9800',
            padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#e65100'
          }}>
            No academic staff found in your faculty yet.
          </div>
        )}

        {!loading && staff.length > 0 && (
          <div style={{
            backgroundColor: 'white', borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)', overflow: 'hidden'
          }}>
            {staff.map(member => (
              <div key={member.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '15px 20px', borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <p style={{ fontWeight: 'bold', color: '#002147', margin: 0, fontSize: '14px' }}>
                    {member.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '3px 0 0 0' }}>
                    {member.department_name || 'No department'} · {member.email}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    backgroundColor: member.role === 'coordinator' ? '#8B0000' : '#e3f2fd',
                    color: member.role === 'coordinator' ? 'white' : '#1565c0',
                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', textTransform: 'capitalize'
                  }}>
                    {member.role}
                  </span>
                  <button
                    onClick={() => handleToggle(member)}
                    disabled={saving === member.id}
                    style={{
                      backgroundColor: member.role === 'coordinator' ? 'transparent' : '#002147',
                      color: member.role === 'coordinator' ? '#8B0000' : 'white',
                      border: member.role === 'coordinator' ? '1px solid #8B0000' : 'none',
                      padding: '6px 14px', borderRadius: '4px', fontSize: '13px',
                      fontWeight: 'bold', cursor: saving === member.id ? 'not-allowed' : 'pointer'
                    }}>
                    {saving === member.id ? '...' : member.role === 'coordinator' ? 'Remove' : 'Make Coordinator'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default AssignCoordinator