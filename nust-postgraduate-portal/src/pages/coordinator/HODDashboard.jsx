// src/pages/coordinator/HODDashboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function HODDashboard() {

  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentPeriod, setCurrentPeriod] = useState(null)
  const [proposals, setProposals] = useState([])
  const [theses, setTheses] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [students, setStudents] = useState([])
  const [progressReports, setProgressReports] = useState([])

  // Auto detect current semester on load
  useEffect(() => {
    const fetchPeriod = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/periods/detect')
        const data = await response.json()
        setCurrentPeriod(data)
      } catch (err) {
        console.error('Error fetching period:', err)
      }
    }
  fetchPeriod()
  }, [])

  // Fetch everything the summary needs (same endpoints View Submissions / Manage Results use)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const dept = user.department_id
        const [pRes, tRes, eRes, sRes, rRes] = await Promise.all([
          fetch('http://localhost:5000/api/proposals/all?departmentId=' + dept),
          fetch('http://localhost:5000/api/theses/all?departmentId=' + dept),
          fetch('http://localhost:5000/api/evaluations/all?departmentId=' + dept),
          fetch('http://localhost:5000/api/auth/students?departmentId=' + dept),
          fetch('http://localhost:5000/api/progress/all?departmentId=' + dept)
        ])
        setProposals(await pRes.json())
        setTheses(await tRes.json())
        setEvaluations(await eRes.json())
        setStudents(await sRes.json())
        setProgressReports(await rRes.json())
      } catch (err) {
        console.error('Error fetching summary:', err)
      }
    }
    fetchSummary()
  }, [user.department_id])

 // Work out the summary counts from the fetched data
  const proposalsAwaitingHDC = proposals.filter(p => p.status === 'Pending HDC Review').length
  const thesesAwaitingExaminers = theses.filter(t => t.status === 'Awaiting Examiner Assignment').length

  const activeByStudent = {}
  evaluations.forEach(e => {
    if (e.is_voided) return
    if (!activeByStudent[e.student_id]) activeByStudent[e.student_id] = { degree: e.degree, evals: [] }
    activeByStudent[e.student_id].evals.push(e)
  })
  let readyToRelease = 0
  let discrepancies = 0
  Object.values(activeByStudent).forEach(({ degree, evals }) => {
   const released = evals.length > 0 && evals.every(ev => ev.is_released)
    if (released) return
    const submitted = evals.length > 0 && evals.every(ev => ev.submitted_to_hdc)
    if (submitted) return
    if (degree === 'Masters' && evals.length >= 1) readyToRelease++
    else if (degree === 'PhD' && evals.length >= 2) {
    if (Math.abs(evals[0].total_mark - evals[1].total_mark) > 20) discrepancies++
      else readyToRelease++
    }
  })

  return (
    <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>

        {/* Welcome banner */}
        <div style={{
          backgroundColor: '#002147',
          color: 'white',
          padding: '25px 30px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>
            Welcome, {user.name}
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
           {user.faculty_name || 'Namibia University of Science and Technology'}
          </p>
        </div>

       {currentPeriod && (
  <div style={{
    backgroundColor: currentPeriod.status === 'Mid-Year Recess' ? '#666666' :
                     currentPeriod.status === 'End of Academic Year' ? '#333333' : '#8B0000',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '8px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <div>
      <p style={{ margin: 0, fontSize: '13px', color: '#ffcccc' }}>
        Current Academic Period — NUST 2026 Calendar
      </p>
      <p style={{ margin: '3px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
        {currentPeriod.semester} — {currentPeriod.academic_year}
      </p>
      {currentPeriod.status !== 'active' && (
        <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#ffcccc' }}>
          ⚠️ {currentPeriod.status}
        </p>
      )}
    </div>
    <div style={{ textAlign: 'right' }}>
      <p style={{ margin: 0, fontSize: '12px', color: '#ffcccc' }}>
        {currentPeriod.semester === 'Semester 1' ? 'Semester 1 ends' : 'Semester 2 ends'}
      </p>
      <p style={{ margin: '3px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
        {currentPeriod.end_date}
      </p>
      <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#ffcccc' }}>
        Started: {currentPeriod.start_date}
      </p>
    </div>
  </div>
)}

   {/* Needs your attention - summary */}
        <p style={{ color: '#002147', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
          Needs your attention
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '15px', marginBottom: '25px'
        }}>
        {[
            { count: proposalsAwaitingHDC, label: 'Proposals to review & assign evaluators', color: '#e65100', bg: '#fff3e0', route: '/coordinator/proposal-evaluators' },
            { count: thesesAwaitingExaminers, label: 'Theses awaiting examiner assignment', color: '#e65100', bg: '#fff3e0', route: '/hod/assign-examiners' },
            { count: readyToRelease, label: 'Results ready to submit for HDC', color: '#2e7d32', bg: '#e6f4ea', route: '/hod/results' },
            { count: discrepancies, label: 'Mark discrepancies to review', color: '#c62828', bg: '#fce4e4', route: '/hod/results' }
          ].map((card, i) => (
            <div key={i} onClick={() => navigate(card.route)} style={{
              backgroundColor: card.count > 0 ? card.bg : 'white',
              border: '1px solid ' + (card.count > 0 ? card.color : '#dddddd'),
              borderRadius: '8px', padding: '18px 20px',
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: card.count > 0 ? card.color : '#999999' }}>
                {card.count}
              </p>
              <p style={{ fontSize: '13px', color: '#555555', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                {card.label}
              </p>
            </div>
          ))}
        </div>

        {/* Department at a glance */}
        <p style={{ color: '#002147', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
          Department at a glance
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '15px', marginBottom: '30px'
        }}>
          {[
            { label: 'PG students', value: students.length },
            { label: 'Proposals', value: proposals.length },
            { label: 'Theses', value: theses.length },
            { label: 'Progress reports', value: progressReports.length }
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

      
      </div>
    </div>
  )
}

export default HODDashboard