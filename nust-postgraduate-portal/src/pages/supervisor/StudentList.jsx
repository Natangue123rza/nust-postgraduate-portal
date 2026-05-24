// src/pages/supervisor/StudentList.jsx

import Navbar from "../../components/Navbar"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'


function StudentList() {

    const navigate = useNavigate()

    const { user } = useAuth()
const [students, setStudents] = useState([])

useEffect(() => {
  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/supervisor-students/${user.id}`
      )
      const data = await response.json()
      setStudents(data)
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }
  fetchStudents()
}, [user.id])

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

        {/* Student table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
          overflow: 'hidden'
        }}>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            backgroundColor: '#002147',
            color: 'white',
            padding: '12px 20px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <span>Student Name</span>
            <span>Email</span>
            <span>Degree Type</span>
          </div>

          {/* Table rows */}
          {students.map((student, index) => (
            <div
              key={student.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                padding: '15px 20px',
                fontSize: '14px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
              }}>
              <span style={{ fontWeight: 'bold', color: '#002147' }}>
                {student.name}
              </span>
              <span style={{ color: '#666666' }}>
                {student.email}
              </span>
              <span>
                <span style={{
                  backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '11px'
                }}>
                  {student.degree}
                </span>
              </span>
            </div>
          ))}

        </div>
      </div>
    </div>
    )

}

export default StudentList
