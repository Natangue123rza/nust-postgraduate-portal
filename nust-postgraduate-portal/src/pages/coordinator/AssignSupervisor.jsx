// src/pages/coordinator/AssignSupervisor.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function AssignSupervisor() {

  const navigate = useNavigate()
  const { user } = useAuth()

  const [students, setStudents] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [supervisor, setSupervisor] = useState('')
  const [coSupervisor, setCoSupervisor] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      const studentsRes = await fetch(
        'http://localhost:5000/api/auth/students?departmentId=' + user.department_id
      )
      setStudents(await studentsRes.json())

      const supervisorsRes = await fetch(
        'http://localhost:5000/api/auth/supervisors?departmentId=' + user.department_id
      )
      setSupervisors(await supervisorsRes.json())
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user.department_id])

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    // Pre-fill with current assignment if any
    setSupervisor(student.supervisor_id ? String(student.supervisor_id) : '')
    setCoSupervisor(student.co_supervisor_id ? String(student.co_supervisor_id) : '')
  }

  const handleAssign = async () => {

    if (!supervisor) {
      alert('Please select a main supervisor.')
      return
    }

    if (coSupervisor && coSupervisor === supervisor) {
      alert('Co-supervisor must be different from the main supervisor.')
      return
    }

    // If changing an existing supervisor, confirm first
    const hasExisting = selectedStudent.supervisor_id
    const isChanging = hasExisting && String(selectedStudent.supervisor_id) !== supervisor

    if (isChanging) {
      const confirmed = window.confirm(
        'This student already has a supervisor (' + selectedStudent.supervisor_name + ').\n\n' +
        'Changing it will notify the current supervisor, the new supervisor, and the student.\n\nProceed?'
      )
      if (!confirmed) return
    }

    setSaving(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/assign-supervisors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          supervisorId: supervisor,
          coSupervisorId: coSupervisor || null
        })
      })

      const data = await response.json()
      if (!response.ok) {
        alert(data.message)
        return
      }

      alert(data.message)
      setSelectedStudent(null)
      setSupervisor('')
      setCoSupervisor('')
      fetchData()

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

      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>Assign Supervisors</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Assign a supervisor and co-supervisor to students in your department
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/coordinator')}
          style={{
            backgroundColor: 'transparent', border: '1px solid #002147',
            color: '#002147', padding: '8px 16px', borderRadius: '4px',
            marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
          }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading students..." />}

        {/* No students */}
        {!loading && students.length === 0 && (
          <div style={{
            backgroundColor: '#fff3e0', border: '1px solid #ff9800',
            padding: '25px', borderRadius: '8px',
            textAlign: 'center', color: '#e65100'
          }}>
            ⏳ No students in your department yet.
          </div>
        )}

        {/* Student list */}
        {!loading && students.length > 0 && (
          <div>
            <h2 style={{
              color: '#002147', marginBottom: '20px', fontSize: '18px',
              borderLeft: '4px solid #8B0000', paddingLeft: '10px'
            }}>
              Select a Student
            </h2>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {students.map(student => (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  style={{
                    backgroundColor: selectedStudent && selectedStudent.id === student.id ? '#002147' : 'white',
                    color: selectedStudent && selectedStudent.id === student.id ? 'white' : '#333333',
                    border: '1px solid #dddddd',
                    borderTop: '4px solid ' + (student.degree === 'PhD' ? '#8B0000' : '#002147'),
                    padding: '20px', borderRadius: '8px',
                    cursor: 'pointer', width: '240px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                  }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '15px' }}>
                    {student.name}
                  </h3>
                  <span style={{
                    backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                    color: 'white', padding: '3px 10px',
                    borderRadius: '12px', fontSize: '11px'
                  }}>
                    {student.degree}
                  </span>

                  {/* Current assignment status */}
                  <div style={{ marginTop: '10px', fontSize: '12px' }}>
                    <p style={{
                      color: selectedStudent && selectedStudent.id === student.id ? '#ddd' : '#666',
                      marginBottom: '2px'
                    }}>
                      Supervisor: {student.supervisor_name || 'Not assigned'}
                    </p>
                    <p style={{
                      color: selectedStudent && selectedStudent.id === student.id ? '#ddd' : '#666'
                    }}>
                      Co-Supervisor: {student.co_supervisor_name || 'None'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Assignment form */}
            {selectedStudent && (
              <div style={{
                backgroundColor: 'white', padding: '25px',
                borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
              }}>
                <h2 style={{
                  color: '#002147', marginBottom: '5px', fontSize: '18px',
                  borderLeft: '4px solid #8B0000', paddingLeft: '10px'
                }}>
                  Assign Supervisors for {selectedStudent.name}
                </h2>

                <div style={{
                  backgroundColor: '#f0f7ff', border: '1px solid #002147',
                  padding: '12px 15px', borderRadius: '6px',
                  margin: '15px 0', fontSize: '13px', color: '#002147'
                }}>
                  ℹ️ The co-supervisor is optional and supports the main supervisor.
                  Both must be from the same department.
                </div>

                {/* Main supervisor */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block', fontWeight: 'bold',
                    color: '#002147', marginBottom: '6px'
                  }}>
                    Main Supervisor: *
                  </label>
                  <select
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    style={{
                      width: '100%', padding: '10px',
                      border: '1px solid #cccccc', borderRadius: '4px',
                      fontSize: '14px', backgroundColor: 'white'
                    }}>
                    <option value="">-- Select Main Supervisor --</option>
                    {supervisors.map(sup => (
                      <option key={sup.id} value={String(sup.id)}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Co-supervisor */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block', fontWeight: 'bold',
                    color: '#002147', marginBottom: '6px'
                  }}>
                    Co-Supervisor (optional):
                  </label>
                  <select
                    value={coSupervisor}
                    onChange={(e) => setCoSupervisor(e.target.value)}
                    style={{
                      width: '100%', padding: '10px',
                      border: '1px solid #cccccc', borderRadius: '4px',
                      fontSize: '14px', backgroundColor: 'white'
                    }}>
                    <option value="">-- No Co-Supervisor --</option>
                    {supervisors
                      .filter(sup => String(sup.id) !== supervisor)
                      .map(sup => (
                        <option key={sup.id} value={String(sup.id)}>
                          {sup.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Save button */}
                <button
                  onClick={handleAssign}
                  disabled={saving}
                  style={{
                    width: '100%', padding: '12px',
                    backgroundColor: saving ? '#cccccc' : '#002147',
                    color: 'white', border: 'none', borderRadius: '4px',
                    fontSize: '15px', fontWeight: 'bold',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}>
                 {saving
                    ? 'Saving...'
                    : selectedStudent.supervisor_id
                    ? 'Update Supervisor Assignment'
                    : 'Confirm Supervisor Assignment'}
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