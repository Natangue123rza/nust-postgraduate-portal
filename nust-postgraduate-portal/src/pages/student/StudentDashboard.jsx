// src/pages/student/StudentDashboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function StudentDashboard() {

  const { user } = useAuth()
  const navigate = useNavigate()

  // Deadlines fetched from database
  const [deadlines, setDeadlines] = useState({
    proposal: '',
    progressReport: '',
    thesis: ''
  })

  // Fetch deadlines from database when page loads
  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/deadlines/all')
        const data = await response.json()
        if (response.ok) {
          setDeadlines(data)
        }
      } catch (err) {
        console.error('Error fetching deadlines:', err)
      }
    }
    fetchDeadlines()
  }, [])

  // Calculate time remaining for a deadline
  const getTimeRemaining = (deadlineDate) => {
    if (!deadlineDate) return null

    const now = new Date()
    const deadline = new Date(deadlineDate)
    const difference = deadline - now

    if (difference <= 0) {
      return { expired: true, text: '❌ Deadline passed' }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return {
        expired: false,
        urgent: days <= 3,
        text: `⏰ ${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''} left`
      }
    }

    return {
      expired: false,
      urgent: true,
      text: `⚠️ Less than ${hours + 1} hour${hours > 1 ? 's' : ''} left`
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

        {/* Welcome banner */}
        <div style={{
          backgroundColor: '#002147',
          color: 'white',
          padding: '25px 30px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>
            Welcome, {user.name}
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            {user.degree} Student — Faculty of Computing and Informatics
          </p>
        </div>

        {/* Section title */}
        <h2 style={{
          color: '#002147',
          marginBottom: '20px',
          fontSize: '18px',
          borderLeft: '4px solid #8B0000',
          paddingLeft: '10px'
        }}>
          Student Actions
        </h2>

        {/* Cards container */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>

          {/* Progress Report Card */}
          <div
            onClick={() => navigate('/student/progress-report')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderTop: '4px solid #002147',
              padding: '25px',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '220px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>
              📋 Progress Report
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Submit your semester progress report to your supervisor
            </p>
          </div>

          {/* Proposal Card */}
          <div
            onClick={() => navigate('/student/proposal')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderTop: '4px solid #002147',
              padding: '25px',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '220px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>
              📄 Research Proposal
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Submit your research proposal for HDC review
            </p>
          </div>

          {/* Thesis Card */}
          <div
            onClick={() => navigate('/student/thesis')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dddddd',
              borderTop: '4px solid #002147',
              padding: '25px',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '220px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
            <h3 style={{ color: '#002147', marginBottom: '10px' }}>
              🎓 Thesis Submission
            </h3>
            <p style={{ fontSize: '13px', color: '#666666' }}>
              Submit your final thesis for examination
            </p>
          </div>

          {/* Results Card */}
<div
  onClick={() => navigate('/student/results')}
  style={{
    backgroundColor: 'white',
    border: '1px solid #dddddd',
    borderTop: '4px solid #8B0000',
    padding: '25px',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '220px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
  }}>
  <h3 style={{ color: '#8B0000', marginBottom: '10px' }}>
    📊 My Results
  </h3>
  <p style={{ fontSize: '13px', color: '#666666' }}>
    View your submission statuses and examination results
  </p>
</div>

        </div>

        {/* Deadlines Section - outside cards container */}
        {(deadlines.proposal || deadlines.progressReport || deadlines.thesis) && (
          <div style={{ marginTop: '30px' }}>

            <h2 style={{
              color: '#002147',
              marginBottom: '20px',
              fontSize: '18px',
              borderLeft: '4px solid #8B0000',
              paddingLeft: '10px'
            }}>
              ⏰ Submission Deadlines
            </h2>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
              overflow: 'hidden'
            }}>

              {/* Proposal deadline */}
              {deadlines.proposal && (
                <div style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '3px' }}>
                      📄 Research Proposal
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Due: {new Date(deadlines.proposal).toLocaleString()}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: getTimeRemaining(deadlines.proposal)?.expired ? '#fce4e4' :
                      getTimeRemaining(deadlines.proposal)?.urgent ? '#fff3e0' : '#e6f4ea',
                    color: getTimeRemaining(deadlines.proposal)?.expired ? '#c62828' :
                      getTimeRemaining(deadlines.proposal)?.urgent ? '#e65100' : '#2e7d32',
                    padding: '5px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getTimeRemaining(deadlines.proposal)?.text}
                  </span>
                </div>
              )}

              {/* Progress report deadline */}
              {deadlines.progressReport && (
                <div style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '3px' }}>
                      📋 Progress Report
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Due: {new Date(deadlines.progressReport).toLocaleString()}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: getTimeRemaining(deadlines.progressReport)?.expired ? '#fce4e4' :
                      getTimeRemaining(deadlines.progressReport)?.urgent ? '#fff3e0' : '#e6f4ea',
                    color: getTimeRemaining(deadlines.progressReport)?.expired ? '#c62828' :
                      getTimeRemaining(deadlines.progressReport)?.urgent ? '#e65100' : '#2e7d32',
                    padding: '5px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getTimeRemaining(deadlines.progressReport)?.text}
                  </span>
                </div>
              )}

              {/* Thesis deadline */}
              {deadlines.thesis && (
                <div style={{
                  padding: '15px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '3px' }}>
                      🎓 Thesis Submission
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Due: {new Date(deadlines.thesis).toLocaleString()}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: getTimeRemaining(deadlines.thesis)?.expired ? '#fce4e4' :
                      getTimeRemaining(deadlines.thesis)?.urgent ? '#fff3e0' : '#e6f4ea',
                    color: getTimeRemaining(deadlines.thesis)?.expired ? '#c62828' :
                      getTimeRemaining(deadlines.thesis)?.urgent ? '#e65100' : '#2e7d32',
                    padding: '5px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getTimeRemaining(deadlines.thesis)?.text}
                  </span>
                </div>
              )}


            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default StudentDashboard