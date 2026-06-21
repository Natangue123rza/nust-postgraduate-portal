// src/pages/coordinator/GraduationReport.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function GraduationReport() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dept = user.department_id
        const [eRes, sRes] = await Promise.all([
          fetch('http://localhost:5000/api/evaluations/all?departmentId=' + dept),
          fetch('http://localhost:5000/api/auth/students?departmentId=' + dept)
        ])
        setEvaluations(await eRes.json())
        setStudents(await sRes.json())
      } catch (err) {
        console.error('Error fetching report data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.department_id])

  // Map student_id -> supervisor name
  const supByStudent = {}
  students.forEach(s => { supByStudent[s.id] = s.supervisor_name || 'Not assigned' })

  // Completed candidates = students with released, non-voided evaluations
  const byStudent = {}
  evaluations.forEach(e => {
    if (e.is_voided) return
    if (!e.is_released) return
    if (!byStudent[e.student_id]) {
      byStudent[e.student_id] = { student_id: e.student_id, name: e.student_name, degree: e.degree, marks: [] }
    }
    byStudent[e.student_id].marks.push(Number(e.total_mark) || 0)
  })

  const candidates = Object.values(byStudent).map(c => {
    const finalMark = c.marks.length
      ? Math.round(c.marks.reduce((a, b) => a + b, 0) / c.marks.length)
      : 0
    return Object.assign({}, c, { finalMark, supervisor: supByStudent[c.student_id] || 'Not assigned' })
  })

  const mastersCount = candidates.filter(c => c.degree === 'Masters').length
  const phdCount = candidates.filter(c => c.degree === 'PhD').length
  const avgMark = candidates.length
    ? Math.round(candidates.reduce((a, c) => a + c.finalMark, 0) / candidates.length)
    : 0

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px' }}>Graduation & Completions Report</h1>
            <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
              Candidates who have completed examination with released results
            </p>
          </div>
          <button onClick={() => window.print()} style={{
            backgroundColor: '#8B0000', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '4px', fontSize: '13px',
            fontWeight: 'bold', cursor: 'pointer'
          }}>
            Print / Export
          </button>
        </div>

        {loading && <LoadingSpinner message="Building report..." />}

        {!loading && (
          <div>
            {/* Summary */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '15px', marginBottom: '25px'
            }}>
              {[
                { label: 'Candidates', value: candidates.length },
                { label: 'Masters', value: mastersCount },
                { label: 'PhD', value: phdCount },
                { label: 'Average mark', value: candidates.length ? avgMark + '/100' : '—' }
              ].map((stat, i) => (
                <div key={i} style={{
                  backgroundColor: 'white', border: '1px solid #eeeeee',
                  borderRadius: '8px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#002147', margin: 0 }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666666', margin: '3px 0 0 0' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {candidates.length === 0 && (
              <div style={{
                backgroundColor: '#fff3e0', border: '1px solid #ff9800',
                padding: '25px', borderRadius: '8px', textAlign: 'center', color: '#e65100'
              }}>
                No completed candidates yet. Students appear here once their results are released.
              </div>
            )}

            {candidates.length > 0 && (
              <div style={{
                backgroundColor: 'white', borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.07)', overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr',
                  padding: '12px 18px', backgroundColor: '#002147', color: 'white',
                  fontSize: '12px', fontWeight: 'bold'
                }}>
                  <span>Student</span>
                  <span>Degree</span>
                  <span>Supervisor</span>
                  <span style={{ textAlign: 'right' }}>Final Mark</span>
                </div>
                {candidates.map((c, i) => (
                  <div key={c.student_id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr',
                    padding: '12px 18px', alignItems: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: i % 2 === 0 ? 'white' : '#fafafa', fontSize: '13px'
                  }}>
                    <span style={{ fontWeight: 'bold', color: '#002147' }}>{c.name}</span>
                    <span>
                      <span style={{
                        backgroundColor: c.degree === 'PhD' ? '#8B0000' : '#002147', color: 'white',
                        padding: '2px 8px', borderRadius: '10px', fontSize: '11px'
                      }}>
                        {c.degree}
                      </span>
                    </span>
                    <span style={{ color: '#555' }}>{c.supervisor}</span>
                    <span style={{ textAlign: 'right', fontWeight: 'bold', color: '#002147' }}>
                      {c.finalMark}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default GraduationReport