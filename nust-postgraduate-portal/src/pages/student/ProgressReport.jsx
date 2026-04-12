// src/pages/student/ProgressReport.jsx

import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";


function ProgressReport() {

 const { user } = useAuth()   
 const navigate = useNavigate()

 // Each section of the form gets its own state variable

  const [researchProblem, setResearchProblem] = useState('')
  const [objectives, setObjectives] = useState('')
  const [activitiesCompleted, setActivitiesCompleted] = useState('')
  const [activitiesInProgress, setActivitiesInProgress] = useState('')
  const [activitiesOutstanding, setActivitiesOutstanding] = useState('')
  const [onSchedule, setOnSchedule] = useState('yes')
  const [onBudget, setOnBudget] = useState('yes')
  const [onTarget, setOnTarget] = useState('yes')
  const [adjustments, setAdjustments] = useState('')
  const [challenges, setChallenges] = useState('')
  const [risks, setRisks] = useState('')
  const [studentComments, setStudentComments] = useState('')

  // This runs when student submits the form
  const handleSubmit = () => {

   //Step 1: Check required fields are not empty
   if (!researchProblem || !objectives || !activitiesCompleted ) {

    alert('Please fill in all required fields before submitting.')
    return
   }

   //Step 2: Build the report object

   //This is the data we could send to backend later
   const report = {
    studentName : user.name,
    studentDegree : user.degree,
    submittedAt : new Date().toLocaleDateString(),
    researchProblem,
    objectives,
    activitiesCompleted,
    activitiesInProgress,
    activitiesOutstanding,
    onSchedule,
    onBudget,
    onTarget,
    adjustments,
    challenges,
    risks,
    studentComments,
    supervisorComments: '' // empty until superviser fills it
   }

   // Step 3: for now log it - later this goes to a database
   console.log('Report submitted:', report)

   //Step 4: Show success and go back to dashboard
   alert('Progress report submitted successfully!')
   navigate('/student')
  }

  return(
     <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '800px',
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
            Faculty of Computing and Informatics — {user.degree} Student
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
  <div style={{ marginBottom: '8px' }}>
    <span style={{ marginRight: '15px', fontSize: '14px' }}>On Schedule?</span>
    <label style={{ marginRight: '10px' }}>
      <input
        type="radio"
        value="yes"
        checked={onSchedule === 'yes'}
        onChange={(e) => setOnSchedule(e.target.value)}
      /> Yes
    </label>
    <label>
      <input
        type="radio"
        value="no"
        checked={onSchedule === 'no'}
        onChange={(e) => setOnSchedule(e.target.value)}
      /> No
    </label>
  </div>

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
  <div style={{ marginBottom: '15px' }}>
    <span style={{ marginRight: '15px', fontSize: '14px' }}>On Target?</span>
    <label style={{ marginRight: '10px' }}>
      <input
        type="radio"
        value="yes"
        checked={onTarget === 'yes'}
        onChange={(e) => setOnTarget(e.target.value)}
      /> Yes
    </label>
    <label>
      <input
        type="radio"
        value="no"
        checked={onTarget === 'no'}
        onChange={(e) => setOnTarget(e.target.value)}
      /> No
    </label>
  </div>

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

{/* Submit Button */}
<button
  onClick={handleSubmit}
  style={{
    width: '100%',
    padding: '14px',
    backgroundColor: '#002147',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '30px',
    cursor:"pointer"
  }}>
  Submit Progress Report
</button>

        </div>

      </div>
      
    </div>
  )

}


export default ProgressReport