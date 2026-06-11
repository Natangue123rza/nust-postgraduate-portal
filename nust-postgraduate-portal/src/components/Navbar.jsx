// src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Navbar() {

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Notifications state
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length

  // Fetch notifications when page loads
  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/notifications/${user.id}`
        )
        const data = await response.json()
        setNotifications(data)
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }

    fetchNotifications()

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)

  }, [user])

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/read-all/${user.id}`,
        { method: 'PUT' }
      )
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }

  // Mark single notification as read
  const handleMarkRead = async (notificationId) => {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/read/${notificationId}`,
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

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 30px',
      backgroundColor: '#002147',
      color: 'white',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      position: 'relative'
    }}>

      {/* Left side */}
      <div>
        <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '1px' }}>
          NUST Postgraduate Portal
        </h2>
        <p style={{ margin: 0, fontSize: '11px', color: '#aaaaaa' }}>
             {user.faculty_name || 'Namibia University of Science and Technology'}
        </p>
      </div>

      {/* Right side */}
      {user && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>

          {/* User name */}
          <span style={{ fontSize: '14px' }}>{user.name}</span>

          {/* Role badge */}
          <span style={{
            backgroundColor: '#8B0000',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {user.role}
          </span>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid white',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                position: 'relative'
              }}>
              🔔
              {/* Unread count badge */}
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#8B0000',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '45px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                width: '320px',
                zIndex: 1000,
                overflow: 'hidden'
              }}>

                {/* Dropdown header */}
                <div style={{
                  padding: '12px 15px',
                  backgroundColor: '#002147',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid white',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}>
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <p style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#666',
                      fontSize: '13px'
                    }}>
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => handleMarkRead(notification.id)}
                        style={{
                          padding: '12px 15px',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: notification.is_read ? 'white' : '#f0f7ff',
                          cursor: 'pointer'
                        }}>
                        <p style={{
                          fontWeight: notification.is_read ? 'normal' : 'bold',
                          color: '#002147',
                          marginBottom: '3px',
                          fontSize: '13px'
                        }}>
                          {notification.title}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '3px'
                        }}>
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

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
            Logout
          </button>

        </div>
      )}

    </nav>
  )
}

export default Navbar