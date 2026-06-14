// src/pages/student/ProgressReport.jsx

import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'


function ProgressReport() {

 const { user } = useAuth()   
 const navigate = useNavigate()

 // Each section of the form gets its own state variable

const [researchProblem, setResearchProblem] = useState('')
const [objectives, setObjectives] = useState('')
const [activitiesCompleted, setActivitiesCompleted] = useState('')
const [activitiesInProgress, setActivitiesInProgress] = useState('')
const [activitiesOutstanding, setActivitiesOutstanding] = useState('')
const [onBudget, setOnBudget] = useState('yes')  // ✅ keep only this
const [adjustments, setAdjustments] = useState('')
const [challenges, setChallenges] = useState('')
const [risks, setRisks] = useState('')
const [studentComments, setStudentComments] = useState('')
const [activeSemester, setActiveSemester] = useState('')
const [deadlinePassed, setDeadlinePassed] = useState(false)
const [reportNumber, setReportNumber] = useState(1)
const [canSubmit, setCanSubmit] = useState(true)
const [blockMessage, setBlockMessage] = useState('')

// Fetch active semester when page loads
useEffect(() => {
const fetchActivePeriod = async () => {
  try {
    // First try auto-detect
    const detectRes = await fetch('http://localhost:5000/api/periods/detect')
    const detectData = await detectRes.json()

    if (detectRes.ok) {
      setActiveSemester(`${detectData.semester} — ${detectData.academic_year}`)
      return
    }

    // Fallback to manual active period
    const response = await fetch('http://localhost:5000/api/periods/active')
    const data = await response.json()
    if (response.ok) {
      setActiveSemester(`${data.semester} — ${data.academic_year}`)
    }
  } catch (err) {
    console.error('Error fetching period:', err)
  }
}

  const fetchDeadline = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/deadlines/all')
      const data = await response.json()
      if (data.progressReport) {
        const deadline = new Date(data.progressReport)
        const now = new Date()
        setDeadlinePassed(now > deadline)
      }
    } catch (err) {
      console.error('Error fetching deadline:', err)
    }
  }

const fetchReportStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/progress/student/' + user.id)
      const reports = await res.json()

      // Any report still awaiting supervisor review?
      const pending = reports.filter(r => !r.supervisor_comments || r.supervisor_comments === '')

      if (pending.length > 0) {
        const pendingNum = pending[0].report_number || reports.length
        setReportNumber(pendingNum)
        setCanSubmit(false)
        setBlockMessage('Your Progress Report ' + pendingNum + ' is still awaiting supervisor review. You can submit your next report once it has been reviewed.')
      } else {
        setReportNumber(reports.length + 1)
        setCanSubmit(true)
      }
    } catch (err) {
      console.error('Error fetching report status:', err)
    }
  }

  fetchActivePeriod()
  fetchDeadline()
  fetchReportStatus()
}, [user.id])

 const handleSubmit = async () => {

  // Block if previous report not yet reviewed
  if (!canSubmit) {
    alert(blockMessage)
    return
  }

  // Check required fields
  if (!researchProblem || !objectives || !activitiesCompleted) {
    alert('Please fill in all required fields before submitting.')
    return
  }

  // Check active semester is loaded
if (!activeSemester) {
  alert('Could not load active semester. Please refresh the page.')
  return
}

// Block submission if deadline passed
  if (deadlinePassed) {
    alert('The submission deadline has passed. You can no longer submit.')
    return
  }

  try {

    // Send report to backend API
    const response = await fetch('http://localhost:5000/api/progress/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
       studentId: user.id,
        semester: activeSemester,
        reportNumber,
        researchProblem,
        objectives,
        activitiesCompleted,
        activitiesInProgress,
        activitiesOutstanding,
        onBudget,
        adjustments,
        challenges,
        risks,
        studentComments
      })
    })

    const data = await response.json()

    // If duplicate or error
    if (!response.ok) {
      alert(data.message)
      return
    }

    // Success
    alert('Progress report submitted successfully!')
    navigate('/student')

  } catch (err) {
    alert('Could not connect to server. Please try again.')
    console.error(err)
  }

}



  return(
     <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>

        {/* Page header */}
        <div style={{
          backgroundColor: '#002147',
          color: 'white',
          padding: '20px 25px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>
            Postgraduate Research Progress Report
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
             {user.programme_name || 'Namibia University of Science and Technology'} — {user.degree} Student
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/student')}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #002147',
            color: '#002147',
            padding: '8px 16px',
            borderRadius: '4px',
            marginBottom: '25px',
            fontSize: '13px',
            cursor:"pointer"
          }}>
      ← Back to Dashboard
        </button>

        {/* Report number banner */}
        <div style={{
          backgroundColor: '#8B0000',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#ffcccc' }}>
            You are submitting
          </p>
          <p style={{ margin: '3px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>
            Progress Report {reportNumber}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#ffcccc' }}>
            {activeSemester}
          </p>
        </div>

        {/* Block message if previous report not reviewed */}
        {!canSubmit && (
          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            padding: '15px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#e65100',
            fontSize: '14px'
          }}>
            ⏳ {blockMessage}
          </div>
        )}

        {/* SECTION 1 - Research Problem */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
        }}>
          <h3 style={{
            color: '#8B0000',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            1. Research Problem (Problem Statement)
          </h3>
          <textarea
            value={researchProblem}
            onChange={(e) => setResearchProblem(e.target.value)}
            placeholder="Briefly describe your research problem..."
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cccccc',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* SECTION 2 - Research Objectives */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
        }}>
          <h3 style={{
            color: '#8B0000',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            2. Research Objectives
          </h3>
          <textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="List your research objectives..."
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cccccc',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />

          </div>

        {/* SECTION 3 - Evaluation */}
       

<div style={{
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '20px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
}}>
  <h3 style={{
    color: '#8B0000',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px',
    marginBottom: '15px'
  }}>
    3. Evaluation
  </h3>
     <div style={{
  backgroundColor: '#f0f7ff',
  border: '1px solid #002147',
  padding: '10px 15px',
  borderRadius: '4px',
   marginTop:'20px',
  marginBottom: '15px',
  fontSize: '13px',
  color: '#002147'
}}>
  ℹ️ <strong>On Schedule</strong> and <strong>On Target</strong> status are 
  calculated automatically by the system based on your submission date and 
  supervisor review history.
</div>

  {/* Activities Completed */}
  <label style={{ fontWeight: 'bold', color: '#002147', display: 'block', marginBottom: '6px' }}>
    Activities Completed / Achievements:
  </label>
  <textarea
    value={activitiesCompleted}
    onChange={(e) => setActivitiesCompleted(e.target.value)}
    placeholder="What have you completed this semester?"
    rows={3}
    style={{
      width: '100%',
      padding: '10px',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      fontSize: '14px',
      resize: 'vertical',
      marginBottom: '15px'
    }}
  />

  {/* Status checkboxes */}
  <label style={{ fontWeight: 'bold', color: '#002147', display: 'block', marginBottom: '10px' }}>
    Status:
  </label>

  {/* On Schedule */}


  {/* On Budget */}
  <div style={{ marginBottom: '8px' }}>
    <span style={{ marginRight: '15px', fontSize: '14px' }}>On Budget?</span>
    <label style={{ marginRight: '10px' }}>
      <input
        type="radio"
        value="yes"
        checked={onBudget === 'yes'}
        onChange={(e) => setOnBudget(e.target.value)}
      /> Yes
    </label>
    <label>
      <input
        type="radio"
        value="no"
        checked={onBudget === 'no'}
        onChange={(e) => setOnBudget(e.target.value)}
      /> No
    </label>
  </div>

  {/* On Target */}
  

  {/* Activities in Progress */}
  <label style={{ fontWeight: 'bold', color: '#002147', display: 'block', marginBottom: '6px' }}>
    Activities in Progress:
  </label>
  <textarea
    value={activitiesInProgress}
    onChange={(e) => setActivitiesInProgress(e.target.value)}
    placeholder="What are you currently working on?"
    rows={3}
    style={{
      width: '100%',
      padding: '10px',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      fontSize: '14px',
      resize: 'vertical',
      marginBottom: '15px'
    }}
  />

  {/* Activities Outstanding */}
  <label style={{ fontWeight: 'bold', color: '#002147', display: 'block', marginBottom: '6px' }}>
    Activities Outstanding:
  </label>
  <textarea
    value={activitiesOutstanding}
    onChange={(e) => setActivitiesOutstanding(e.target.value)}
    placeholder="What still needs to be done?"
    rows={3}
    style={{
      width: '100%',
      padding: '10px',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      fontSize: '14px',
      resize: 'vertical'
    }}
  />
</div>

{/* SECTION 4 - Adjustments */}
<div style={{
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '20px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
}}>
  <h3 style={{
    color: '#8B0000',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px',
    marginBottom: '15px'
  }}>
    4. Adjustments to Scope
  </h3>
  <textarea
    value={adjustments}
    onChange={(e) => setAdjustments(e.target.value)}
    placeholder="Were there any adjustments to your research scope?"
    rows={3}
    style={{
      width: '100%',
      padding: '10px',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      fontSize: '14px',
      resize: 'vertical'
    }}
  />
</div>

{/* SECTION 5 - Challenges */}
<div style={{
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '20px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
}}>
  <h3 style={{
    color: '#8B0000',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px',
    marginBottom: '15px'
  }}>
    5. Challenges to Date
  </h3>
  <textarea
    value={challenges}
    onChange={(e) => setChallenges(e.target.value)}
    placeholder="What challenges have you faced so far?"
    rows={3}
    style={{
      width: '100%',
      padding: '10px',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      fontSize: '14px',
      resize: 'vertical'
    }}
  />
</div>

{/* SECTION 6 - Risks */}
<div style={{
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '20px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
}}>
  <h3 style={{
    color: '#8B0000',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px',
    marginBottom: '15px'
  }}>
    6. Risks
  </h3>
  <textarea
    value={risks}
    onChange={(e) => setRisks(e.target.value)}
    placeholder="What risks could affect your research?"
    rows={3}
    style={{
      width: '100%',
      padding: '10px',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      fontSize: '14px',
      resize: 'vertical'
    }}
  />
</div>

{/* SECTION 7 - Student Comments */}
<div style={{
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '20px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
}}>
  <h3 style={{
    color: '#8B0000',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px',
    marginBottom: '15px'
  }}>
    7. Student Comments
  </h3>
  <textarea
    value={studentComments}
    onChange={(e) => setStudentComments(e.target.value)}
    placeholder="Any additional comments?"
    rows={3}
    style={{
      width: '100%',
      padding: '10px',
      border: '1px solid #cccccc',
      borderRadius: '4px',
      fontSize: '14px',
      resize: 'vertical'
    }}
  />
</div>

{/* Submit button - disabled if deadline passed */}
<button
  onClick={handleSubmit}
  disabled={deadlinePassed || !canSubmit}
  style={{
    width: '100%',
    padding: '14px',
    backgroundColor: (deadlinePassed || !canSubmit) ? '#cccccc' : '#002147',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '30px',
    cursor: (deadlinePassed || !canSubmit) ? 'not-allowed' : 'pointer'
  }}>
  {deadlinePassed
    ? '❌ Submission Deadline Has Passed'
    : !canSubmit
    ? '⏳ Awaiting Review of Previous Report'
    : 'Submit Progress Report ' + reportNumber}
</button>

      </div>
      
    </div>
  )

}


export default ProgressReport