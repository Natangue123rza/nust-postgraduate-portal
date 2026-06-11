// src/pages/admin/ManageExaminers.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'

function ManageExaminers() {

  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [examiners, setExaminers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [departmentId, setDepartmentId] = useState('')

  const fetchData = async () => {
    try {
      const deptRes = await fetch('http://localhost:5000/api/auth/departments')
      setDepartments(await deptRes.json())

      const examRes = await fetch('http://localhost:5000/api/auth/all-examiners')
      setExaminers(await examRes.json())
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!name || !email || !password || !departmentId) {
      alert('Please fill in all fields.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/create-examiner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, departmentId })
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.message)
        return
      }
      alert(data.message)
      setName('')
      setEmail('')
      setPassword('')
      setDepartmentId('')
      fetchData()
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Navbar />

      <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Manage External Examiners</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Create accounts for external examiners and assign them to a department
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/admin')}
          style={{
            backgroundColor: 'transparent', border: '1px solid #002147',
            color: '#002147', padding: '8px 16px', borderRadius: '4px',
            marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
          }}>
          ← Back to Dashboard
        </button>

        {/* Create form */}
        <div style={{
          backgroundColor: 'white', padding: '25px',
          borderRadius: '8px', marginBottom: '30px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
        }}>
          <h3 style={{
            color: '#8B0000', borderBottom: '2px solid #f0f0f0',
            paddingBottom: '10px', marginBottom: '20px'
          }}>
            Create New External Examiner
          </h3>

          {/* Name */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px' }}>
              Full Name: *
            </label>
            <input
              type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. John Smith"
              style={{
                width: '100%', padding: '10px',
                border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px'
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px' }}>
              Email Address: *
            </label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="examiner@university.edu"
              style={{
                width: '100%', padding: '10px',
                border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px' }}>
              Initial Password: *
            </label>
            <input
              type="text" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary password to share with the examiner"
              style={{
                width: '100%', padding: '10px',
                border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px'
              }}
            />
          </div>

          {/* Department */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px' }}>
              Department: *
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              style={{
                width: '100%', padding: '10px',
                border: '1px solid #cccccc', borderRadius: '4px',
                fontSize: '14px', backgroundColor: 'white'
              }}>
              <option value="">-- Select Department --</option>
              {departments.map(dept => (
                <option key={dept.id} value={String(dept.id)}>
                  {dept.name} ({dept.faculty_name})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreate}
            disabled={saving}
            style={{
              width: '100%', padding: '12px',
              backgroundColor: saving ? '#cccccc' : '#002147',
              color: 'white', border: 'none', borderRadius: '4px',
              fontSize: '15px', fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}>
            {saving ? 'Creating...' : 'Create Examiner Account'}
          </button>
        </div>

        {/* Existing examiners list */}
        <h3 style={{
          color: '#002147', marginBottom: '15px', fontSize: '16px',
          borderLeft: '4px solid #8B0000', paddingLeft: '10px'
        }}>
          Existing External Examiners
        </h3>

        {loading && <LoadingSpinner message="Loading examiners..." />}

        {!loading && examiners.length === 0 && (
          <p style={{ color: '#666', fontSize: '14px' }}>No examiner accounts yet.</p>
        )}

        {!loading && examiners.map(ex => (
          <div key={ex.id} style={{
            backgroundColor: 'white',
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            padding: '15px 20px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '2px' }}>
                {ex.name}
              </p>
              <p style={{ fontSize: '12px', color: '#666' }}>{ex.email}</p>
            </div>
            <span style={{
              backgroundColor: '#f0f7ff', color: '#002147',
              border: '1px solid #002147', padding: '4px 12px',
              borderRadius: '12px', fontSize: '11px'
            }}>
              {ex.department_name || 'No department'}
            </span>
          </div>
        ))}

      </div>
    </div>
  )
}

export default ManageExaminers