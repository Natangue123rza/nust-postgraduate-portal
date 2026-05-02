import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'

function ViewSubmissions() {

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('proposals')
  const [proposals, setProposals] = useState([])
  const [theses, setTheses] = useState([])
  const [progressReports, setProgressReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const proposalsRes = await fetch('http://localhost:5000/api/proposals/all')
        setProposals(await proposalsRes.json())

        const thesesRes = await fetch('http://localhost:5000/api/theses/all')
        setTheses(await thesesRes.json())

        const reportsRes = await fetch('http://localhost:5000/api/progress/all')
        setProgressReports(await reportsRes.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const tabStyle = (tabName) => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: activeTab === tabName ? '3px solid #8B0000' : '3px solid transparent',
    backgroundColor: 'transparent',
    color: activeTab === tabName ? '#002147' : '#666666',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
    fontSize: '14px',
    cursor: 'pointer'
  })

  const statusColor = (status) => {
    if (status === 'Approved' || status === 'Reviewed')
      return { bg: '#e6f4ea', color: '#2e7d32', border: '#4caf50' }
    if (status === 'Rejected')
      return { bg: '#fce4e4', color: '#c62828', border: '#ef5350' }
    if (status === 'Awaiting Examiner Assignment')
      return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' }
    return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' }
  }

  const ViewPDFButton = ({ fileName }) => {
    if (!fileName) return null

    return (
      <a
        href={`http://localhost:5000/api/uploads/${fileName}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: '#002147',
          color: 'white',
          padding: '5px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          textDecoration: 'none'
        }}
      >
        📄 View PDF
      </a>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{
          backgroundColor: '#002147',
          color: 'white',
          padding: '25px 30px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>View All Submissions</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaaaaa', fontSize: '13px' }}>
            Faculty of Computing and Informatics
          </p>
        </div>

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
            cursor: 'pointer'
          }}>
          ← Back to Dashboard
        </button>

        {loading && (
          <p style={{ color: '#666', textAlign: 'center' }}>Loading submissions...</p>
        )}

        {!loading && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #f0f0f0',
              padding: '0 20px'
            }}>
              <button onClick={() => setActiveTab('proposals')} style={tabStyle('proposals')}>
                📄 Proposals ({proposals.length})
              </button>
              <button onClick={() => setActiveTab('theses')} style={tabStyle('theses')}>
                🎓 Theses ({theses.length})
              </button>
              <button onClick={() => setActiveTab('progressReports')} style={tabStyle('progressReports')}>
                📋 Progress Reports ({progressReports.length})
              </button>
            </div>

            <div style={{ padding: '20px' }}>

              {activeTab === 'proposals' && (
                <div>
                  <h3 style={{
                    color: '#002147',
                    marginBottom: '15px',
                    fontSize: '16px',
                    borderLeft: '4px solid #8B0000',
                    paddingLeft: '10px'
                  }}>
                    Research Proposals
                  </h3>

                  {proposals.length === 0 ? (
                    <p style={{ color: '#666' }}>No proposals yet.</p>
                  ) : (
                    proposals.map(item => (
                      <div key={item.id} style={{
                        border: '1px solid #f0f0f0',
                        borderRadius: '6px',
                        padding: '15px 20px',
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#002147' }}>{item.title}</p>
                          <p style={{ fontSize: '13px', color: '#666' }}>
                            {item.student_name} — {item.degree} | {new Date(item.submitted_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <ViewPDFButton fileName={item.file_name} />
                          <span style={{
                            backgroundColor: statusColor(item.status).bg,
                            color: statusColor(item.status).color,
                            border: `1px solid ${statusColor(item.status).border}`,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'theses' && (
                <div>
                  <h3 style={{ color: '#002147', marginBottom: '15px' }}>Thesis Submissions</h3>

                  {theses.map(item => (
                    <div key={item.id} style={{
                      border: '1px solid #f0f0f0',
                      padding: '15px',
                      marginBottom: '10px',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{item.title}</p>
                        <p style={{ fontSize: '13px', color: '#666' }}>
                          {item.student_name} — {item.degree}
                        </p>
                      </div>

                      <ViewPDFButton fileName={item.file_name} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'progressReports' && (
                <div>
                  <h3 style={{ color: '#002147', marginBottom: '15px' }}>Progress Reports</h3>

                  {progressReports.map(item => (
                    <div key={item.id} style={{
                      border: '1px solid #f0f0f0',
                      padding: '15px',
                      marginBottom: '10px'
                    }}>
                      <p><strong>{item.student_name}</strong></p>
                      <p style={{ fontSize: '13px', color: '#666' }}>{item.semester}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewSubmissions