// src/pages/student/ThesisSubmission.jsx
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'



function ThesisSubmission() {

  const { user } = useAuth()
  const navigate = useNavigate()

  // Track form fields
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [file, setFile] = useState(null)
  const [declaration, setDeclaration] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [deadlinePassed, setDeadlinePassed] = useState(false)

  useEffect(() => {
  const fetchDeadline = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/deadlines/all')
      const data = await response.json()
     if (data.thesis) {
           const deadline = new Date(data.thesis)
          const now = new Date()
         setDeadlinePassed(now > deadline)
}
    } catch (err) {
      console.error('Error fetching deadline:', err)
    }
  }
  fetchDeadline()
}, [])

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]

    // Only allow PDF files
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      alert('Only PDF files are allowed.')
      e.target.value = null
      return
    }

    setFile(selectedFile)
  }

const handleSubmit = async () => {



  if (!title) {
    alert('Please enter your thesis title.')
    return
  }

  if (!abstract) {
    alert('Please enter your thesis abstract.')
    return
  }

  if (!file) {
    alert('Please upload your thesis PDF.')
    return
  }

  if (!declaration) {
    alert('Please confirm the declaration before submitting.')
    return
  }

  // Block submission if deadline passed
  if (deadlinePassed) {
    alert('The submission deadline has passed. You can no longer submit.')
    return
  }

  try {

    // Step 1 — Upload the file first
    const formData = new FormData()
    formData.append('file', file)

    const uploadResponse = await fetch('http://localhost:5000/api/uploads/file', {
      method: 'POST',
      body: formData
    })

    const uploadData = await uploadResponse.json()

    if (!uploadResponse.ok) {
      alert(uploadData.message)
      return
    }

    // Step 2 — Submit thesis with saved filename
    const response = await fetch('http://localhost:5000/api/theses/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: user.id,
        title,
        abstract,
        fileName: uploadData.fileName
      })
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message)
      return
    }

    setSubmitted(true)

  } catch (err) {
    alert('Could not connect to server. Please try again.')
    console.error(err)
  }

}

  return (
    <div>
      <Navbar />

      <div style={{
        padding: '30px',
        maxWidth: '800px',
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
          <h1 style={{ margin: 0, fontSize: '20px' }}>
            Thesis Submission
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            {user.degree} Student — Faculty of Computing and Informatics
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
            cursor: 'pointer'
          }}>
          ← Back to Dashboard
        </button>

        {/* Show form if not submitted */}
        {!submitted && (
          <div>

            {/* Thesis Title */}
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
                Thesis Title
              </h3>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your thesis title"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Abstract */}
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
                Abstract
              </h3>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Enter your thesis abstract..."
                rows={6}
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

            {/* File Upload */}
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
                Upload Thesis (PDF only)
              </h3>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />

              {/* Show selected file info */}
              {file && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px',
                  backgroundColor: '#f0f7ff',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#002147'
                }}>
                  ✅ Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            {/* Declaration */}
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
                Declaration
              </h3>

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={declaration}
                  onChange={(e) => setDeclaration(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <span>
                  I declare that this thesis is my own original work. Where other
                  sources have been used, they have been acknowledged. I understand
                  that plagiarism is a serious academic offence.
                </span>
              </label>
            </div>

            {/* Important notice */}
            <div style={{
              backgroundColor: '#fff3e0',
              border: '1px solid #ff9800',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#e65100'
            }}>
              ⚠️ <strong>Note:</strong> Once submitted, your thesis will be
              forwarded to the HOD for examiner assignment. Ensure your
              document is complete before submitting.
            </div>

            {/* Submit button */}
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
                cursor: 'pointer'
              }}>
              Submit Thesis
            </button>

          </div>
        )}

        {/* Success message */}
        {submitted && (
          <div style={{
            backgroundColor: '#e6f4ea',
            border: '1px solid #4caf50',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '10px' }}>
              ✅ Thesis Submitted Successfully!
            </h2>
            <p style={{ color: '#333', marginBottom: '5px' }}>
              Title: <strong>{title}</strong>
            </p>
            <p style={{ color: '#333', marginBottom: '5px' }}>
              Degree: <strong>{user.degree}</strong>
            </p>
            <p style={{ color: '#333', marginBottom: '5px' }}>
              File: <strong>{file?.name}</strong>
            </p>
            <p style={{ color: '#333', marginBottom: '20px' }}>
              Status: <strong>Awaiting Examiner Assignment</strong>
            </p>
           <button
  onClick={handleSubmit}
  disabled={deadlinePassed}
  style={{
    width: '100%',
    padding: '14px',
    backgroundColor: deadlinePassed ? '#cccccc' : '#002147',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '30px',
    cursor: deadlinePassed ? 'not-allowed' : 'pointer'
  }}>
  {deadlinePassed ? '❌ Submission Deadline Has Passed' : 'Submit Thesis'}
</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ThesisSubmission