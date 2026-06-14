// src/pages/hod/ViewSubmissions.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

function ViewSubmissions() {

  const navigate = useNavigate()
  const { user } = useAuth()

  const [students, setStudents] = useState([])
  const [proposals, setProposals] = useState([])
  const [theses, setTheses] = useState([])
  const [progressReports, setProgressReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const studentsRes = await fetch(
          'http://localhost:5000/api/auth/students?departmentId=' + user.department_id
        )
        setStudents(await studentsRes.json())

        const proposalsRes = await fetch(
          'http://localhost:5000/api/proposals/all?departmentId=' + user.department_id
        )
        setProposals(await proposalsRes.json())

        const thesesRes = await fetch(
          'http://localhost:5000/api/theses/all?departmentId=' + user.department_id
        )
        setTheses(await thesesRes.json())

        const reportsRes = await fetch(
          'http://localhost:5000/api/progress/all?departmentId=' + user.department_id
        )
        setProgressReports(await reportsRes.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [user.department_id])

  // ---- helpers -------------------------------------------------------------

  const tones = {
    green: { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' },
    amber: { bg: '#fff3e0', color: '#e65100', border: '#ff9800' },
    red:   { bg: '#fce4e4', color: '#c62828', border: '#ef5350' },
    blue:  { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' },
    gray:  { bg: '#f0f0f0', color: '#666666', border: '#cccccc' }
  }

  // newest proposal / thesis row for a student (handles resubmission versions)
  const latestFor = (list, studentId) => {
    const mine = list.filter(x => x.student_id === studentId)
    if (mine.length === 0) return null
    return mine.reduce((latest, cur) => {
      const lv = latest.version || 0
      const cv = cur.version || 0
      if (cv !== lv) return cv > lv ? cur : latest
      return new Date(cur.submitted_at) > new Date(latest.submitted_at) ? cur : latest
    })
  }

  const reportsFor = (studentId) =>
    progressReports.filter(r => r.student_id === studentId)

  const proposalStage = (p) => {
    if (!p) return { label: 'Proposal: none', tone: 'gray' }
    if (p.status === 'Approved') return { label: 'Proposal: approved', tone: 'green' }
    if (p.status === 'Rejected' || p.status === 'Revision Required') return { label: 'Proposal: rejected', tone: 'red' }
    if (p.status === 'Pending HDC Review') return { label: 'Proposal: with HDC', tone: 'blue' }
    if (p.status === 'Pending Supervisor Review' || p.status === 'Pending') return { label: 'Proposal: with supervisor', tone: 'amber' }
    return { label: 'Proposal: ' + p.status, tone: 'amber' }
  }

  const thesisStage = (t) => {
    if (!t) return { label: 'Thesis: not yet', tone: 'gray' }
    if (t.status === 'Approved' || t.status === 'Result Released') return { label: 'Thesis: complete', tone: 'green' }
    if (t.status === 'Awaiting Examiner Assignment') return { label: 'Thesis: needs examiners', tone: 'blue' }
    return { label: 'Thesis: ' + t.status, tone: 'amber' }
  }

  const progressStage = (reps) => {
    if (reps.length === 0) return { label: 'Progress: none', tone: 'gray' }
    const reviewed = reps.filter(r => r.supervisor_comments).length
    return {
      label: 'Progress: ' + reviewed + '/' + reps.length + ' reviewed',
      tone: reviewed === reps.length ? 'green' : 'amber'
    }
  }

  // filter the roster by the search box
  const visibleStudents = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  )

  // a couple of headline counts for the HOD
  const needHDC = students.filter(s => {
    const p = latestFor(proposals, s.id)
    return p && p.status === 'Pending HDC Review'
  }).length

  const needExaminers = students.filter(s => {
    const t = latestFor(theses, s.id)
    return t && t.status === 'Awaiting Examiner Assignment'
  }).length

  // small reusable status pill
  const pill = (stage, key) => (
    <span key={key} style={{
      backgroundColor: tones[stage.tone].bg,
      color: tones[stage.tone].color,
      border: '1px solid ' + tones[stage.tone].border,
      padding: '3px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap'
    }}>
{stage.label}
    </span>
  )

  const handleEthicsReview = async (proposalId, ethicsStatus) => {
    if (ethicsStatus === 'Resubmit' &&
        !window.confirm('Ask the student to re-upload their ethics clearance?')) return
    try {
      const res = await fetch(
        'http://localhost:5000/api/proposals/ethics-review/' + proposalId,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ethicsStatus })
        }
      )
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      const proposalsRes = await fetch(
        'http://localhost:5000/api/proposals/all?departmentId=' + user.department_id
      )
      setProposals(await proposalsRes.json())
    } catch (err) {
      alert('Could not connect to server.')
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Student Overview</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            {user.faculty_name || 'Namibia University of Science and Technology'}
          </p>
        </div>

        <button
          onClick={() => navigate('/hod')}
          style={{
            backgroundColor: 'transparent', border: '1px solid #002147',
            color: '#002147', padding: '8px 16px', borderRadius: '4px',
            marginBottom: '20px', fontSize: '13px', cursor: 'pointer'
          }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading students..." />}

        {!loading && (
          <div>

            {/* Headline counts */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[
                { label: 'Students', value: students.length, tone: 'blue' },
                { label: 'Proposals awaiting HDC', value: needHDC, tone: needHDC > 0 ? 'amber' : 'gray' },
                { label: 'Theses needing examiners', value: needExaminers, tone: needExaminers > 0 ? 'amber' : 'gray' }
              ].map((c, i) => (
                <div key={i} style={{
                  flex: '1', minWidth: '160px',
                  backgroundColor: 'white', border: '1px solid #eeeeee',
                  borderLeft: '4px solid ' + tones[c.tone].border,
                  borderRadius: '8px', padding: '14px 16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#002147' }}>{c.value}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#666' }}>{c.label}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name..."
              style={{
                width: '100%', padding: '10px 14px', marginBottom: '20px',
                border: '1px solid #cccccc', borderRadius: '6px', fontSize: '14px'
              }}
            />

            {/* Empty states */}
            {students.length === 0 && (
              <div style={{
                backgroundColor: '#fff3e0', border: '1px solid #ff9800',
                padding: '20px', borderRadius: '8px', color: '#e65100', fontSize: '14px'
              }}>
                ⏳ No students in your department yet.
              </div>
            )}

            {students.length > 0 && visibleStudents.length === 0 && (
              <p style={{ color: '#666', fontSize: '14px' }}>No students match that search.</p>
            )}

            {/* Student rows */}
            {visibleStudents.map(student => {
              const prop = latestFor(proposals, student.id)
              const thes = latestFor(theses, student.id)
              const reps = reportsFor(student.id)
              const isOpen = expandedId === student.id

              return (
                <div key={student.id} style={{
                  backgroundColor: 'white',
                  border: '1px solid #eeeeee',
                  borderLeft: '4px solid ' + (student.degree === 'PhD' ? '#8B0000' : '#002147'),
                  borderRadius: '8px', marginBottom: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)', overflow: 'hidden'
                }}>

                  {/* Collapsed row (click to expand) */}
                  <div
                    onClick={() => setExpandedId(isOpen ? null : student.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', gap: '12px',
                      padding: '15px 20px', cursor: 'pointer', flexWrap: 'wrap'
                    }}>
                    <div style={{ minWidth: '160px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#002147' }}>
                        {student.name}
                      </p>
                      <span style={{
                        display: 'inline-block', marginTop: '4px',
                        backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                        color: 'white', padding: '2px 8px',
                        borderRadius: '12px', fontSize: '11px'
                      }}>
                        {student.degree}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                      {[proposalStage(prop), progressStage(reps), thesisStage(thes)].map((st, i) => pill(st, i))}
                      <span style={{ color: '#999', fontSize: '13px', marginLeft: '4px' }}>
                        {isOpen ? '\u25B2' : '\u25BC'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: '20px', backgroundColor: '#fafafa' }}>

                      {/* Proposal */}
                      <h4 style={{ color: '#8B0000', margin: '0 0 10px 0', fontSize: '14px' }}>Proposal</h4>
                      {!prop ? (
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>No proposal at this stage yet.</p>
                      ) : (
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#002147', fontSize: '14px' }}>{prop.title}</p>
                              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>
                                Version {prop.version || 1} | Submitted {new Date(prop.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {prop.file_name && (
                                <a href={'http://localhost:5000/api/uploads/' + prop.file_name}
                                  target="_blank" rel="noopener noreferrer"
                                  style={{
                                    backgroundColor: '#002147', color: 'white',
                                    padding: '5px 12px', borderRadius: '4px',
                                    fontSize: '12px', textDecoration: 'none'
                                  }}>
                                  PDF
                                </a>
                              )}
                              {pill(proposalStage(prop), 'p')}
                            </div>
                          </div>
                          {prop.supervisor_comments && (
                            <div style={{ backgroundColor: '#f0f7ff', padding: '10px', borderRadius: '4px', fontSize: '13px', color: '#333', marginBottom: '6px' }}>
                              <strong>Supervisor:</strong> {prop.supervisor_comments}
                            </div>
                          )}
                          {prop.hdc_comments && (
                            <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '13px', color: '#333', marginBottom: '6px' }}>
                              <strong>HDC:</strong> {prop.hdc_comments}
                            </div>
                          )}
                     {prop.status === 'Approved' && (
                            <div style={{ marginTop: '10px', backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: prop.ethics_status === 'Submitted' ? '8px' : 0 }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#002147' }}>Ethics clearance:</span>
                                <span style={{
                                  fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px',
                                  backgroundColor: prop.ethics_status === 'Verified' ? '#e6f4ea' : prop.ethics_status === 'Submitted' ? '#e3f2fd' : '#fff3e0',
                                  color: prop.ethics_status === 'Verified' ? '#2e7d32' : prop.ethics_status === 'Submitted' ? '#1565c0' : '#e65100',
                                  border: '1px solid ' + (prop.ethics_status === 'Verified' ? '#4caf50' : prop.ethics_status === 'Submitted' ? '#2196f3' : '#ff9800')
                                }}>
                                  {prop.ethics_status === 'Verified' ? 'Confirmed on file'
                                    : prop.ethics_status === 'Submitted' ? 'Submitted \u2014 awaiting your confirmation'
                                    : prop.ethics_status === 'Resubmit' ? 'Resubmission requested'
                                    : 'Not submitted'}
                                </span>
                                {prop.ethics_file && (
                                  <a href={'http://localhost:5000/api/uploads/' + prop.ethics_file}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{
                                      backgroundColor: '#002147', color: 'white',
                                      padding: '4px 10px', borderRadius: '4px',
                                      fontSize: '11px', textDecoration: 'none'
                                    }}>
                                    View ethics PDF
                                  </a>
                                )}
                              </div>

                              {prop.ethics_status === 'Submitted' && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => handleEthicsReview(prop.id, 'Verified')}
                                    style={{
                                      backgroundColor: '#2e7d32', color: 'white', border: 'none',
                                      padding: '6px 14px', borderRadius: '4px', fontSize: '12px',
                                      fontWeight: 'bold', cursor: 'pointer'
                                    }}>
                                    Confirm received
                                  </button>
                                  <button
                                    onClick={() => handleEthicsReview(prop.id, 'Resubmit')}
                                    style={{
                                      backgroundColor: 'transparent', color: '#c62828', border: '1px solid #c62828',
                                      padding: '6px 14px', borderRadius: '4px', fontSize: '12px',
                                      fontWeight: 'bold', cursor: 'pointer'
                                    }}>
                                    Request correct document
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Progress */}
                      <h4 style={{ color: '#8B0000', margin: '0 0 10px 0', fontSize: '14px' }}>Progress Reports</h4>
                      {reps.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>No progress reports yet.</p>
                      ) : (
                        <div style={{ marginBottom: '20px' }}>
                          {reps.map(report => (
                            <div key={report.id} style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', padding: '10px', borderRadius: '4px', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#333' }}>{report.semester}</p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>{new Date(report.submitted_at).toLocaleDateString()}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {[
                                  { label: 'On Schedule', value: report.on_schedule },
                                  { label: 'On Budget', value: report.on_budget },
                                  { label: 'On Target', value: report.on_target }
                                ].map(s => (
                                  <span key={s.label} style={{
                                    backgroundColor: s.value === 'yes' ? '#e6f4ea' : '#fff3e0',
                                    color: s.value === 'yes' ? '#2e7d32' : '#e65100',
                                    border: '1px solid ' + (s.value === 'yes' ? '#4caf50' : '#ff9800'),
                                    padding: '2px 8px', borderRadius: '12px', fontSize: '11px'
                                  }}>
                                    {s.label}: {s.value === 'yes' ? '\u2705' : '\u26A0\uFE0F'}
                                  </span>
                                ))}
                                <span style={{
                                  backgroundColor: report.supervisor_comments ? '#e6f4ea' : '#fff3e0',
                                  color: report.supervisor_comments ? '#2e7d32' : '#e65100',
                                  border: '1px solid ' + (report.supervisor_comments ? '#4caf50' : '#ff9800'),
                                  padding: '2px 8px', borderRadius: '12px', fontSize: '11px'
                                }}>
                                  Supervisor Review: {report.supervisor_comments ? '\u2705' : '\u23F3'}
                                </span>
                              </div>
                              {report.supervisor_comments && (
                                <p style={{ fontSize: '12px', color: '#333', margin: '8px 0 0 0' }}>
                                  <strong>Comment:</strong> {report.supervisor_comments}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Thesis */}
                      <h4 style={{ color: '#8B0000', margin: '0 0 10px 0', fontSize: '14px' }}>Thesis</h4>
                      {!thes ? (
                        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>No thesis at examination stage yet.</p>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#002147', fontSize: '14px' }}>{thes.title}</p>
                              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>
                                Version {thes.version || 1} | Submitted {new Date(thes.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {thes.file_name && (
                                <a href={'http://localhost:5000/api/uploads/' + thes.file_name}
                                  target="_blank" rel="noopener noreferrer"
                                  style={{
                                    backgroundColor: '#8B0000', color: 'white',
                                    padding: '5px 12px', borderRadius: '4px',
                                    fontSize: '12px', textDecoration: 'none'
                                  }}>
                                  PDF
                                </a>
                              )}
                              {pill(thesisStage(thes), 't')}
                            </div>
                          </div>
                          {thes.supervisor_comments && (
                            <div style={{ backgroundColor: '#f0f7ff', padding: '10px', borderRadius: '4px', fontSize: '13px', color: '#333' }}>
                              <strong>Supervisor:</strong> {thes.supervisor_comments}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )
            })}

          </div>
        )}
      </div>
    </div>
  )
}

export default ViewSubmissions