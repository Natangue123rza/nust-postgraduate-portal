// src/pages/hod/AssignSupervisor.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'

function AssignSupervisor() {

  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedSupervisor, setSelectedSupervisor] = useState('')
  const [saving, setSaving] = useState(false)
  const [assigned, setAssigned] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsRes = await fetch('http://localhost:5000/api/auth/students')
        const studentsData = await studentsRes.json()
        setStudents(studentsData)

        const supervisorsRes = await fetch('http://localhost:5000/api/auth/supervisors')
        const supervisorsData = await supervisorsRes.json()
        setSupervisors(supervisorsData)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAssign = async () => {

    if (!selectedSupervisor) {
      alert('Please select a supervisor.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/assign-supervisor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          supervisorId: Number(selectedSupervisor)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message)
        return
      }

      setAssigned(true)

      // Refresh students to show updated supervisor
      const studentsRes = await fetch('http://localhost:5000/api/auth/students')
      const studentsData = await studentsRes.json()
      setStudents(studentsData)

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }
const handleRemove = async (studentId, studentName) => {

  if (!window.confirm(`Remove supervisor from ${studentName}?`)) return

  setSaving(true)

  try {
    const response = await fetch('http://localhost:5000/api/auth/assign-supervisor', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: studentId,
        supervisorId: null
      })
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message)
      return
    }

    alert(`Supervisor removed from ${studentName}`)

    // Refresh students
    const studentsRes = await fetch('http://localhost:5000/api/auth/students')
    const studentsData = await studentsRes.json()
    setStudents(studentsData)
    setSelectedStudent(null)

  } catch (err) {
    alert('Could not connect to server.')
    console.error(err)
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
          backgroundColor: '#002147',
          color: 'white',
          padding: '25px 30px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Assign Supervisor</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Assign supervisors to postgraduate students
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

        {loading && <LoadingSpinner message="Loading students and supervisors..." />}

        {!loading && (
          <div>

            {/* Students list */}
            <h2 style={{
              color: '#002147',
              marginBottom: '20px',
              fontSize: '18px',
              borderLeft: '4px solid #8B0000',
              paddingLeft: '10px'
            }}>
              Select a Student
            </h2>

            <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap',
              marginBottom: '30px'
            }}>
              {students.map(student => (
                <div
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student)
                    setSelectedSupervisor('')
                    setAssigned(false)
                  }}
                  style={{
                    backgroundColor: selectedStudent?.id === student.id ? '#002147' : 'white',
                    color: selectedStudent?.id === student.id ? 'white' : '#333',
                    border: '1px solid #dddddd',
                    borderTop: `4px solid ${student.degree === 'PhD' ? '#8B0000' : '#002147'}`,
                    padding: '20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '220px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                  }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '15px' }}>
                    {student.name}
                  </h3>
                  <span style={{
                    backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}>
                    {student.degree}
                  </span>
                {student.supervisor_id && (
  <div>
    <p style={{
      fontSize: '11px',
      marginTop: '8px',
      color: selectedStudent?.id === student.id ? '#aaaaaa' : '#2e7d32'
    }}>
      ✅ Supervisor assigned
    </p>
    <button
      onClick={(e) => {
        e.stopPropagation()
        handleRemove(student.id, student.name)
      }}
      style={{
        backgroundColor: '#c62828',
        color: 'white',
        border: 'none',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        cursor: 'pointer',
        marginTop: '5px'
      }}>
      ✕ Remove
    </button>
  </div>
)}
                </div>
              ))}
            </div>

            {/* Assignment form */}
            {selectedStudent && (
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
              }}>

                <h3 style={{
                  color: '#002147',
                  borderBottom: '2px solid #f0f0f0',
                  paddingBottom: '10px',
                  marginBottom: '20px'
                }}>
                  Assign Supervisor for {selectedStudent.name}
                </h3>

                {/* Supervisor dropdown */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontWeight: 'bold',
                    color: '#002147',
                    marginBottom: '6px'
                  }}>
                    Select Supervisor: *
                  </label>
                  <select
                    value={selectedSupervisor}
                    onChange={(e) => {
                      setSelectedSupervisor(e.target.value)
                      setAssigned(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #cccccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}>
                    <option value="">-- Select Supervisor --</option>
                    {supervisors.map(supervisor => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Success message */}
                {assigned && (
                  <div style={{
                    backgroundColor: '#e6f4ea',
                    border: '1px solid #4caf50',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    color: '#2e7d32',
                    fontSize: '14px'
                  }}>
                    ✅ Supervisor successfully assigned to {selectedStudent.name}!
                    The supervisor has been notified.
                  </div>
                )}

                {/* Assign button */}
                <button
                  onClick={handleAssign}
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: saving ? '#cccccc' : '#002147',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}>
                  {saving ? 'Assigning...' : 'Confirm Supervisor Assignment'}
                </button>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

export default AssignSupervisor