// src/utils/fakeUsers.js

// This is a fake "database " of users
// Later this will be replaced by real backend API calls
// Each user has a name, password, and role

const fakeUsers = [{
    
    id: 1,
    name: "David Mbidi " ,
    email: "student@nust.na" ,
    password: "student123" ,
    role: "student" ,
    degree: "Masters"   // important! Masters or PHD affects examiner logic

},

{
    id: 2 ,
    name: "Dr. Simon " , 
    email: "hod@nust.na" ,
    password: "hod123" ,
    role: "hod"

},

{

    id: 3 ,
    name: "Prof. Filimon" ,
    email: "supervisor@nust.na" ,
    password: "supervisor123" ,
    role: "supervisor"


},

{
  
    id: 4 , 
    name: "Dr. Kapuire" ,
    email: "examiner@nust.na" ,
    password: "examiner123" ,
    role: "examiner"


},

{
    id: 5,
    name: "Paulina Efriam",
    email: "phdstudent@nust.na",
    password: "phd123",
    role: "student",
    degree: "PhD"  // ← different degree type
}

]


//We export it so other files can import and use it
export default fakeUsers