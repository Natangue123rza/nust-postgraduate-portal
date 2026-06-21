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

// Friendly, role-specific explanation of why access is limited
const noticeByRole = {
  undergraduate: 'This portal is for postgraduate Masters and PhD research. As an undergraduate, you do not have a research project here yet. You are welcome to follow what is happening in postgraduate research below.',
  junior_lecturer: 'This portal is for postgraduate research and supervision. You are not currently assigned any postgraduate students, so you have limited access. If you take on a postgraduate supervision, your supervisor tools will appear here automatically.',
  admin_staff: 'This portal is for postgraduate research. Your account does not currently have a postgraduate administrative role, so you have limited access.'
}

const roleLabels = {
  undergraduate: 'Undergraduate Student',
  junior_lecturer: 'Junior Lecturer',
  admin_staff: 'Administrative Staff'
}

function DefaultDashboard() {

  const { user } = useAuth()
  const [presentations, setPresentations] = useState([])
  const [subscribed, setSubscribed] = useState(false)

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

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/subscription/' + user.id)
        const data = await res.json()
        setSubscribed(!!data.subscribed)
      } catch (err) {
        console.error('Error fetching subscription:', err)
      }
    }
    fetchSub()
  }, [user.id])

  const toggleSubscription = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/subscription/' + user.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscribed: !subscribed })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      setSubscribed(!subscribed)
      alert(data.message)
    } catch (err) {
      alert('Could not connect to server.')
    }
  }

  // Profile bits
  const firstName = (user.name || '').split(' ')[0]
  const initials = (user.name || '').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()
  const roleLabel = roleLabels[user.role] || user.role.replace('_', ' ')
  const idPart = (user.email || '').split('@')[0]
  const isStudentNumber = /^[0-9]+$/.test(idPart)
  const notice = noticeByRole[user.role] || 'You are signed in, but your account does not have postgraduate research access. You can follow postgraduate news and events below.'

  return (
    <div>
      <Navbar />

      <div style={{ padding: '30px', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Slim branding bar */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '18px 30px', borderRadius: '8px 8px 0 0'
        }}>
          <p style={{ margin: 0, fontSize: '13px', letterSpacing: '0.5px', color: '#aaccff' }}>
            NAMIBIA UNIVERSITY OF SCIENCE AND TECHNOLOGY
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: 'bold' }}>
            Postgraduate Research Portal
          </p>
        </div>

        {/* Profile card (kiosk style) */}
        <div style={{
          backgroundColor: 'white', border: '1px solid #dddddd', borderTop: 'none',
          borderRadius: '0 0 8px 8px', padding: '24px 30px', marginBottom: '22px',
          display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: '#002147', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '22px', flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#002147' }}>
              Dear {firstName},
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              <span style={{
                backgroundColor: '#f0f0f0', color: '#555555',
                padding: '3px 12px', borderRadius: '12px', fontSize: '12px'
              }}>
                {roleLabel}
              </span>
              <span style={{ fontSize: '13px', color: '#666666' }}>
                {isStudentNumber ? 'Student number: ' + idPart : user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Limited-access notice */}
        <div style={{
          backgroundColor: '#fff8e1', border: '1px solid #ffca28',
          borderRadius: '8px', padding: '18px 22px', marginBottom: '22px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#7a5c00', fontSize: '14px' }}>
            Your access is limited
          </p>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#6b5300', lineHeight: 1.5 }}>
            {notice}
          </p>
        </div>

        {/* Interested in postgraduate study? Follow card */}
        <div style={{
          backgroundColor: subscribed ? '#e6f4ea' : '#f0f7ff',
          border: '1px solid ' + (subscribed ? '#4caf50' : '#002147'),
          borderRadius: '8px', padding: '18px 22px', marginBottom: '30px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ maxWidth: '620px' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: subscribed ? '#2e7d32' : '#002147', fontSize: '15px' }}>
              {subscribed ? '🎓 You are following postgraduate news & events' : '🎓 Interested in postgraduate study?'}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555555', lineHeight: 1.5 }}>
              {subscribed
                ? 'You will be notified whenever new defences and postgraduate events are scheduled.'
                : 'Thinking about a Masters or PhD at NUST? Follow postgraduate news, defences and announcements and we will keep you posted.'}
            </p>
          </div>
          <button onClick={toggleSubscription} style={{
            backgroundColor: subscribed ? 'transparent' : '#002147',
            color: subscribed ? '#8B0000' : 'white',
            border: subscribed ? '1px solid #8B0000' : 'none',
            padding: '10px 20px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            {subscribed ? 'Unfollow' : 'Follow'}
          </button>
        </div>

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
          👤 You are signed in as <strong>{roleLabel}</strong>. If you supervise or are enrolled in a
          postgraduate programme and don't see your tools, please contact your faculty office.
        </div>

      </div>
    </div>
  )
}

export default DefaultDashboard