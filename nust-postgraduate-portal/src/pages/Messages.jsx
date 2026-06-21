// src/pages/Messages.jsx
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

function Messages() {
  const { user } = useAuth()
  const [tab, setTab] = useState('inbox')
  const [inbox, setInbox] = useState([])
  const [sent, setSent] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)

  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const fetchAll = async () => {
    try {
      const [iRes, sRes, stRes] = await Promise.all([
        fetch('http://localhost:5000/api/messages/inbox/' + user.id),
        fetch('http://localhost:5000/api/messages/sent/' + user.id),
    fetch('http://localhost:5000/api/messages/recipients')
      ])
      setInbox(await iRes.json())
      setSent(await sRes.json())
      const staffData = await stRes.json()
      setStaff(Array.isArray(staffData) ? staffData.filter(s => s.id !== user.id) : [])
    } catch (err) {
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [user.id])

  const openMessage = async (m) => {
    setOpenId(openId === m.id ? null : m.id)
    if (!m.is_read) {
      try {
        await fetch('http://localhost:5000/api/messages/read/' + m.id, { method: 'PUT' })
        setInbox(prev => prev.map(x => x.id === m.id ? Object.assign({}, x, { is_read: 1 }) : x))
      } catch (err) {
        console.error('Mark read error:', err)
      }
    }
  }

  const handleSend = async () => {
    if (!recipient) { alert('Please choose a recipient.'); return }
    if (!body.trim()) { alert('Please write a message.'); return }
    setSending(true)
    try {
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.id, recipientId: recipient, subject, body })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      setRecipient(''); setSubject(''); setBody('')
      setTab('sent')
      fetchAll()
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSending(false)
    }
  }

  const roleLabel = (r) => (r || '').replace('_', ' ')
  const unread = inbox.filter(m => !m.is_read).length

  const tabBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      style={{
        backgroundColor: tab === key ? '#002147' : 'white',
        color: tab === key ? 'white' : '#002147',
        border: '1px solid #002147', padding: '8px 18px',
        borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
        cursor: 'pointer', marginRight: '10px'
      }}>
      {label}
    </button>
  )

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>

        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Messages</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Send and receive messages with other staff — no email needed
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          {tabBtn('inbox', 'Inbox' + (unread > 0 ? ' (' + unread + ')' : ''))}
          {tabBtn('sent', 'Sent')}
          {tabBtn('compose', 'Compose')}
        </div>

        {loading && <LoadingSpinner message="Loading messages..." />}

        {!loading && tab === 'inbox' && (
          <div>
            {inbox.length === 0 && (
              <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #eeeeee', padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                Your inbox is empty.
              </div>
            )}
            {inbox.map(m => (
              <div key={m.id} onClick={() => openMessage(m)}
                style={{
                  backgroundColor: m.is_read ? 'white' : '#f0f7ff',
                  border: '1px solid ' + (m.is_read ? '#dddddd' : '#002147'),
                  borderRadius: '8px', padding: '15px 18px', marginBottom: '10px',
                  cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#002147', fontSize: '14px' }}>
                    {!m.is_read && <span style={{ color: '#8B0000' }}>● </span>}
                    {m.subject}
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                  From: {m.sender_name} ({roleLabel(m.sender_role)})
                </p>
                {openId === m.id && (
                  <p style={{ fontSize: '13px', color: '#333', margin: '12px 0 0 0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {m.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'sent' && (
          <div>
            {sent.length === 0 && (
              <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #eeeeee', padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                You haven't sent any messages yet.
              </div>
            )}
            {sent.map(m => (
              <div key={m.id} onClick={() => setOpenId(openId === m.id ? null : m.id)}
                style={{
                  backgroundColor: 'white', border: '1px solid #dddddd',
                  borderRadius: '8px', padding: '15px 18px', marginBottom: '10px',
                  cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#002147', fontSize: '14px' }}>{m.subject}</span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                  To: {m.recipient_name} ({roleLabel(m.recipient_role)})
                </p>
                {openId === m.id && (
                  <p style={{ fontSize: '13px', color: '#333', margin: '12px 0 0 0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {m.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'compose' && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.07)' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px', fontSize: '13px' }}>To</label>
            <select value={recipient} onChange={(e) => setRecipient(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px', backgroundColor: 'white', marginBottom: '15px' }}>
              <option value="">-- Choose a colleague --</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({roleLabel(s.role)})</option>
              ))}
            </select>

            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px', fontSize: '13px' }}>Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject"
              style={{ width: '100%', padding: '10px', border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px', marginBottom: '15px' }} />

            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px', fontSize: '13px' }}>Message</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." rows={6}
              style={{ width: '100%', padding: '10px', border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px', resize: 'vertical', marginBottom: '15px' }} />

            <button onClick={handleSend} disabled={sending}
              style={{ backgroundColor: sending ? '#cccccc' : '#002147', color: 'white', border: 'none', padding: '12px 22px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: sending ? 'not-allowed' : 'pointer' }}>
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Messages