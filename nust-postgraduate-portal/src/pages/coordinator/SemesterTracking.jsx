// src/pages/coordinator/SemesterTracking.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function SemesterTracking() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [reports, setReports] = useState([])
  const [period, setPeriod] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selectedId, setSelectedId] = useState('')
  const [records, setRecords] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dept = user.department_id
        const [sRes, rRes, pRes] = await Promise.all([
          fetch('http://localhost:5000/api/auth/students?departmentId=' + dept),
          fetch('http://localhost:5000/api/progress/all?departmentId=' + dept),
          fetch('http://localhost:5000/api/periods/detect')
        ])
        setStudents(await sRes.json())
        setReports(await rRes.json())
        setPeriod(await pRes.json())
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.department_id])

  const loadRecords = async (studentId) => {
    try {
      const res = await fetch('http://localhost:5000/api/semesters/student/' + studentId)
      setRecords(await res.json())
    } catch (err) {
      console.error('Error loading records:', err)
      setRecords([])
    }
  }

  const selectStudent = (id) => {
    setSelectedId(id)
    if (id) loadRecords(id)
    else setRecords([])
  }

  const periodLabel = period ? (period.semester + ' — ' + period.academic_year) : ''

  const addSemester = async (status) => {
    if (!selectedId) { alert('Please choose a student.'); return }
    if (!periodLabel) { alert('Current academic period not loaded.'); return }
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/semesters/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedId, semesterLabel: periodLabel, status })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      alert(data.message)
      loadRecords(selectedId)
    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSaving(false)
    }
  }

  const removeRecord = async (id) => {
    if (!window.confirm('Remove this semester record?')) return
    try {
      const res = await fetch('http://localhost:5000/api/semesters/' + id, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return }
      loadRecords(selectedId)
    } catch (err) {
      alert('Could not connect to server.')
    }
  }

  const registeredCount = records.filter(r => r.status === 'registered').length
  const gapCount = records.filter(r => r.status === 'gap').length
  const reportsSubmitted = selectedId ? reports.filter(r => String(r.student_id) === String(selectedId)).length : 0

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ backgroundColor: '#002147', color: 'white', padding: '25px 30px', borderRadius: '8px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Semester Tracking</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Record each student's registered semesters. Gap semesters are skipped, so no progress report is expected for them.
          </p>
        </div>

        {loading && <LoadingSpinner message="Loading..." />}

        {!loading && (
          <div>
            <div style={{ backgroundColor: '#f0f7ff', border: '1px solid #002147', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#002147' }}>
              Current academic period: <strong>{periodLabel || 'Not set'}</strong>
            </div>

            <label style={{ display: 'block', fontWeight: 'bold', color: '#002147', marginBottom: '6px', fontSize: '13px' }}>Student</label>
            <select value={selectedId} onChange={(e) => selectStudent(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px', backgroundColor: 'white', marginBottom: '20px' }}>
              <option value="">-- Choose a student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.degree})</option>
              ))}
            </select>

            {selectedId && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  {[
                    { label: 'Current semester', value: registeredCount },
                    { label: 'Gap semesters', value: gapCount },
                    { label: 'Reports submitted', value: reportsSubmitted }
                  ].map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'white', border: '1px solid #eeeeee', borderRadius: '8px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#002147', margin: 0 }}>{stat.value}</p>
                      <p style={{ fontSize: '12px', color: '#666', margin: '3px 0 0 0' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {registeredCount > reportsSubmitted && (
                  <div style={{ backgroundColor: '#fff3e0', border: '1px solid #ff9800', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#e65100' }}>
                    This student is registered for {registeredCount} semester{registeredCount === 1 ? '' : 's'} but has submitted {reportsSubmitted} progress report{reportsSubmitted === 1 ? '' : 's'}.
                  </div>
                )}

                <div style={{ backgroundColor: 'white', border: '1px solid #eeeeee', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#333', fontWeight: 'bold' }}>
                    Record {periodLabel || 'the current period'} for this student:
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => addSemester('registered')} disabled={saving}
                      style={{ backgroundColor: saving ? '#cccccc' : '#2e7d32', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer' }}>
                      Register this semester
                    </button>
                    <button onClick={() => addSemester('gap')} disabled={saving}
                      style={{ backgroundColor: 'transparent', color: '#e65100', border: '1px solid #ff9800', padding: '10px 18px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer' }}>
                      Mark as gap (skip)
                    </button>
                  </div>
                </div>

                <h3 style={{ color: '#002147', fontSize: '15px', borderLeft: '4px solid #8B0000', paddingLeft: '10px', marginBottom: '12px' }}>
                  Semester history
                </h3>
                {records.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#666' }}>No semesters recorded yet.</p>
                ) : (
                  records.map(r => (
                    <div key={r.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: 'white', border: '1px solid #eeeeee', borderRadius: '8px',
                      padding: '12px 16px', marginBottom: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#002147' }}>{r.semester_label}</span>
                        <span style={{
                          backgroundColor: r.status === 'registered' ? '#e6f4ea' : '#fff3e0',
                          color: r.status === 'registered' ? '#2e7d32' : '#e65100',
                          border: '1px solid ' + (r.status === 'registered' ? '#4caf50' : '#ff9800'),
                          padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                        }}>
                          {r.status === 'registered' ? 'Registered' : 'Gap (skipped)'}
                        </span>
                      </div>
                      <button onClick={() => removeRecord(r.id)}
                        style={{ backgroundColor: 'transparent', color: '#c62828', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default SemesterTracking