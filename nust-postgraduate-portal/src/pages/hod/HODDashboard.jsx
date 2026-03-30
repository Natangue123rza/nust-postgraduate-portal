// src/pages/hod/HODDashboard.jsx
import Navbar from '../../components/Navbar'
//This is the main page the HOD sees when they logging in

function HODDashboard() {

    return(
     <div>
     {/* Navbar appears at the top of every protected page */}
     <Navbar />

        <div style={{padding: '20px'}}>
            <h1>Hod DashBoard</h1>
            <p>Welcome, HOD</p>
        </div>
        </div>
    )

}


// We export it so other files (like our router) can use it
export default HODDashboard