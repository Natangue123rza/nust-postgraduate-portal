// src/pages/hod/SetAcademicPeriod.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'

function SetAcademicPeriod() {

  const navigate = useNavigate()

  // Form fields
  const [academicYear, setAcademicYear] = useState('')
  const [semester, setSemester] = useState('')

  // Current active period
  const [currentPeriod, setCurrentPeriod] = useState(null)

  // Fetch current active period when page loads
  useEffect(() => {
    const fetchActivePeriod = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/periods/active')
        const data = await response.json()
        if (response.ok) {
          setCurrentPeriod(data)
        }
      } catch (err) {
        console.error('Error fetching period:', err)
      }
    }
    fetchActivePeriod()
  }, [])

  const handleSave = async () => {

    if (!academicYear || !semester) {
      alert('Please fill in both fields.')
      return
    }

    try {

      const response = await fetch('http://localhost:5000/api/periods/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academicYear, semester })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message)
        return
      }

      alert(data.message)
      setCurrentPeriod({ academic_year: academicYear, semester })
      setAcademicYear('')
      setSemester('')

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
        maxWidth: '800px',
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
          <h1 style={{ margin: 0, fontSize: '20px' }}>
            Set Academic Period
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Set the current active semester for student submissions
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

        {/* Current active period */}
        {currentPeriod && (
          <div style={{
            backgroundColor: '#e6f4ea',
            border: '1px solid #4caf50',
            padding: '15px 20px',
            borderRadius: '8px',
            marginBottom: '25px',
            fontSize: '14px',
            color: '#2e7d32'
          }}>
            ✅ Current Active Period: <strong>{currentPeriod.semester} {currentPeriod.academic_year}</strong>
          </div>
        )}

        {/* Form */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
        }}>

          <h3 style={{
            color: '#8B0000',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '10px',
            marginBottom: '20px'
          }}>
            Set New Academic Period
          </h3>

          {/* Academic Year */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              color: '#002147',
              marginBottom: '6px'
            }}>
              Academic Year:
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}>
              <option value="">-- Select Year --</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          {/* Semester */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              color: '#002147',
              marginBottom: '6px'
            }}>
              Semester:
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}>
              <option value="">-- Select Semester --</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
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
            Set Active Period
          </button>

        </div>
      </div>
    </div>
  )
}

export default SetAcademicPeriod