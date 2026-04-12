// src/pages/hod/ViewSubmissions.jsx
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import fakeUsers from '../../utils/fakeUsers'

function ViewSubmissions() {

  const navigate = useNavigate()

  // Get only students
  const students = fakeUsers.filter(u => u.role === 'student')

  // Track which tab is active
  const [activeTab, setActiveTab] = useState('proposals')

  // Simulated submissions data
  // In real system this comes from database
  const simulatedSubmissions = {
    proposals: [
      {
        id: 1,
        studentName: 'David Student',
        degree: 'Masters',
        title: 'Machine Learning in Healthcare',
        submittedAt: '10/04/2026',
        status: 'Pending HDC Review'
      },
      {
        id: 2,
        studentName: 'Paulina Efriam',
        degree: 'PhD',
        title: 'Blockchain Security in African Financial Systems',
        submittedAt: '11/04/2026',
        status: 'Pending HDC Review'
      }
    ],
    theses: [
      {
        id: 1,
        studentName: 'David Student',
        degree: 'Masters',
        title: 'Machine Learning in Healthcare — Final Thesis',
        submittedAt: '12/04/2026',
        status: 'Awaiting Examiner Assignment'
      }
    ],
    progressReports: [
      {
        id: 1,
        studentName: 'David Student',
        degree: 'Masters',
        semester: 'Semester 1 — 2026',
        submittedAt: '08/04/2026',
        onSchedule: 'yes',
        onBudget: 'yes',
        onTarget: 'no',
        status: 'Reviewed'
      },
      {
        id: 2,
        studentName: 'Paulina Efriam',
        degree: 'PhD',
        semester: 'Semester 1 — 2026',
        submittedAt: '09/04/2026',
        onSchedule: 'yes',
        onBudget: 'no',
        onTarget: 'yes',
        status: 'Pending Review'
      }
    ]
  }

  // Style for tab buttons
  const tabStyle = (tabName) => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: activeTab === tabName ? '3px solid #8B0000' : '3px solid transparent',
    backgroundColor: 'transparent',
    color: activeTab === tabName ? '#002147' : '#666666',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
    fontSize: '14px',
    cursor: 'pointer'
  })

  // Status badge color
  const statusColor = (status) => {
    if (status === 'Reviewed') return { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' }
    if (status === 'Pending HDC Review') return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' }
    if (status === 'Awaiting Examiner Assignment') return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' }
    return { bg: '#f5f5f5', color: '#333', border: '#cccccc' }
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
          <h1 style={{ margin: 0, fontSize: '20px' }}>
            View All Submissions
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Faculty of Computing and Informatics — All student submissions
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

        {/* Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
          overflow: 'hidden'
        }}>

          {/* Tab buttons */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 20px'
          }}>
            <button
              onClick={() => setActiveTab('proposals')}
              style={tabStyle('proposals')}>
              📄 Proposals ({simulatedSubmissions.proposals.length})
            </button>
            <button
              onClick={() => setActiveTab('theses')}
              style={tabStyle('theses')}>
              🎓 Theses ({simulatedSubmissions.theses.length})
            </button>
            <button
              onClick={() => setActiveTab('progressReports')}
              style={tabStyle('progressReports')}>
              📋 Progress Reports ({simulatedSubmissions.progressReports.length})
            </button>
          </div>

          {/* Tab content */}
          <div style={{ padding: '20px' }}>

            {/* Proposals tab */}
            {activeTab === 'proposals' && (
              <div>
                <h3 style={{
                  color: '#002147',
                  marginBottom: '15px',
                  fontSize: '16px',
                  borderLeft: '4px solid #8B0000',
                  paddingLeft: '10px'
                }}>
                  Research Proposals
                </h3>

                {simulatedSubmissions.proposals.map(item => (
                  <div key={item.id} style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    padding: '15px 20px',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '4px' }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '13px', color: '#666' }}>
                        {item.studentName} — {item.degree} | Submitted: {item.submittedAt}
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: statusColor(item.status).bg,
                      color: statusColor(item.status).color,
                      border: `1px solid ${statusColor(item.status).border}`,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Theses tab */}
            {activeTab === 'theses' && (
              <div>
                <h3 style={{
                  color: '#002147',
                  marginBottom: '15px',
                  fontSize: '16px',
                  borderLeft: '4px solid #8B0000',
                  paddingLeft: '10px'
                }}>
                  Thesis Submissions
                </h3>

                {simulatedSubmissions.theses.map(item => (
                  <div key={item.id} style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    padding: '15px 20px',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '4px' }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '13px', color: '#666' }}>
                        {item.studentName} — {item.degree} | Submitted: {item.submittedAt}
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: statusColor(item.status).bg,
                      color: statusColor(item.status).color,
                      border: `1px solid ${statusColor(item.status).border}`,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Progress Reports tab */}
            {activeTab === 'progressReports' && (
              <div>
                <h3 style={{
                  color: '#002147',
                  marginBottom: '15px',
                  fontSize: '16px',
                  borderLeft: '4px solid #8B0000',
                  paddingLeft: '10px'
                }}>
                  Progress Reports
                </h3>

                {simulatedSubmissions.progressReports.map(item => (
                  <div key={item.id} style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    padding: '15px 20px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '4px' }}>
                          {item.studentName} — {item.degree}
                        </p>
                        <p style={{ fontSize: '13px', color: '#666' }}>
                          {item.semester} | Submitted: {item.submittedAt}
                        </p>
                      </div>
                      <span style={{
                        backgroundColor: statusColor(item.status).bg,
                        color: statusColor(item.status).color,
                        border: `1px solid ${statusColor(item.status).border}`,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {item.status}
                      </span>
                    </div>

                    {/* Status indicators */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'On Schedule', value: item.onSchedule },
                        { label: 'On Budget', value: item.onBudget },
                        { label: 'On Target', value: item.onTarget }
                      ].map(s => (
                        <span key={s.label} style={{
                          backgroundColor: s.value === 'yes' ? '#e6f4ea' : '#fff3e0',
                          color: s.value === 'yes' ? '#2e7d32' : '#e65100',
                          border: `1px solid ${s.value === 'yes' ? '#4caf50' : '#ff9800'}`,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px'
                        }}>
                          {s.label}: {s.value === 'yes' ? '✅' : '⚠️'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewSubmissions