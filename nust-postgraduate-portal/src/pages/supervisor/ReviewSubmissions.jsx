// src/pages/supervisor/ReviewSubmissions.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function ReviewSubmissions() {

  const navigate = useNavigate()
  const { user } = useAuth()

  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [proposal, setProposal] = useState(null)
  const [thesis, setThesis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDocs, setLoadingDocs] = useState(false)

  // Review form state
  const [proposalStatus, setProposalStatus] = useState('')
  const [proposalComments, setProposalComments] = useState('')
  const [thesisStatus, setThesisStatus] = useState('')
  const [thesisComments, setThesisComments] = useState('')
  const [saving, setSaving] = useState(false)

  const [proposalVersions, setProposalVersions] = useState([])
const [thesisVersions, setThesisVersions] = useState([])
const [showProposalHistory, setShowProposalHistory] = useState(false)
const [showThesisHistory, setShowThesisHistory] = useState(false)

  // Fetch assigned students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/auth/supervisor-students/${user.id}`
        )
        const data = await response.json()
        setStudents(data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [user.id])

  // Fetch student documents when selected
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student)
    setProposal(null)
    setThesis(null)
    setProposalStatus('')
    setProposalComments('')
    setThesisStatus('')
    setThesisComments('')
    setLoadingDocs(true)

    // Fetch versions
const propVersionsRes = await fetch(
  `http://localhost:5000/api/proposals/versions/${student.id}`
)
setProposalVersions(await propVersionsRes.json())

const thesisVersionsRes = await fetch(
  `http://localhost:5000/api/theses/versions/${student.id}`
)
setThesisVersions(await thesisVersionsRes.json())

    try {
      const [propRes, thesisRes] = await Promise.all([
        fetch(`http://localhost:5000/api/proposals/student/${student.id}`),
        fetch(`http://localhost:5000/api/theses/student/${student.id}`)
      ])

      const propData = await propRes.json()
      const thesisData = await thesisRes.json()

      setProposal(propData.length > 0 ? propData[0] : null)
      setThesis(thesisData.length > 0 ? thesisData[0] : null)

    } catch (err) {
      console.error('Error fetching docs:', err)
    } finally {
      setLoadingDocs(false)
    }
  }

  // Review proposal
  const handleProposalReview = async () => {

    if (!proposalStatus) {
      alert('Please select approve or reject.')
      return
    }
    if (!proposalComments) {
      alert('Please add comments.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(
        `http://localhost:5000/api/proposals/supervisor-review/${proposal.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supervisorStatus: proposalStatus,
            supervisorComments: proposalComments
          })
        }
      )
      const data = await response.json()
      if (!response.ok) { alert(data.message); return }

      alert(data.message)
      handleSelectStudent(selectedStudent)

    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSaving(false)
    }
  }

  // Review thesis
  const handleThesisReview = async () => {

    if (!thesisStatus) {
      alert('Please select approve or reject.')
      return
    }
    if (!thesisComments) {
      alert('Please add comments.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(
        `http://localhost:5000/api/theses/supervisor-review/${thesis.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supervisorStatus: thesisStatus,
            supervisorComments: thesisComments
          })
        }
      )
      const data = await response.json()
      if (!response.ok) { alert(data.message); return }

      alert(data.message)
      handleSelectStudent(selectedStudent)

    } catch (err) {
      alert('Could not connect to server.')
    } finally {
      setSaving(false)
    }
  }

  const statusBadge = (status) => {
    const colors = {
      'Pending': { bg: '#fff3e0', color: '#e65100', border: '#ff9800' },
      'Pending Supervisor Review': { bg: '#fff3e0', color: '#e65100', border: '#ff9800' },
      'Revision Required': { bg: '#fce4e4', color: '#c62828', border: '#ef5350' },
      'Pending HDC Review': { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' },
      'Approved': { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' },
      'Awaiting Examiner Assignment': { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' },
    }
    const c = colors[status] || colors['Pending']
    return (
      <span style={{
        backgroundColor: c.bg, color: c.color,
        border: `1px solid ${c.border}`,
        padding: '4px 12px', borderRadius: '12px', fontSize: '12px'
      }}>
        {status}
      </span>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#002147', color: 'white',
          padding: '25px 30px', borderRadius: '8px', marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Review Student Submissions</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Review and approve proposals and theses before they go to HOD
          </p>
        </div>

        <button onClick={() => navigate('/supervisor')} style={{
          backgroundColor: 'transparent', border: '1px solid #002147',
          color: '#002147', padding: '8px 16px', borderRadius: '4px',
          marginBottom: '25px', fontSize: '13px', cursor: 'pointer'
        }}>
          ← Back to Dashboard
        </button>

        {loading && <LoadingSpinner message="Loading students..." />}

        {!loading && students.length === 0 && (
          <div style={{
            backgroundColor: '#fff3e0', border: '1px solid #ff9800',
            padding: '25px', borderRadius: '8px',
            textAlign: 'center', color: '#e65100'
          }}>
            ⏳ No students assigned yet.
          </div>
        )}

        {/* Student cards */}
        {!loading && students.length > 0 && (
          <div>
            <h2 style={{
              color: '#002147', marginBottom: '20px', fontSize: '18px',
              borderLeft: '4px solid #8B0000', paddingLeft: '10px'
            }}>
              Select Student
            </h2>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {students.map(student => (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  style={{
                    backgroundColor: selectedStudent?.id === student.id ? '#002147' : 'white',
                    color: selectedStudent?.id === student.id ? 'white' : '#333',
                    border: '1px solid #dddddd',
                    borderTop: `4px solid ${student.degree === 'PhD' ? '#8B0000' : '#002147'}`,
                    padding: '15px 20px', borderRadius: '8px',
                    cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                  }}>
                  <h3 style={{ marginBottom: '6px', fontSize: '14px' }}>{student.name}</h3>
                  <span style={{
                    backgroundColor: student.degree === 'PhD' ? '#8B0000' : '#002147',
                    color: 'white', padding: '2px 8px',
                    borderRadius: '12px', fontSize: '11px'
                  }}>
                    {student.degree}
                  </span>
                </div>
              ))}
            </div>

            {/* Loading docs */}
            {loadingDocs && <LoadingSpinner message="Loading submissions..." />}

            {/* Student submissions */}
            {selectedStudent && !loadingDocs && (
              <div>

                {/* PROPOSAL SECTION */}
                <div style={{
                  backgroundColor: 'white', padding: '25px',
                  borderRadius: '8px', marginBottom: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                }}>
                  <h3 style={{
                    color: '#8B0000', borderBottom: '2px solid #f0f0f0',
                    paddingBottom: '10px', marginBottom: '15px'
                  }}>
                    📄 Research Proposal
                  </h3>

                  {!proposal ? (
                    <p style={{ color: '#666', fontSize: '13px' }}>
                      No proposal submitted yet.
                    </p>
                  ) : (
                    <div>
                      {/* Proposal info */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '12px'
                      }}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '4px' }}>
                            {proposal.title}
                          </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
  <span style={{
    backgroundColor: '#8B0000', color: 'white',
    padding: '2px 8px', borderRadius: '12px', fontSize: '11px'
  }}>
    Version {proposal.version}
  </span>
  <span style={{ fontSize: '12px', color: '#666' }}>
    Submitted: {new Date(proposal.submitted_at).toLocaleDateString()}
  </span>
  {proposalVersions.length > 1 && (
    <button
      onClick={() => setShowProposalHistory(!showProposalHistory)}
      style={{
        backgroundColor: 'transparent',
        border: '1px solid #002147',
        color: '#002147',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        cursor: 'pointer'
      }}>
      {showProposalHistory ? 'Hide History' : 'View History'}
    </button>
  )}
</div>

{/* Version history */}
{showProposalHistory && proposalVersions.length > 1 && (
  <div style={{
    backgroundColor: '#f9f9f9',
    border: '1px solid #dddddd',
    borderRadius: '6px',
    padding: '12px',
    marginTop: '10px'
  }}>
    <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '8px', fontSize: '13px' }}>
      Submission History:
    </p>
    {proposalVersions.map(version => (
      <div key={version.id} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0',
        borderBottom: '1px solid #eeeeee',
        fontSize: '12px'
      }}>
        <div>
          <span style={{
            backgroundColor: '#002147', color: 'white',
            padding: '1px 6px', borderRadius: '8px', fontSize: '10px',
            marginRight: '8px'
          }}>
            v{version.version}
          </span>
          {new Date(version.submitted_at).toLocaleDateString()}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {version.file_name && (
            
             <a href={'http://localhost:5000/api/uploads/' + version.file_name}
              target="_blank" rel="noopener noreferrer"
              style={{
                backgroundColor: '#002147', color: 'white',
                padding: '2px 8px', borderRadius: '4px',
                fontSize: '11px', textDecoration: 'none'
              }}>
              View PDF
            </a>
          )}
          <span style={{
            color: version.supervisor_status === 'approved' ? '#2e7d32' :
              version.supervisor_status === 'rejected' ? '#c62828' : '#e65100',
            fontSize: '11px'
          }}>
            {version.supervisor_status === 'approved' ? '✅ Approved' :
              version.supervisor_status === 'rejected' ? '❌ Revision Requested' :
              '⏳ Pending'}
          </span>
        </div>
      </div>
    ))}
  </div>
)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {proposal.file_name && (
                            
                            <a  href={`http://localhost:5000/api/uploads/${proposal.file_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                backgroundColor: '#002147', color: 'white',
                                padding: '5px 12px', borderRadius: '4px',
                                fontSize: '12px', textDecoration: 'none'
                              }}>
                              📄 View PDF
                            </a>
                          )}
                          {statusBadge(proposal.supervisor_status === 'approved'
                            ? 'Approved' : proposal.supervisor_status === 'rejected'
                            ? 'Revision Required' : 'Pending Supervisor Review'
                          )}
                        </div>
                      </div>

                      {/* Existing supervisor comments */}
                      {proposal.supervisor_comments && (
                        <div style={{
                          backgroundColor: '#f5f5f5', padding: '10px',
                          borderRadius: '4px', fontSize: '13px',
                          color: '#333', marginBottom: '12px'
                        }}>
                          <strong>Your previous comments:</strong> {proposal.supervisor_comments}
                        </div>
                      )}

                      {/* Review form - only if pending */}
                      {proposal.supervisor_status === 'Pending' && (
                        <div style={{
                          border: '2px solid #002147', padding: '15px',
                          borderRadius: '6px', marginTop: '12px'
                        }}>
                          <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '10px' }}>
                            Your Review:
                          </p>

                          <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                value="approved"
                                checked={proposalStatus === 'approved'}
                                onChange={(e) => setProposalStatus(e.target.value)}
                              />
                              ✅ Approve — Forward to HOD
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                value="rejected"
                                checked={proposalStatus === 'rejected'}
                                onChange={(e) => setProposalStatus(e.target.value)}
                              />
                              ❌ Request Revision
                            </label>
                          </div>

                          <textarea
                            value={proposalComments}
                            onChange={(e) => setProposalComments(e.target.value)}
                            placeholder="Add your comments for the student..."
                            rows={3}
                            style={{
                              width: '100%', padding: '10px',
                              border: '1px solid #cccccc', borderRadius: '4px',
                              fontSize: '14px', resize: 'vertical', marginBottom: '12px'
                            }}
                          />

                          <button
                            onClick={handleProposalReview}
                            disabled={saving}
                            style={{
                              backgroundColor: saving ? '#cccccc' : '#002147',
                              color: 'white', border: 'none',
                              padding: '10px 20px', borderRadius: '4px',
                              fontSize: '14px', fontWeight: 'bold',
                              cursor: saving ? 'not-allowed' : 'pointer'
                            }}>
                            {saving ? 'Saving...' : 'Submit Review'}
                          </button>
                        </div>
                      )}

                      {/* Already reviewed */}
                      {proposal.supervisor_status !== 'Pending' && (
                        <div style={{
                          backgroundColor: proposal.supervisor_status === 'approved' ? '#e6f4ea' : '#fce4e4',
                          padding: '10px', borderRadius: '4px',
                          fontSize: '13px',
                          color: proposal.supervisor_status === 'approved' ? '#2e7d32' : '#c62828'
                        }}>
                          {proposal.supervisor_status === 'approved'
                            ? '✅ You approved this proposal — forwarded to HOD'
                            : '❌ You requested revisions — awaiting student resubmission'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* THESIS SECTION */}
                <div style={{
                  backgroundColor: 'white', padding: '25px',
                  borderRadius: '8px', marginBottom: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                }}>
                  <h3 style={{
                    color: '#8B0000', borderBottom: '2px solid #f0f0f0',
                    paddingBottom: '10px', marginBottom: '15px'
                  }}>
                    🎓 Thesis Submission
                  </h3>

                  {!thesis ? (
                    <p style={{ color: '#666', fontSize: '13px' }}>
                      No thesis submitted yet.
                    </p>
                  ) : (
                    <div>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '12px'
                      }}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '4px' }}>
                            {thesis.title}
                          </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
  <span style={{
    backgroundColor: '#8B0000', color: 'white',
    padding: '2px 8px', borderRadius: '12px', fontSize: '11px'
  }}>
    Version {thesis.version}
  </span>
  <span style={{ fontSize: '12px', color: '#666' }}>
    Submitted: {new Date(thesis.submitted_at).toLocaleDateString()}
  </span>
  {thesisVersions.length > 1 && (
    <button
      onClick={() => setShowThesisHistory(!showThesisHistory)}
      style={{
        backgroundColor: 'transparent',
        border: '1px solid #002147',
        color: '#002147',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        cursor: 'pointer'
      }}>
      {showThesisHistory ? 'Hide History' : 'View History'}
    </button>
  )}
</div>

{/* Thesis version history */}
{showThesisHistory && thesisVersions.length > 1 && (
  <div style={{
    backgroundColor: '#f9f9f9',
    border: '1px solid #dddddd',
    borderRadius: '6px',
    padding: '12px',
    marginTop: '10px'
  }}>
    <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '8px', fontSize: '13px' }}>
      Submission History:
    </p>
    {thesisVersions.map(version => (
      <div key={version.id} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0',
        borderBottom: '1px solid #eeeeee',
        fontSize: '12px'
      }}>
        <div>
          <span style={{
            backgroundColor: '#8B0000', color: 'white',
            padding: '1px 6px', borderRadius: '8px', fontSize: '10px',
            marginRight: '8px'
          }}>
            v{version.version}
          </span>
          {new Date(version.submitted_at).toLocaleDateString()}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {version.file_name && (
            
            <a  href={'http://localhost:5000/api/uploads/' + version.file_name}
              target="_blank" rel="noopener noreferrer"
              style={{
                backgroundColor: '#8B0000', color: 'white',
                padding: '2px 8px', borderRadius: '4px',
                fontSize: '11px', textDecoration: 'none'
              }}>
              View PDF
            </a>
          )}
          <span style={{
            color: version.supervisor_status === 'approved' ? '#2e7d32' :
              version.supervisor_status === 'rejected' ? '#c62828' : '#e65100',
            fontSize: '11px'
          }}>
            {version.supervisor_status === 'approved' ? '✅ Approved' :
              version.supervisor_status === 'rejected' ? '❌ Revision Requested' :
              '⏳ Pending'}
          </span>
        </div>
      </div>
    ))}
  </div>
)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {thesis.file_name && (
                            
                           <a   href={`http://localhost:5000/api/uploads/${thesis.file_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                backgroundColor: '#8B0000', color: 'white',
                                padding: '5px 12px', borderRadius: '4px',
                                fontSize: '12px', textDecoration: 'none'
                              }}>
                              📄 View PDF
                            </a>
                          )}
                          {statusBadge(thesis.supervisor_status === 'approved'
                            ? 'Approved' : thesis.supervisor_status === 'rejected'
                            ? 'Revision Required' : 'Pending Supervisor Review'
                          )}
                        </div>
                      </div>

                      {/* Existing comments */}
                      {thesis.supervisor_comments && (
                        <div style={{
                          backgroundColor: '#f5f5f5', padding: '10px',
                          borderRadius: '4px', fontSize: '13px',
                          color: '#333', marginBottom: '12px'
                        }}>
                          <strong>Your previous comments:</strong> {thesis.supervisor_comments}
                        </div>
                      )}

                      {/* Review form */}
                      {thesis.supervisor_status === 'Pending' && (
                        <div style={{
                          border: '2px solid #002147', padding: '15px',
                          borderRadius: '6px', marginTop: '12px'
                        }}>
                          <p style={{ fontWeight: 'bold', color: '#002147', marginBottom: '10px' }}>
                            Your Review:
                          </p>

                          <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                value="approved"
                                checked={thesisStatus === 'approved'}
                                onChange={(e) => setThesisStatus(e.target.value)}
                              />
                              ✅ Approve — Begin Grading
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                value="rejected"
                                checked={thesisStatus === 'rejected'}
                                onChange={(e) => setThesisStatus(e.target.value)}
                              />
                              ❌ Request Revision
                            </label>
                          </div>

                          <textarea
                            value={thesisComments}
                            onChange={(e) => setThesisComments(e.target.value)}
                            placeholder="Add your comments for the student..."
                            rows={3}
                            style={{
                              width: '100%', padding: '10px',
                              border: '1px solid #cccccc', borderRadius: '4px',
                              fontSize: '14px', resize: 'vertical', marginBottom: '12px'
                            }}
                          />

                          <button
                            onClick={handleThesisReview}
                            disabled={saving}
                            style={{
                              backgroundColor: saving ? '#cccccc' : '#002147',
                              color: 'white', border: 'none',
                              padding: '10px 20px', borderRadius: '4px',
                              fontSize: '14px', fontWeight: 'bold',
                              cursor: saving ? 'not-allowed' : 'pointer'
                            }}>
                            {saving ? 'Saving...' : 'Submit Review'}
                          </button>
                        </div>
                      )}

                      {/* Already reviewed */}
                      {thesis.supervisor_status !== 'Pending' && (
                        <div style={{
                          backgroundColor: thesis.supervisor_status === 'approved' ? '#e6f4ea' : '#fce4e4',
                          padding: '10px', borderRadius: '4px',
                          fontSize: '13px',
                          color: thesis.supervisor_status === 'approved' ? '#2e7d32' : '#c62828'
                        }}>
                          {thesis.supervisor_status === 'approved'
                            ? '✅ You approved this thesis — grading is now active'
                            : '❌ You requested revisions — awaiting student resubmission'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewSubmissions