// src/pages/student/StudentDashboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function StudentDashboard() {

  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentPeriod, setCurrentPeriod] = useState(null)
  const [supervisionTeam, setSupervisionTeam] = useState(null)

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

  // Fetch current semester
useEffect(() => {
  const fetchPeriod = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/periods/detect')
      const data = await res.json()
      setCurrentPeriod(data)
    } catch (err) {
      console.error('Error fetching period:', err)
    }
  }
  fetchPeriod()
}, [])

useEffect(() => {
  const fetchTeam = async () => {
    try {
      const res = await fetch(
        'http://localhost:5000/api/auth/my-supervisors/' + user.id
      )
      setSupervisionTeam(await res.json())
    } catch (err) {
      console.error('Error fetching supervision team:', err)
    }
  }
  fetchTeam()
}, [user.id])

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
           {user.programme_name || 'Namibia University of Science and Technology'} - {user.degree} Student
          </p>
        </div>

        {currentPeriod && (
  <div style={{
    backgroundColor: '#f0f7ff',
    border: '1px solid #002147',
    padding: '10px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px'
  }}>
    <span style={{ color: '#002147' }}>
      📅 <strong>{currentPeriod.semester} — {currentPeriod.academic_year}</strong>
    </span>
    <span style={{ color: '#666' }}>
      Ends: {currentPeriod.end_date}
    </span>
  </div>
)}

{supervisionTeam && supervisionTeam.supervisor_name && (
  <div style={{
    backgroundColor: 'white',
    border: '1px solid #dddddd',
    borderLeft: '4px solid #002147',
    padding: '20px 25px',
    borderRadius: '8px',
    marginBottom: '25px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
  }}>
    <h3 style={{ color: '#002147', marginBottom: '16px', fontSize: '15px' }}>
      👥 Your Supervision Team
    </h3>

    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>

      {/* Main Supervisor */}
      <div style={{
        flex: 1, minWidth: '240px', display: 'flex', gap: '12px',
        alignItems: 'flex-start', backgroundColor: '#f8f9fb',
        borderRadius: '8px', padding: '14px 16px'
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          backgroundColor: '#002147', color: 'white', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: '15px'
        }}>
          {supervisionTeam.supervisor_name.split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '11px', color: '#8B0000', fontWeight: 'bold', margin: '0 0 2px 0', letterSpacing: '0.5px' }}>
            MAIN SUPERVISOR
          </p>
          <p style={{ fontSize: '14px', color: '#002147', fontWeight: 'bold', margin: '0 0 4px 0' }}>
            {supervisionTeam.supervisor_name}
          </p>
          {supervisionTeam.supervisor_email && (
            <a href={'mailto:' + supervisionTeam.supervisor_email}
               style={{ fontSize: '12px', color: '#1976d2', textDecoration: 'none', display: 'block', wordBreak: 'break-all' }}>
              ✉️ {supervisionTeam.supervisor_email}
            </a>
          )}
          {supervisionTeam.supervisor_department && (
            <p style={{ fontSize: '12px', color: '#666666', margin: '4px 0 0 0' }}>
              🏛️ {supervisionTeam.supervisor_department}
            </p>
          )}
        </div>
      </div>

      {/* Co-Supervisor */}
      {supervisionTeam.co_supervisor_name && (
        <div style={{
          flex: 1, minWidth: '240px', display: 'flex', gap: '12px',
          alignItems: 'flex-start', backgroundColor: '#f8f9fb',
          borderRadius: '8px', padding: '14px 16px'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            backgroundColor: '#8B0000', color: 'white', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '15px'
          }}>
            {supervisionTeam.co_supervisor_name.split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '11px', color: '#8B0000', fontWeight: 'bold', margin: '0 0 2px 0', letterSpacing: '0.5px' }}>
              CO-SUPERVISOR
            </p>
            <p style={{ fontSize: '14px', color: '#002147', fontWeight: 'bold', margin: '0 0 4px 0' }}>
              {supervisionTeam.co_supervisor_name}
            </p>
            {supervisionTeam.co_supervisor_email && (
              <a href={'mailto:' + supervisionTeam.co_supervisor_email}
                 style={{ fontSize: '12px', color: '#1976d2', textDecoration: 'none', display: 'block', wordBreak: 'break-all' }}>
                ✉️ {supervisionTeam.co_supervisor_email}
              </a>
            )}
            {supervisionTeam.co_supervisor_department && (
              <p style={{ fontSize: '12px', color: '#666666', margin: '4px 0 0 0' }}>
                🏛️ {supervisionTeam.co_supervisor_department}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  </div>
)}

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