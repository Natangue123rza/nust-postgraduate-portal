// src/pages/examiner/examinerDashboard.jsx
import Navbar from '../../components/Navbar'

// This is the main page a examiner sees after loggin in

function ExaminerDashboard() {

    return(

        <div>

            {/* Navbar appears at the top of every protected page */}
            <Navbar />
            <div style={{
                padding: '20px'
            }}>
            <h1>Examiner DashBoard</h1>
            <p>Welcome, Examiner!</p>
        </div>
        </div>
    )
}

// We export it so other files (like our router) can use it

export default ExaminerDashboard;