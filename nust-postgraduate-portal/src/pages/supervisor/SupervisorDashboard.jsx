// src/pages/supervisor/supervisorDashboard.jsx
import Navbar from "../../components/Navbar";
function SupervisorDashboard() {
 
    return(
  
        <div>
        {/* Navbar appears at the top of every protected page */}
        <Navbar />
 
            <div style={{padding: '20px'}}>
            <h1>Superviser Dashboard</h1>
            <p>Welcome, Superviser!</p>
        </div>
        </div>
    )

}



// We export it so other files (like our router) can use it
export default SupervisorDashboard;