// src/pages/hod/AssignExaminers.jsx

import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import fakeUsers from "../../utils/fakeUsers";
import { calculateFinalMark } from "../../utils/calculateMarks";


function AssignExaminers() {

    const navigate = useNavigate()

    // Get only students from fakeUsers
    const students = fakeUsers.filter(u => u.role === 'student')

    // Get only examiners from fakeUsers
    const examiners = fakeUsers.filter(u => u.role === 'examiner')

    // Track which student is selected
    const [selectedStudent, setSelectedStudent] = useState(null)

    //Examiner assignemnt fields
    const [internalExaminer, setInternalExaminer] = useState('')
    const [externalExaminer, setExternalExaminer] = useState('')

    //Track if assignment was saved
    const [assigned, setAssigned] = useState(false)

    

    // When HOD clicks a student card
    const handleSelectStudent = (student) => {

        setSelectedStudent(student)
        setExternalExaminer('')
        setExternalExaminer('')
        setAssigned(false)
    }

    // Store mark calculation result
   const [markResult, setMarkResult] = useState(null)

   const handleAssign = () => {

  // Internal examiner always required
  if (!internalExaminer) {
    alert('Please enter an internal examiner.')
    return
  }

  // External examiner only required for PhD
  if (selectedStudent.degree === 'PhD' && !externalExaminer) {
    alert('PhD students require both an internal and external examiner.')
    return
  }

  // Simulate marks for demonstration
  // In a real system these would come from the database
  const simulatedInternal = 72
  const simulatedExternal = selectedStudent.degree === 'PhD' ? 65 : null

  // Calculate final mark using our utility
  const result = calculateFinalMark(
    selectedStudent.degree,
    simulatedInternal,
    simulatedExternal
  )

  // Store result to display
  setMarkResult(result)
  setAssigned(true)

  console.log('Assigned:', {
    student: selectedStudent.name,
    degree: selectedStudent.degree,
    internalExaminer,
    externalExaminer: selectedStudent.degree === 'PhD' ? externalExaminer : 'N/A',
    markResult: result
  })

}

     return (
    <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '1100px',
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
            Assign Examiners
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Select a student to assign their examiner(s)
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/hod')}
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

        {/* Student list */}
        <h2 style={{
          color: '#002147',
          marginBottom: '20px',
          fontSize: '18px',
          borderLeft: '4px solid #8B0000',
          paddingLeft: '10px'
        }}>
          Select a Student
        </h2>

        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '30px'
        }}>

          {students.map(student => (
            <div
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              style={{
                backgroundColor: selectedStudent?.id === student.id ? '#002147' : 'white',
                color: selectedStudent?.id === student.id ? 'white' : '#333333',
                border: '1px solid #dddddd',
                borderTop: `4px solid ${student.degree === 'PhD' ? '#8B0000' : '#002147'}`,
                padding: '20px',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '220px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
              }}>
              <h3 style={{ marginBottom: '8px', fontSize: '15px' }}>
                {student.name}
              </h3>
              <span style={{
                backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                color: 'white',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
                {student.degree}
              </span>
            </div>
          ))}

        </div>

        {/* Examiner assignment form - only shows when student is selected */}
        {selectedStudent && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
          }}>

            <h2 style={{
              color: '#002147',
              marginBottom: '5px',
              fontSize: '18px',
              borderLeft: '4px solid #8B0000',
              paddingLeft: '10px'
            }}>
              Assign Examiners for {selectedStudent.name}
            </h2>

            {/* Degree type notice */}
            <p style={{
              color: '#666666',
              fontSize: '13px',
              marginBottom: '20px',
              paddingLeft: '14px'
            }}>
              {selectedStudent.degree === 'Masters'
                ? '⚠️ Masters student — requires 1 internal examiner only'
                : '⚠️ PhD student — requires 1 internal AND 1 external examiner'
              }
            </p>

            {/* Internal Examiner */}
          {/* Internal Examiner Dropdown */}
<div style={{ marginBottom: '20px' }}>
     <label style={{
       display: 'block',
        fontWeight: 'bold',
         color: '#002147',
         marginBottom: '6px'
          }}>
          Internal Examiner: *
          </label>
           <select
           value={internalExaminer}
           onChange={(e) => setInternalExaminer(e.target.value)}
            style={{
            width: '100%',
            padding: '10px',
             border: '1px solid #cccccc',
             borderRadius: '4px',
             fontSize: '14px',
             backgroundColor: 'white'
             }}>
            <option value="">-- Select Internal Examiner --</option>
            {examiners.map(examiner => (
            <option key={examiner.id} value={examiner.name}>
             {examiner.name}
              </option>
              ))}
              </select>
               </div>

          {/* External Examiner Dropdown - only shows for PhD */}
{selectedStudent.degree === 'PhD' && (
  <div style={{ marginBottom: '20px' }}>
    <label style={{
      display: 'block',
      fontWeight: 'bold',
      color: '#002147',
      marginBottom: '6px'
    }}>
      External Examiner: *
    </label>
    <select
      value={externalExaminer}
      onChange={(e) => setExternalExaminer(e.target.value)}
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #cccccc',
        borderRadius: '4px',
        fontSize: '14px',
        backgroundColor: 'white'
      }}>
      <option value="">-- Select External Examiner --</option>
      {/* Filter out already selected internal examiner */}
      {examiners
        .filter(examiner => examiner.name !== internalExaminer)
        .map(examiner => (
          <option key={examiner.id} value={examiner.name}>
            {examiner.name}
          </option>
        ))
      }
    </select>
  </div>
)}

           {/* Success message */}
  {assigned && markResult && (
  <div style={{
    backgroundColor: markResult.discrepancy ? '#fff3e0' : '#e6f4ea',
    border: `1px solid ${markResult.discrepancy ? '#ff9800' : '#4caf50'}`,
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px'
  }}>
    {/* Assignment confirmed */}
    <p style={{ 
      color: '#2e7d32', 
      fontWeight: 'bold',
      marginBottom: '8px' 
    }}>
      ✅ Examiners assigned to {selectedStudent.name}!
    </p>

    {/* Mark result message */}
    <p style={{ 
      color: markResult.discrepancy ? '#e65100' : '#333',
      marginBottom: '4px'
    }}>
      {markResult.message}
    </p>

    {/* Status badge */}
    <span style={{
      backgroundColor: markResult.discrepancy ? '#ff9800' : '#002147',
      color: 'white',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '11px'
    }}>
      Status: {markResult.status}
    </span>
  </div>
)}

            {/* Assign button */}
            <button
              onClick={handleAssign}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#002147',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor:"pointer"
              }}>
              Confirm Examiner Assignment
            </button>

          </div>
        )}

      </div>
    </div>
  )
}

export default AssignExaminers