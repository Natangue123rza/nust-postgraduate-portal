// src/pages/student/ProposalUpload.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function ProposalUpload() {

  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [deadlinePassed, setDeadlinePassed] = useState(false)
  const [existingProposal, setExistingProposal] = useState(null)
  const [isResubmitting, setIsResubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check existing proposal
        const proposalRes = await fetch(
          `http://localhost:5000/api/proposals/student/${user.id}`
        )
        const proposalData = await proposalRes.json()
        if (proposalData.length > 0) {
          setExistingProposal(proposalData[0])
        }

        // Check deadline
        const deadlineRes = await fetch('http://localhost:5000/api/deadlines/all')
        const deadlineData = await deadlineRes.json()
        if (deadlineData.proposal) {
          const deadline = new Date(deadlineData.proposal)
          const now = new Date()
          setDeadlinePassed(now > deadline)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()
  }, [user.id])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      alert('Only PDF files are allowed.')
      e.target.value = null
      return
    }
    setFile(selectedFile)
  }

  const handleSubmit = async () => {

    if (deadlinePassed) {
      alert('The submission deadline has passed.')
      return
    }

    if (!title) { alert('Please enter your research title.'); return }
    if (!description) { alert('Please enter a brief description.'); return }
    if (!file) { alert('Please upload your proposal PDF.'); return }

    try {
      // Upload file first
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

      let response

    if (isResubmitting && existingProposal) {
  // Resubmit as new version
  response = await fetch(
    `http://localhost:5000/api/proposals/resubmit-version/${existingProposal.id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        fileName: uploadData.fileName
      })
    }
  )
      } else {
        // New submission
        response = await fetch('http://localhost:5000/api/proposals/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: user.id,
            title,
            description,
            fileName: uploadData.fileName
          })
        })
      }

      const data = await response.json()
      if (!response.ok) { alert(data.message); return }
      setSubmitted(true)

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    }
  }

  // Show existing proposal status
  const renderExistingProposal = () => {
    if (!existingProposal) return null

    const isRejected = existingProposal.status === 'Rejected' || 
                   existingProposal.status === 'Revision Required'
    const isPending = existingProposal.status === 'Pending HDC Review' || 
                  existingProposal.status === 'Pending Supervisor Review' ||
                  existingProposal.status === 'Pending'
    const isApproved = existingProposal.status === 'Approved'

    return (
      <div style={{
        backgroundColor: isRejected ? '#fce4e4' : isApproved ? '#e6f4ea' : '#fff3e0',
        border: `1px solid ${isRejected ? '#ef5350' : isApproved ? '#4caf50' : '#ff9800'}`,
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '25px'
      }}>
        <h3 style={{
          color: isRejected ? '#c62828' : isApproved ? '#2e7d32' : '#e65100',
          marginBottom: '10px',
          fontSize: '15px'
        }}>
          {isRejected ? '❌ Proposal Rejected' :
           isApproved ? '✅ Proposal Approved' :
           '⏳ Proposal Pending Review'}
        </h3>
        <p style={{ fontSize: '13px', color: '#333', marginBottom: '5px' }}>
          <strong>Title:</strong> {existingProposal.title}
        </p>
        <p style={{ fontSize: '13px', color: '#333', marginBottom: '5px' }}>
          <strong>Submitted:</strong> {new Date(existingProposal.submitted_at).toLocaleDateString()}
        </p>
      {existingProposal.hdc_comments && (
          <p style={{ fontSize: '13px', color: '#333', marginBottom: '10px' }}>
            <strong>HDC Comments:</strong> {existingProposal.hdc_comments}
          </p>
        )}

        {/* Supervisor's feedback - full rejection reason, handles long text */}
        {isRejected && existingProposal.supervisor_comments && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #ef9a9a',
            borderLeft: '4px solid #c62828',
            borderRadius: '6px',
            padding: '14px 16px',
            margin: '12px 0'
          }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#c62828', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>
              SUPERVISOR'S FEEDBACK
            </p>
            <p style={{ fontSize: '13px', color: '#333333', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {existingProposal.supervisor_comments}
            </p>
          </div>
        )}

        {/* Resubmit button only if rejected */}
        {isRejected && !isResubmitting && (
          <button
            onClick={() => {
              setIsResubmitting(true)
              setTitle(existingProposal.title)
              setDescription(existingProposal.description || '')
            }}
            style={{
              backgroundColor: '#002147',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              marginTop: '5px'
            }}>
            🔄 Resubmit Proposal
          </button>
        )}

      {/* If approved — show ethics upload */}
{isApproved && (
  <div style={{ marginTop: '15px' }}>
    <p style={{ fontSize: '13px', color: '#2e7d32', marginBottom: '10px' }}>
      ✅ Your proposal has been approved. Please submit your ethics clearance form.
    </p>

    {/* Ethics status */}
    {existingProposal.ethics_status === 'Submitted' ? (
      <div style={{
        backgroundColor: '#e6f4ea', border: '1px solid #4caf50',
        padding: '12px', borderRadius: '6px', fontSize: '13px', color: '#2e7d32'
      }}>
        ✅ Ethics clearance submitted successfully!
      </div>
    ) : (
      <div>
        <p style={{ fontSize: '13px', color: '#333', marginBottom: '10px' }}>
          Please download the ethics form, fill it in, get it signed and upload it below.
        </p>

        {/* Ethics file upload */}
        <input
          type="file"
          accept=".pdf"
          onChange={async (e) => {
            const ethicsFile = e.target.files[0]
            if (!ethicsFile) return
            if (ethicsFile.type !== 'application/pdf') {
              alert('Only PDF files are allowed.')
              return
            }

            try {
              // Upload file
              const formData = new FormData()
              formData.append('file', ethicsFile)

              const uploadRes = await fetch('http://localhost:5000/api/uploads/file', {
                method: 'POST',
                body: formData
              })
              const uploadData = await uploadRes.json()

              if (!uploadRes.ok) {
                alert(uploadData.message)
                return
              }

              // Save ethics file
              const response = await fetch(
                `http://localhost:5000/api/proposals/ethics/${existingProposal.id}`,
                {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fileName: uploadData.fileName })
                }
              )

              const data = await response.json()
              if (!response.ok) { alert(data.message); return }

              alert('Ethics clearance submitted successfully!')
              // Refresh page
              window.location.reload()

            } catch (err) {
              alert('Could not upload file.')
              console.error(err)
            }
          }}
          style={{
            width: '100%', padding: '10px',
            border: '1px solid #cccccc', borderRadius: '4px',
            fontSize: '14px', marginTop: '5px'
          }}
        />
      </div>
    )}
  </div>
)}

        {/* If pending — no action needed */}
       {isPending && (
  <p style={{ fontSize: '13px', color: '#e65100', marginTop: '5px' }}>
    {existingProposal.status === 'Pending Supervisor Review' || existingProposal.status === 'Pending'
      ? 'Your proposal is currently under supervisor review. Please wait for feedback.'
      : 'Your proposal has been approved by your supervisor and is awaiting HDC review.'
    }
  </p>
)}
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147',
          color: 'white',
          padding: '25px 30px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>
            {isResubmitting ? 'Resubmit Research Proposal' : 'Research Proposal Submission'}
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
             {user.programme_name || 'Namibia University of Science and Technology'} - {user.degree} Student
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

        {/* Show existing proposal status */}
        {!isResubmitting && renderExistingProposal()}

        {/* Show form if no existing proposal OR resubmitting */}
        {(!existingProposal || isResubmitting) && !submitted && (
          <div>

            {/* Resubmitting notice */}
            {isResubmitting && (
              <div style={{
                backgroundColor: '#fff3e0',
                border: '1px solid #ff9800',
                padding: '12px 15px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#e65100'
              }}>
               ⚠️ You are resubmitting your proposal. Please review the feedback above and address it before resubmitting.
              </div>
            )}

            {/* Research Title */}
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
                Research Title
              </h3>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your research title"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Description */}
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
                Brief Description
              </h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your research proposal..."
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
                Upload Proposal (PDF only)
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

            {/* HDC Notice */}
            <div style={{
              backgroundColor: '#fff3e0',
              border: '1px solid #ff9800',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#e65100'
            }}>
        ⚠️ <strong>Note:</strong> Your proposal goes to your supervisor for review first.
              Once they approve it, it is forwarded to the HDC committee. You will be notified of the outcome.
            </div>

            {/* Submit button */}
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
              {deadlinePassed ? '❌ Submission Deadline Has Passed' :
               isResubmitting ? '🔄 Resubmit Proposal' : 'Submit Proposal'}
            </button>

          </div>
        )}

        {/* Success */}
        {submitted && (
          <div style={{
            backgroundColor: '#e6f4ea',
            border: '1px solid #4caf50',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '10px' }}>
              ✅ Proposal {isResubmitting ? 'Resubmitted' : 'Submitted'} Successfully!
            </h2>
            <p style={{ color: '#333', marginBottom: '20px' }}>
              Status: <strong>Pending Supervisor Review</strong>
            </p>
            <button
              onClick={() => navigate('/student')}
              style={{
                backgroundColor: '#002147',
                color: 'white',
                border: 'none',
                padding: '10px 25px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProposalUpload