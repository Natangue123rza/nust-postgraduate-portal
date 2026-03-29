// src/utils/fakeUsers.js

// This is a fake "database " of users
// Later this will be replaced by real backend API calls
// Each user has a name, password, and role

const fakeUsers = [{
    
    id: 1,
    name: "David Student" ,
    email: "student@nust.na" ,
    password: "student123" ,
    role: "student" ,
    degree: "Masters"   // important! Masters or PHD affects examiner logic

},

{
    id: 2 ,
    name: "Dr. Simon HOD" , 
    email: "hod@nust.na" ,
    password: "hod123" ,
    role: "hod"

},

{

    id: 3 ,
    name: "Prof. Filimon Superviser" ,
    email: "superviser@nust.na" ,
    password: "superviser123" ,
    role: "superviser"


},

{
  
    id: 4 , 
    name: "Dr. Kapuire Examiner " ,
    email: "examiner@nust.na" ,
    password: "examiner123" ,
    role: "examiner"


}

]


//We export it so other files can import and use it
export default App