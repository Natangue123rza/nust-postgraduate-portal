// src/pages/hod/AssignExaminers.jsx
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function AssignExaminers() {

  const navigate = useNavigate()

  // Students and examiners from database
  const [students, setStudents] = useState([])
  const [examiners, setExaminers] = useState([])

  // Track which student is selected
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Examiner assignment fields
  const [internalExaminer, setInternalExaminer] = useState('')
  const [externalExaminer, setExternalExaminer] = useState('')

  // Track if assignment was saved
  const [assigned, setAssigned] = useState(false)

  // Fetch students and examiners from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsRes = await fetch('http://localhost:5000/api/auth/students')
        const studentsData = await studentsRes.json()
        setStudents(studentsData)

        const examinersRes = await fetch('http://localhost:5000/api/auth/examiners')
        const examinersData = await examinersRes.json()
        setExaminers(examinersData)
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()
  }, [])

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setInternalExaminer('')
    setExternalExaminer('')
    setAssigned(false)
  }

  const handleAssign = async () => {

    if (!internalExaminer) {
      alert('Please select an internal examiner.')
      return
    }

    if (selectedStudent.degree === 'PhD' && !externalExaminer) {
      alert('PhD students require both an internal and external examiner.')
      return
    }

    try {

      const internalExaminerObj = examiners.find(e => e.name === internalExaminer)
      const externalExaminerObj = examiners.find(e => e.name === externalExaminer)

      // Save assignment to database
      const response = await fetch('http://localhost:5000/api/assignments/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          internalExaminerId: internalExaminerObj?.id,
          externalExaminerId: externalExaminerObj?.id || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message)
        return
      }

      setAssigned(true)

      // Notify internal examiner
      if (internalExaminerObj) {
        await fetch('http://localhost:5000/api/notifications/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: internalExaminerObj.id,
            title: 'New Student Assigned',
            message: `You have been assigned as internal examiner for ${selectedStudent.name} (${selectedStudent.degree}). Please log in to submit your evaluation.`
          })
        })
      }

      // Notify external examiner if PhD
      if (selectedStudent.degree === 'PhD' && externalExaminerObj) {
        await fetch('http://localhost:5000/api/notifications/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: externalExaminerObj.id,
            title: 'New Student Assigned',
            message: `You have been assigned as external examiner for ${selectedStudent.name} (${selectedStudent.degree}). Please log in to submit your evaluation.`
          })
        })
      }

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    }
  }

  return (
    <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '1100px',
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
          <h1 style={{ margin: 0, fontSize: '22px' }}>Assign Examiners</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Select a student to assign their examiner(s)
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

        {/* Student list */}
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
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '30px'
        }}>
          {students.map(student => (
            <div
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              style={{
                backgroundColor: selectedStudent?.id === student.id ? '#002147' : 'white',
                color: selectedStudent?.id === student.id ? 'white' : '#333333',
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
            </div>
          ))}
        </div>

        {/* Examiner assignment form */}
        {selectedStudent && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
          }}>

            <h2 style={{
              color: '#002147',
              marginBottom: '5px',
              fontSize: '18px',
              borderLeft: '4px solid #8B0000',
              paddingLeft: '10px'
            }}>
              Assign Examiners for {selectedStudent.name}
            </h2>

            <p style={{
              color: '#666666',
              fontSize: '13px',
              marginBottom: '20px',
              paddingLeft: '14px'
            }}>
              {selectedStudent.degree === 'Masters'
                ? '⚠️ Masters student — requires 1 internal examiner only'
                : '⚠️ PhD student — requires 1 internal AND 1 external examiner'
              }
            </p>

            {/* Internal Examiner Dropdown */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: '#002147',
                marginBottom: '6px'
              }}>
                Internal Examiner: *
              </label>
              <select
                value={internalExaminer}
                onChange={(e) => setInternalExaminer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}>
                <option value="">-- Select Internal Examiner --</option>
                {examiners.map(examiner => (
                  <option key={examiner.id} value={examiner.name}>
                    {examiner.name}
                  </option>
                ))}
              </select>
            </div>

            {/* External Examiner Dropdown - PhD only */}
            {selectedStudent.degree === 'PhD' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#002147',
                  marginBottom: '6px'
                }}>
                  External Examiner: *
                </label>
                <select
                  value={externalExaminer}
                  onChange={(e) => setExternalExaminer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}>
                  <option value="">-- Select External Examiner --</option>
                  {examiners
                    .filter(examiner => examiner.name !== internalExaminer)
                    .map(examiner => (
                      <option key={examiner.id} value={examiner.name}>
                        {examiner.name}
                      </option>
                    ))
                  }
                </select>
              </div>
            )}

            {/* Success message */}
            {assigned && (
              <div style={{
                backgroundColor: '#e6f4ea',
                border: '1px solid #4caf50',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '20px',
                color: '#2e7d32',
                fontSize: '14px'
              }}>
                ✅ Examiners successfully assigned to {selectedStudent.name}!
                The examiner(s) have been notified.
              </div>
            )}

            {/* Assign button */}
            <button
              onClick={handleAssign}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#002147',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
              Confirm Examiner Assignment
            </button>

          </div>
        )}

      </div>
    </div>
  )
}

export default AssignExaminers