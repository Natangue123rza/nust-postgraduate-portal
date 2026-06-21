// src/pages/student/ThesisSubmission.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'

function ThesisSubmission() {

  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [file, setFile] = useState(null)
  const [declaration, setDeclaration] = useState(false)
const [submitted, setSubmitted] = useState(false)
  const [proposalApproved, setProposalApproved] = useState(false)
  const [checkingProposal, setCheckingProposal] = useState(true)

  // Existing thesis (latest version) + resubmission state
  const [existingThesis, setExistingThesis] = useState(null)
  const [loadingThesis, setLoadingThesis] = useState(true)
  const [isResubmitting, setIsResubmitting] = useState(false)

// Check proposal approved
  useEffect(() => {
    const checkProposal = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/proposals/student/' + user.id
        )
        const data = await response.json()
        if (data.length > 0 && data[0].status === 'Approved') {
          setProposalApproved(true)
        } else {
          setProposalApproved(false)
        }
      } catch (err) {
        console.error('Error checking proposal:', err)
      } finally {
        setCheckingProposal(false)
      }
    }
    checkProposal()
  }, [user.id])

  // Fetch existing thesis (newest version first)
  useEffect(() => {
    const fetchThesis = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/theses/student/' + user.id
        )
        const data = await response.json()
        if (data.length > 0) {
          setExistingThesis(data[0])
        }
      } catch (err) {
        console.error('Error fetching thesis:', err)
      } finally {
        setLoadingThesis(false)
      }
    }
    fetchThesis()
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

  // Switch the form into "revise" mode, pre-filling the previous title/abstract
  const startResubmission = () => {
    setTitle(existingThesis.title || '')
    setAbstract(existingThesis.abstract || '')
    setFile(null)
    setDeclaration(false)
    setIsResubmitting(true)
  }

const handleSubmit = async () => {

    if (!title) { alert('Please enter your thesis title.'); return }
    if (!abstract) { alert('Please enter your thesis abstract.'); return }
    if (!file) { alert('Please upload your thesis PDF.'); return }
    if (!declaration) { alert('Please confirm the declaration.'); return }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('http://localhost:5000/api/uploads/file', {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadResponse.json()
      if (!uploadResponse.ok) { alert(uploadData.message); return }

      const url = isResubmitting
        ? 'http://localhost:5000/api/theses/resubmit-version/' + existingThesis.id
        : 'http://localhost:5000/api/theses/submit'

      const response = await fetch(url, {
        method: isResubmitting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          title,
          abstract,
          fileName: uploadData.fileName
        })
      })

      const data = await response.json()
      if (!response.ok) { alert(data.message); return }
      setSubmitted(true)

    } catch (err) {
      alert('Could not connect to server.')
      console.error(err)
    }
  }

  // Renders the student's existing thesis: status, supervisor feedback, resubmit
  const renderExistingThesis = () => {

    const isPending = existingThesis.status === 'Pending Supervisor Review'
    const isRejected = existingThesis.status === 'Revision Required'
    const isInExamination = !isPending && !isRejected

    return (
      <div>

        {/* Status card */}
        <div style={{
          backgroundColor: 'white', padding: '25px',
          borderRadius: '8px', marginBottom: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
        }}>
          <h3 style={{ color: '#002147', marginBottom: '8px', fontSize: '16px' }}>
            {existingThesis.title}
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            Submitted: {new Date(existingThesis.submitted_at).toLocaleDateString()}
            {existingThesis.version > 1 ? ' (Version ' + existingThesis.version + ')' : ''}
          </p>

          <span style={{
            display: 'inline-block',
            backgroundColor: isInExamination ? '#e6f4ea' : isRejected ? '#fce4e4' : '#fff3e0',
            color: isInExamination ? '#2e7d32' : isRejected ? '#c62828' : '#e65100',
            border: '1px solid ' + (isInExamination ? '#4caf50' : isRejected ? '#ef5350' : '#ff9800'),
            padding: '5px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold'
          }}>
            {existingThesis.status}
          </span>

          {existingThesis.file_name && (
            <div style={{ marginTop: '14px' }}>
              
              <a  href={'http://localhost:5000/api/uploads/' + existingThesis.file_name}
                target="_blank" rel="noopener noreferrer"
                style={{
                  backgroundColor: '#002147', color: 'white',
                  padding: '6px 14px', borderRadius: '4px',
                  fontSize: '12px', textDecoration: 'none'
                }}>
                View submitted PDF
              </a>
            </div>
          )}
        </div>

        {/* Pending */}
        {isPending && (
          <div style={{
            backgroundColor: '#fff3e0', border: '1px solid #ff9800',
            padding: '15px 20px', borderRadius: '8px',
            fontSize: '13px', color: '#e65100'
          }}>
            ⏳ Your thesis is with your supervisor for review. You'll be notified once they've reviewed it.
          </div>
        )}

        {/* In examination */}
        {isInExamination && (
          <div style={{
            backgroundColor: '#e6f4ea', border: '1px solid #4caf50',
            padding: '15px 20px', borderRadius: '8px',
            fontSize: '13px', color: '#2e7d32'
          }}>
            ✅ Your supervisor has approved your thesis. It is now in the examination process — check the <strong>My Results</strong> page for your outcome.
          </div>
        )}

        {/* Needs revision: supervisor feedback + resubmit */}
        {isRejected && (
          <div>
            <div style={{
              backgroundColor: 'white', border: '1px solid #ef9a9a',
              borderLeft: '4px solid #c62828', borderRadius: '6px',
              padding: '14px 16px', margin: '0 0 16px 0'
            }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#c62828', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>
                SUPERVISOR'S FEEDBACK
              </p>
              <p style={{ fontSize: '13px', color: '#333333', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {existingThesis.supervisor_comments || 'No comment was provided.'}
              </p>
            </div>

     <button
              onClick={startResubmission}
              style={{
                width: '100%', padding: '14px',
                backgroundColor: '#8B0000',
                color: 'white', border: 'none', borderRadius: '4px',
                fontSize: '15px', fontWeight: 'bold',
                cursor: 'pointer'
              }}>
              Revise & Resubmit Thesis
            </button>
          </div>
        )}

      </div>
    )
  }

  // Show the form when: no thesis yet, OR the student chose to resubmit
  const showForm =
    !checkingProposal && !loadingThesis && proposalApproved && !submitted &&
    (!existingThesis || isResubmitting)

  return (
    <div>
      <Navbar />

      <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Thesis Submission</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
             {user.programme_name || 'Namibia University of Science and Technology'} - {user.degree} Student
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/student')}
          style={{
            backgroundColor: 'transparent', border: '1px solid #002147',
            color: '#002147', padding: '8px 16px', borderRadius: '4px',
            marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
          }}>
          ← Back to Dashboard
        </button>

        {/* Loading proposal/thesis status */}
        {(checkingProposal || loadingThesis) && (
          <LoadingSpinner message="Checking your submission status..." />
        )}

        {/* Proposal not approved */}
        {!checkingProposal && !loadingThesis && !proposalApproved && !submitted && (
          <div style={{
            backgroundColor: '#fce4e4', border: '1px solid #ef5350',
            padding: '25px', borderRadius: '8px',
            textAlign: 'center', color: '#c62828'
          }}>
            <h3 style={{ marginBottom: '10px' }}>🔒 Thesis Submission Locked</h3>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              You cannot submit your thesis until your research proposal
              has been approved by both your supervisor and the HOD.
            </p>
            <p style={{ fontSize: '13px', color: '#666' }}>
              Please check your proposal status on the
              <strong> My Results</strong> page.
            </p>
          </div>
        )}

        {/* Existing thesis view */}
        {!checkingProposal && !loadingThesis && proposalApproved && existingThesis && !isResubmitting && !submitted &&
          renderExistingThesis()}

        {/* Submission / resubmission form */}
        {showForm && (
          <div>

            {/* Resubmission banner */}
            {isResubmitting && (
              <div style={{
                backgroundColor: '#fff3e0', border: '1px solid #ff9800',
                padding: '12px 18px', borderRadius: '8px',
                marginBottom: '20px', fontSize: '13px', color: '#e65100'
              }}>
                ✏️ You're revising your thesis. Your previous title and abstract are filled in below — update them and upload your revised PDF.
              </div>
            )}

            {/* Thesis Title */}
            <div style={{
              backgroundColor: 'white', padding: '25px',
              borderRadius: '8px', marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{
                color: '#8B0000', borderBottom: '2px solid #f0f0f0',
                paddingBottom: '10px', marginBottom: '15px'
              }}>
                Thesis Title
              </h3>
              <input
                type="text" value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your thesis title"
                style={{
                  width: '100%', padding: '10px',
                  border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px'
                }}
              />
            </div>

            {/* Abstract */}
            <div style={{
              backgroundColor: 'white', padding: '25px',
              borderRadius: '8px', marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{
                color: '#8B0000', borderBottom: '2px solid #f0f0f0',
                paddingBottom: '10px', marginBottom: '15px'
              }}>
                Abstract
              </h3>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Enter your thesis abstract..."
                rows={6}
                style={{
                  width: '100%', padding: '10px',
                  border: '1px solid #cccccc', borderRadius: '4px',
                  fontSize: '14px', resize: 'vertical'
                }}
              />
            </div>

            {/* File Upload */}
            <div style={{
              backgroundColor: 'white', padding: '25px',
              borderRadius: '8px', marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{
                color: '#8B0000', borderBottom: '2px solid #f0f0f0',
                paddingBottom: '10px', marginBottom: '15px'
              }}>
                Upload Thesis (PDF only)
              </h3>
              <input
                type="file" accept=".pdf"
                onChange={handleFileChange}
                style={{
                  width: '100%', padding: '10px',
                  border: '1px solid #cccccc', borderRadius: '4px', fontSize: '14px'
                }}
              />
              {file && (
                <div style={{
                  marginTop: '12px', padding: '10px',
                  backgroundColor: '#f0f7ff', borderRadius: '4px',
                  fontSize: '13px', color: '#002147'
                }}>
                  ✅ Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            {/* Declaration */}
            <div style={{
              backgroundColor: 'white', padding: '25px',
              borderRadius: '8px', marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
            }}>
              <h3 style={{
                color: '#8B0000', borderBottom: '2px solid #f0f0f0',
                paddingBottom: '10px', marginBottom: '15px'
              }}>
                Declaration
              </h3>
              <label style={{
                display: 'flex', alignItems: 'flex-start',
                gap: '12px', fontSize: '14px', cursor: 'pointer'
              }}>
                <input
                  type="checkbox" checked={declaration}
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

            {/* Notice */}
            <div style={{
              backgroundColor: '#fff3e0', border: '1px solid #ff9800',
              padding: '15px 20px', borderRadius: '8px',
              marginBottom: '20px', fontSize: '13px', color: '#e65100'
            }}>
              ⚠️ <strong>Note:</strong> Once submitted, your thesis will be
              forwarded to your supervisor for review before going to the HOD.
            </div>

            {/* Submit button */}
     <button
              onClick={handleSubmit}
              style={{
                width: '100%', padding: '14px',
                backgroundColor: '#002147',
                color: 'white', border: 'none', borderRadius: '4px',
                fontSize: '16px', fontWeight: 'bold',
                marginBottom: '30px',
                cursor: 'pointer'
              }}>
              {isResubmitting ? 'Resubmit Thesis' : 'Submit Thesis'}
            </button>

          </div>
        )}

        {/* Success message */}
        {submitted && (
          <div style={{
            backgroundColor: '#e6f4ea', border: '1px solid #4caf50',
            padding: '30px', borderRadius: '8px', textAlign: 'center'
          }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '10px' }}>
              ✅ Thesis {isResubmitting ? 'Resubmitted' : 'Submitted'} Successfully!
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
              Status: <strong>Pending Supervisor Review</strong>
            </p>
            <button
              onClick={() => navigate('/student')}
              style={{
                backgroundColor: '#002147', color: 'white',
                border: 'none', padding: '10px 25px',
                borderRadius: '4px', fontSize: '14px', cursor: 'pointer'
              }}>
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ThesisSubmission