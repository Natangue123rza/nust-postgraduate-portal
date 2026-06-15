// src/pages/DefaultDashboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

// Announcements are still sample data; in production they would come from the database
const announcements = [
  {
    title: 'Call for Semester 2 Proposal Submissions',
    date: '12 June 2026',
    body: 'Postgraduate students intending to defend in Semester 2 should submit their proposals to their supervisors by 31 July 2026.'
  },
  {
    title: 'Postgraduate Research Symposium 2026',
    date: '5 June 2026',
    body: 'The annual Faculty research symposium will be held in August. Abstract submissions are now open to all Masters and PhD candidates.'
  },
  {
    title: 'Updated Ethics Clearance Guidelines',
    date: '28 May 2026',
    body: 'The Faculty Postgraduate Committee has released updated ethics clearance forms. Please use the latest version for all new applications.'
  }
]

function DefaultDashboard() {

  const { user } = useAuth()
  const [presentations, setPresentations] = useState([])

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/presentations/upcoming')
        setPresentations(await res.json())
      } catch (err) {
        console.error('Error fetching presentations:', err)
      }
    }
    fetchUpcoming()
  }, [])

  return (
    <div>
      <Navbar />

      <div style={{ padding: '30px', maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '25px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>Welcome, {user.name}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Namibia University of Science and Technology — Postgraduate Research
          </p>
        </div>

        <p style={{ color: '#555', fontSize: '14px', marginBottom: '25px', lineHeight: 1.5 }}>
          Here's what's happening in postgraduate research at NUST — upcoming thesis
          defences and faculty announcements.
        </p>

        <h2 style={{
          color: '#002147', fontSize: '18px', marginBottom: '15px',
          borderLeft: '4px solid #8B0000', paddingLeft: '10px'
        }}>
          🎓 Upcoming Presentations & Defences
        </h2>

        {presentations.length === 0 ? (
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '35px' }}>
            No upcoming defences are scheduled at the moment.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '15px', marginBottom: '35px'
          }}>
            {presentations.map(p => (
              <div key={p.id} style={{
                backgroundColor: 'white', border: '1px solid #dddddd',
                borderTop: '4px solid ' + (p.degree === 'PhD' ? '#8B0000' : '#002147'),
                borderRadius: '8px', padding: '18px 20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#002147', fontSize: '14px' }}>{p.student_name}</span>
                  <span style={{
                    backgroundColor: p.degree === 'PhD' ? '#8B0000' : '#002147', color: 'white',
                    padding: '2px 10px', borderRadius: '12px', fontSize: '11px'
                  }}>
                    {p.degree}
                  </span>
                </div>
                {p.title && (
                  <p style={{ fontSize: '13px', color: '#333', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                    {p.title}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                  📅 {p.defence_date ? new Date(p.defence_date).toLocaleDateString() : 'TBC'}
                  {p.defence_time ? ' at ' + p.defence_time : ''}
                </p>
                {p.venue && (
                  <p style={{ fontSize: '12px', color: '#666', margin: '3px 0 0 0' }}>
                    📍 {p.venue}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <h2 style={{
          color: '#002147', fontSize: '18px', marginBottom: '15px',
          borderLeft: '4px solid #8B0000', paddingLeft: '10px'
        }}>
          📢 Announcements
        </h2>

        <div style={{ marginBottom: '30px' }}>
          {announcements.map((a, i) => (
            <div key={i} style={{
              backgroundColor: 'white', border: '1px solid #eeeeee',
              borderRadius: '8px', padding: '16px 20px', marginBottom: '12px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: '#002147', fontSize: '15px' }}>{a.title}</span>
                <span style={{ fontSize: '12px', color: '#999' }}>{a.date}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.5 }}>{a.body}</p>
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: '#f0f7ff', border: '1px solid #002147',
          padding: '15px 20px', borderRadius: '8px', fontSize: '13px', color: '#002147'
        }}>
          ℹ️ You're signed in as <strong>{user.role.replace('_', ' ')}</strong>. This page shows
          postgraduate news and events. If you supervise or are enrolled in a postgraduate programme
          and don't see your tools, please contact your faculty office.
        </div>

      </div>
    </div>
  )
}

export default DefaultDashboard