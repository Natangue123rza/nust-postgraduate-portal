// src/pages/supervisor/StudentList.jsx

import Navbar from "../../components/Navbar"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

// Colors for the status badge, by tone
const badgeColors = {
  warn: { bg: '#fff3e0', text: '#e65100', border: '#ff9800' },
  info: { bg: '#e3f2fd', text: '#0d47a1', border: '#1976d2' },
  neutral: { bg: '#f0f0f0', text: '#555555', border: '#cccccc' }
}

// Work out a student's current stage from their latest proposal + thesis
function getStage(proposal, thesis) {
  if (!proposal) {
    return { step: 0, label: 'Awaiting proposal', tone: 'neutral' }
  }
  if (thesis) {
    if (thesis.supervisor_status === 'approved') {
      return { step: 5, label: 'In examination', tone: 'info' }
    }
    if (thesis.supervisor_status === 'rejected') {
      return { step: 4, label: 'Thesis revision requested', tone: 'neutral' }
    }
    return { step: 4, label: 'Thesis awaiting your review', tone: 'warn' }
  }
  if (proposal.supervisor_status === 'rejected') {
    return { step: 1, label: 'Proposal revision requested', tone: 'neutral' }
  }
  if (proposal.supervisor_status !== 'approved') {
    return { step: 1, label: 'Proposal awaiting your review', tone: 'warn' }
  }
  if (proposal.hdc_decision !== 'approved') {
    return { step: 2, label: 'Awaiting HDC decision', tone: 'neutral' }
  }
  if (proposal.ethics_status !== 'Submitted' && proposal.ethics_status !== 'Approved') {
    return { step: 3, label: 'Awaiting ethics clearance', tone: 'neutral' }
  }
  return { step: 4, label: 'Ethics submitted', tone: 'info' }
}

// The seven milestones of the research lifecycle
const STEPS = ['Proposal', 'Review', 'HDC', 'Ethics', 'Thesis', 'Examiners', 'Result']

// A horizontal progress trail. "current" = the step the student is at now.
function ProgressTrail({ current }) {
  const greenWidth = (86 * (current / (STEPS.length - 1))).toFixed(2)
  return (
    <div style={{ position: 'relative', paddingTop: '4px', marginTop: '14px' }}>
      {/* Gray base line */}
      <div style={{
        position: 'absolute', top: '14px', left: '7%', right: '7%',
        height: '2px', backgroundColor: '#e0e0e0'
      }}></div>
      {/* Green completed line */}
      <div style={{
        position: 'absolute', top: '14px', left: '7%',
        width: greenWidth + '%', height: '2px', backgroundColor: '#2e7d32'
      }}></div>
      {/* The circles + labels */}
      <div style={{ display: 'flex' }}>
        {STEPS.map((label, i) => {
          const done = i < current
          const active = i === current
          const circleStyle = done
            ? { backgroundColor: '#e8f5e9', border: '1.5px solid #2e7d32', color: '#2e7d32' }
            : active
            ? { backgroundColor: '#e3f2fd', border: '2px solid #1976d2', color: '#1976d2' }
            : { backgroundColor: 'white', border: '1.5px solid #cccccc', color: '#bbbbbb' }
          return (
            <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', fontSize: '13px', fontWeight: 'bold',
                ...circleStyle
              }}>
                {done ? '✓' : active
                  ? <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1976d2', display: 'block' }}></span>
                  : ''}
              </div>
              <div style={{
                fontSize: '11px', marginTop: '5px',
                color: done ? '#666666' : active ? '#1976d2' : '#999999',
                fontWeight: active ? 'bold' : 'normal'
              }}>
                {label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


function StudentList() {

    const navigate = useNavigate()

    const { user } = useAuth()
const [students, setStudents] = useState([])
const [search, setSearch] = useState('')
const [sortBy, setSortBy] = useState('name')
const [stages, setStages] = useState({})
const [details, setDetails] = useState({})
const [expandedId, setExpandedId] = useState(null)

useEffect(() => {
  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/supervisor-students/${user.id}`
      )
    const data = await response.json()
      setStudents(data)

      // For each student, fetch their latest proposal + thesis to work out their stage
     const stageMap = {}
      const detailsMap = {}
      for (const student of data) {
        const [propRes, thesisRes] = await Promise.all([
          fetch('http://localhost:5000/api/proposals/student/' + student.id),
          fetch('http://localhost:5000/api/theses/student/' + student.id)
        ])
        const proposals = await propRes.json()
        const theses = await thesisRes.json()
        stageMap[student.id] = getStage(proposals[0], theses[0])
        detailsMap[student.id] = { proposal: proposals[0], thesis: theses[0] }
      }
      setStages(stageMap)
      setDetails(detailsMap)
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }
 fetchStudents()
}, [user.id])

// Filter by the search text, then sort the result
const visibleStudents = students
  .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => {
    if (sortBy === 'degree') return a.degree.localeCompare(b.degree)
    return a.name.localeCompare(b.name)
  })

    return (
        <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '1280px',
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
          <h1 style={{ margin: 0, fontSize: '22px' }}>
            My Students
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Assigned postgraduate students
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/supervisor')}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #002147',
            color: '#002147',
            padding: '8px 16px',
            borderRadius: '4px',
            marginBottom: '25px',
            fontSize: '13px'
          }}>
          ← Back to Dashboard
        </button>

        {/* Section title */}
        <h2 style={{
          color: '#002147',
          marginBottom: '20px',
          fontSize: '18px',
          borderLeft: '4px solid #8B0000',
          paddingLeft: '10px'
        }}>
       Registered Students
        </h2>

        {/* Search + sort controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: '200px', padding: '10px 14px',
              border: '1px solid #dddddd', borderRadius: '6px', fontSize: '14px'
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 14px', border: '1px solid #dddddd',
              borderRadius: '6px', fontSize: '14px', backgroundColor: 'white'
            }}
          >
            <option value="name">Sort by name (A–Z)</option>
            <option value="degree">Sort by degree</option>
          </select>
        </div>

        {/* No students assigned yet */}
{students.length === 0 && (
  <div style={{
    backgroundColor: '#fff3e0',
    border: '1px solid #ff9800',
    padding: '25px',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#e65100',
    fontSize: '14px',
    marginBottom: '20px'
  }}>
    ⏳ <strong>No students assigned yet.</strong>

    <p style={{
      marginTop: '8px',
      fontSize: '13px'
    }}>
      The HOD will assign students to you. You will be notified when a student is assigned.
    </p>
  </div>
)}

      {/* Student cards */}
     {visibleStudents.map(student => {
          const initials = student.name.split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()
          const stage = stages[student.id]
          const detail = details[student.id]
          const isOpen = expandedId === student.id
          return (
            <div
              key={student.id}
              onClick={() => setExpandedId(isOpen ? null : student.id)}
              style={{
                backgroundColor: 'white',
                border: isOpen ? '1px solid #002147' : '1px solid #eeeeee',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>

                {/* Avatar with initials */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  backgroundColor: '#002147', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '14px', flexShrink: 0
                }}>
                  {initials}
                </div>

                {/* Name + email */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 'bold', color: '#002147', margin: 0, fontSize: '15px' }}>
                    {student.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666666', margin: '2px 0 0 0' }}>
                    {student.email}
                  </p>
                </div>

                {/* Spacer pushes the badges to the right */}
                <div style={{ flex: 1 }}></div>

                {/* Degree pill */}
                <span style={{
                  backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                  color: 'white', padding: '3px 10px',
                  borderRadius: '12px', fontSize: '11px'
                }}>
                  {student.degree}
                </span>

                {/* Status badge */}
                {stage && (
                  <span style={{
                    backgroundColor: badgeColors[stage.tone].bg,
                    color: badgeColors[stage.tone].text,
                    border: '1px solid ' + badgeColors[stage.tone].border,
                    padding: '3px 10px', borderRadius: '12px',
                    fontSize: '11px', whiteSpace: 'nowrap'
                  }}>
               {stage.label}
                  </span>
                )}

                {/* Expand chevron */}
                <span style={{
                  color: '#999999', fontSize: '12px',
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s'
                }}>
                  ▼
                </span>

              </div>

              {/* Progress trail */}
              {stage && <ProgressTrail current={stage.step} />}

              {/* Expanded details */}
              {isOpen && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #eeeeee', paddingTop: '14px' }}>
                  {detail && (detail.thesis || detail.proposal) ? (
                    <div>
                      <p style={{ fontSize: '11px', color: '#888888', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
                        CURRENT SUBMISSION
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#002147', margin: '0 0 8px 0' }}>
                        {(detail.thesis || detail.proposal).title}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#666666', marginBottom: '10px' }}>
                        <span>Version {(detail.thesis || detail.proposal).version || 1}</span>
                        <span>Submitted {new Date((detail.thesis || detail.proposal).submitted_at).toLocaleDateString()}</span>
                      </div>
                      {(detail.thesis || detail.proposal).supervisor_comments && (
                        <p style={{ fontSize: '13px', color: '#555555', fontStyle: 'italic', marginBottom: '12px' }}>
                          Your last comment: "{(detail.thesis || detail.proposal).supervisor_comments}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#888888', marginBottom: '12px' }}>
                      This student hasn't submitted anything yet.
                    </p>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/supervisor/review') }}
                    style={{
                      backgroundColor: '#002147', color: 'white', border: 'none',
                      padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
                    }}>
                    Review submission →
                  </button>
                </div>
              )}

            </div>
          )
        })}

        {/* No match message */}
        {students.length > 0 && visibleStudents.length === 0 && (
          <div style={{
            backgroundColor: 'white', borderRadius: '8px',
            padding: '24px', textAlign: 'center',
            color: '#999999', fontSize: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}>
            No students match your search.
          </div>
        )}
      </div>
    </div>
    )

}

export default StudentList
