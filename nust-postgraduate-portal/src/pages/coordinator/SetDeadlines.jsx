// src/pages/coordinator/SetDeadlines.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function SetDeadlines() {

  const navigate = useNavigate()
  const { user } = useAuth()

  // Only the progress report has a deadline (submitted each semester).
  // Proposals and theses run for the full duration of the degree.
  const [progressReport, setProgressReport] = useState('')
  const [savedProgressReport, setSavedProgressReport] = useState('')

  // Fetch existing deadline when page loads
  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/deadlines/all')
        const data = await response.json()
        if (response.ok) {
          setSavedProgressReport(data.progressReport || '')
          setProgressReport(data.progressReport || '')
        }
      } catch (err) {
        console.error('Error fetching deadlines:', err)
      }
    }
    fetchDeadlines()
  }, [])

  // Calculate days and hours remaining
  const getTimeRemaining = (deadlineDate) => {
    if (!deadlineDate) return null

    const now = new Date()
    const deadline = new Date(deadlineDate)
    const difference = deadline - now

    if (difference <= 0) {
      return { expired: true, text: '❌ Deadline has passed' }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return {
        expired: false,
        text: '⏰ ' + days + ' day' + (days > 1 ? 's' : '') + ' and ' + hours + ' hour' + (hours > 1 ? 's' : '') + ' remaining',
        urgent: days <= 3
      }
    }

    return {
      expired: false,
      text: '⏰ ' + hours + ' hour' + (hours > 1 ? 's' : '') + ' and ' + minutes + ' minute' + (minutes > 1 ? 's' : '') + ' remaining',
      urgent: true
    }
  }

  const handleSave = async () => {

    if (!progressReport) {
      alert('Please set the progress report deadline.')
      return
    }

    try {

      const response = await fetch('http://localhost:5000/api/deadlines/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal: '',
          progressReport: progressReport,
          thesis: '',
          hodId: user.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message)
        return
      }

      setSavedProgressReport(progressReport)
      alert('Progress report deadline saved successfully!')

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    }

  }

  const deadlineCardStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
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
            Set Progress Report Deadline
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            The date students submit their progress report by, each semester
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

        {/* Explanation */}
        <div style={{
          backgroundColor: '#f0f7ff',
          border: '1px solid #002147',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#002147',
          lineHeight: 1.5
        }}>
          Proposals and theses don't carry a deadline — they run for the full duration of the
          student's degree. The only scheduled deadline is the progress report, which students
          submit each semester.
        </div>

        {/* Progress Report Deadline */}
        <div style={deadlineCardStyle}>
          <h3 style={{
            color: '#8B0000',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            📋 Progress Report Deadline
          </h3>
          <input
            type="datetime-local"
            value={progressReport || ''}
            onChange={(e) => setProgressReport(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cccccc',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '10px'
            }}
          />
          {savedProgressReport && (
            <div style={{
              padding: '10px',
              backgroundColor: getTimeRemaining(savedProgressReport)?.expired ? '#fce4e4' :
                getTimeRemaining(savedProgressReport)?.urgent ? '#fff3e0' : '#e6f4ea',
              borderRadius: '4px',
              fontSize: '13px',
              color: getTimeRemaining(savedProgressReport)?.expired ? '#c62828' :
                getTimeRemaining(savedProgressReport)?.urgent ? '#e65100' : '#2e7d32'
            }}>
              {getTimeRemaining(savedProgressReport)?.text}
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#002147',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '30px',
            cursor: 'pointer'
          }}>
          Save Progress Report Deadline
        </button>

      </div>
    </div>
  )
}

export default SetDeadlines