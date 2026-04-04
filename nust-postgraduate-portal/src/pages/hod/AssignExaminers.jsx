// src/pages/hod/AssignExaminers.jsx

import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import fakeUsers from "../../utils/fakeUsers";


function AssignExaminers() {

    const navigate = useNavigate()

    // Get only students from fakeUsers
    const students = fakeUsers.filter(u => u.role === 'student')

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

    //When hod submits the examiner assignment
    const handleAssign = () => {

        //Internal examiner is always required
        if(!internalExaminer) {
            alert('Please enter an internal examiner.')
            return
        }

        // External examiner only required for PHD
        if(selectedStudent.degree === 'PhD' && !externalExaminer) {
            alert('PhD students require both an internal and external examiner.')
            return
        }

        // Show succcess
        setAssigned(true)
        console.log('Assigned:' , {
            student: selectedStudent.name,
            degree: selectedStudent.degree,
            internalExaminer,
            externalExaminer: selectedStudent.degree === 'PhD' ? externalExaminer : 'N/A'

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
            fontSize: '13px'
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
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: '#002147',
                marginBottom: '6px'
              }}>
                Internal Examiner Name: *
              </label>
              <input
                type="text"
                value={internalExaminer}
                onChange={(e) => setInternalExaminer(e.target.value)}
                placeholder="Enter internal examiner's full name"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* External Examiner - only shows for PhD */}
            {selectedStudent.degree === 'PhD' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#002147',
                  marginBottom: '6px'
                }}>
                  External Examiner Name: *
                </label>
                <input
                  type="text"
                  value={externalExaminer}
                  onChange={(e) => setExternalExaminer(e.target.value)}
                  placeholder="Enter external examiner's full name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cccccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}

            {/* Success message */}
            {assigned && (
              <div style={{
                backgroundColor: '#e6f4ea',
                border: '1px solid #4caf50',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '20px',
                color: '#2e7d32',
                fontSize: '14px'
              }}>
                ✅ Examiners successfully assigned to {selectedStudent.name}!
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