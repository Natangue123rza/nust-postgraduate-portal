// src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

// Sidebar links per role
const navLinks = {
  student: [
    { label: 'Dashboard', path: '/student' },
    { label: 'My Proposal', path: '/student/proposal' },
    { label: 'Progress Reports', path: '/student/progress-report' },
    { label: 'Thesis', path: '/student/thesis' },
    { label: 'My Results', path: '/student/results' }
  ],
  coordinator: [
    { label: 'Dashboard', path: '/coordinator' },
    { label: 'Assign Supervisors', path: '/coordinator/assign-supervisor' },
    { label: 'Assign Examiners', path: '/hod/assign-examiners' },
    { label: 'Submissions', path: '/hod/submissions' },
    { label: 'Proposal Decisions', path: '/hod/hdc-decision' },
    { label: 'Deadlines', path: '/hod/deadlines' },
    { label: 'Schedule Defence', path: '/coordinator/schedule-defence' },
    { label: 'Proposal Evaluators', path: '/coordinator/proposal-evaluators' },
    { label: 'Manage Results', path: '/hod/results' }
    
  ],
  supervisor: [
    { label: 'Dashboard', path: '/supervisor' },
    { label: 'My Students', path: '/supervisor/students' },
    { label: 'Review Submissions', path: '/supervisor/review' },
    { label: 'Progress Reports', path: '/supervisor/progress-reports' },
    { label: 'Release Marks', path: '/supervisor/release-results' },
    { label: 'Grade Thesis', path: '/supervisor/grade' }
  ],

 faculty_rep: [
    { label: 'Dashboard', path: '/faculty-rep' },
    { label: 'Assign Coordinators', path: '/faculty-rep/assign-coordinator' },
    { label: 'HDC Results', path: '/faculty-rep/hdc-results' },
    { label: 'Faculty Approvals', path: '/faculty-rep/approvals' }

  ],

  super_admin: [
    { label: 'Dashboard', path: '/superadmin' },
    { label: 'Faculty Representatives', path: '/superadmin/faculty-reps' }
  ],
  
  examiner: [
    { label: 'Dashboard', path: '/examiner' }
  ]
}

function Navbar() {

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Track screen size so the sidebar hides on small screens
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Make room for the fixed sidebar on desktop (only while logged in)
  useEffect(() => {
    if (user && !isMobile) {
      document.body.style.paddingLeft = '230px'
    } else {
      document.body.style.paddingLeft = '0'
    }
    return () => { document.body.style.paddingLeft = '0' }
  }, [user, isMobile])

  // Fetch notifications
  useEffect(() => {
    if (!user) return
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/notifications/' + user.id
        )
        const data = await response.json()
        setNotifications(data)
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleMarkAllRead = async () => {
    try {
      await fetch(
        'http://localhost:5000/api/notifications/read-all/' + user.id,
        { method: 'PUT' }
      )
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }

  const handleMarkRead = async (notificationId) => {
    try {
      await fetch(
        'http://localhost:5000/api/notifications/read/' + notificationId,
        { method: 'PUT' }
      )
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const links = (user && navLinks[user.role]) || []

  return (
    <div>

     
    {/* Mobile backdrop */}
      {user && isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1200
          }}
        />
      )}

      {/* Sidebar - desktop persistent, mobile drawer */}
      {user && (!isMobile || sidebarOpen) && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '230px', height: '100vh',
          backgroundColor: '#002147', color: 'white',
          paddingTop: '20px', overflowY: 'auto', zIndex: 1300,
          boxShadow: '2px 0 6px rgba(0,0,0,0.2)'
        }}>
       <div style={{
            padding: '0 20px 20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            marginBottom: '15px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '1px' }}>NUST</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#aaaaaa' }}>
                Postgraduate Portal
              </p>
            </div>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  backgroundColor: 'transparent', border: 'none', color: 'white',
                  fontSize: '22px', cursor: 'pointer', lineHeight: 1
                }}>
                ✕
              </button>
            )}
          </div>

          {links.map(link => {
            const active = location.pathname === link.path
            return (
              <div
                key={link.path}
               onClick={() => { navigate(link.path); setSidebarOpen(false) }}
                style={{
                  padding: '12px 20px', cursor: 'pointer', fontSize: '14px',
                  color: active ? 'white' : '#cfd8e3',
                  backgroundColor: active ? '#8B0000' : 'transparent',
                  borderLeft: active ? '4px solid white' : '4px solid transparent'
                }}>
                {link.label}
              </div>
            )
          })}
        </div>
      )}

      {/* Top bar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 30px', backgroundColor: '#002147', color: 'white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)', position: 'relative'
      }}>
   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                backgroundColor: 'transparent', border: '1px solid white', color: 'white',
                fontSize: '18px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', lineHeight: 1
              }}>
              ☰
            </button>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '1px' }}>
              NUST Postgraduate Portal
            </h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#aaaaaa' }}>
              {user && user.faculty_name ? user.faculty_name : 'Namibia University of Science and Technology'}
            </p>
          </div>
        </div>
      

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px' }}>{user.name}</span>
            <span style={{
              backgroundColor: '#8B0000', padding: '4px 12px', borderRadius: '12px',
              fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              {user.role}
            </span>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  backgroundColor: 'transparent', border: '1px solid white', color: 'white',
                  padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
                  fontSize: '16px', position: 'relative'
                }}>
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    backgroundColor: '#8B0000', color: 'white', borderRadius: '50%',
                    width: '18px', height: '18px', fontSize: '11px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute', right: 0, top: '45px',
                  backgroundColor: 'white', borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)', width: '320px',
                  zIndex: 1000, overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '12px 15px', backgroundColor: '#002147', color: 'white',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      Notifications {unreadCount > 0 ? '(' + unreadCount + ' new)' : ''}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          backgroundColor: 'transparent', border: '1px solid white', color: 'white',
                          padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer'
                        }}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                        No notifications yet
                      </p>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          onClick={() => handleMarkRead(notification.id)}
                          style={{
                            padding: '12px 15px', borderBottom: '1px solid #f0f0f0',
                            backgroundColor: notification.is_read ? 'white' : '#f0f7ff', cursor: 'pointer'
                          }}>
                          <p style={{
                            fontWeight: notification.is_read ? 'normal' : 'bold',
                            color: '#002147', marginBottom: '3px', fontSize: '13px'
                          }}>
                            {notification.title}
                          </p>
                          <p style={{ fontSize: '12px', color: '#666', marginBottom: '3px' }}>
                            {notification.message}
                          </p>
                          <p style={{ fontSize: '11px', color: '#aaa' }}>
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent', color: 'white', border: '1px solid white',
                padding: '6px 14px', borderRadius: '4px', fontSize: '13px',
                fontWeight: 'bold', cursor: 'pointer'
              }}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Navbar