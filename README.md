# NUST Postgraduate Research Management Portal

A web application for managing the postgraduate research lifecycle at the Namibia University of Science and Technology (Faculty of Computing and Informatics) — from research proposal submission and approval, through ethics, progress reporting, thesis submission and examination, to the approval and release of final results.

Built as a final-year Software Development project.

## Overview

The portal replaces a manual, email-based process with a single system that guides each research project through the correct steps and enforces the right approvals at every stage. Access follows a defined chain of authority:

**Super Admin → Faculty HDC Representative → Postgraduate Coordinator → Supervisor → Student**

External examiners are brought in only to mark theses. Non-postgraduate users (undergraduates and other staff) get a limited view of postgraduate news, announcements and upcoming presentations.

## Tech stack

- **Frontend:** React, Vite, React Router DOM, JavaScript
- **Backend:** Node.js, Express, JWT authentication, Multer (file uploads)
- **Database:** MySQL (run via XAMPP in development)

## Features

- Role-based access and dashboards for every role
- Proposal submission with versioning, supervisor review, and two-evaluator endorsement
- Faculty (HDC) approval recording, with approvals visible at faculty level
- In-system ethics application
- Semester-aware progress reporting (skips gap semesters)
- Thesis submission and examiner assignment (internal supervisor + external examiner(s))
- Structured examiner evaluation: five weighted sections totalling 100, with a live total and a recommendation
- Automated mark calculation with discrepancy handling — the 20-point rule, outlier exclusion, and a pass/fail check
- Results approval chain and controlled release of the final mark to the student

## Getting started

### Prerequisites
- Node.js and npm
- XAMPP (or any MySQL server) with phpMyAdmin
- Git

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Natangue123rza/nust-postgraduate-portal.git
   cd nust-postgraduate-portal
   ```
2. Start MySQL in XAMPP, open phpMyAdmin, create a database named `nust_portal`, and import the schema from `database/nust_portal.sql`.
3. Confirm the database connection settings in the backend (`backend/db.js`) match your local MySQL (host, user, password, database).
4. Install dependencies:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```
5. Run the backend (port 5000):
   ```bash
   cd backend && npm run dev
   ```
6. In a new terminal, run the frontend (port 5173):
   ```bash
   npm run dev
   ```
7. Open the frontend URL in your browser and sign in with one of the demo accounts below.

## Demo accounts

> For demonstration only. Passwords are plain text and must be removed or secured before any production use.

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@nust.na | super123 |
| Faculty HDC Representative | faculty.rep@nust.na | rep123 |
| Postgraduate Coordinator | coordinator@nust.na | coord123 |
| Supervisor | simon.muchinenyika@nust.na | supervisor123 |
| External Examiner | examiner@nust.na | examiner123 |
| Master's Student | 222012345@nust.na | student123 |
| PhD Student | 221098765@nust.na | phd123 |

The full list of demonstration accounts is in the project documentation.

## Project structure

```
nust-postgraduate-portal/
├── src/              # React frontend
│   ├── pages/        # screens grouped by role
│   ├── components/   # shared UI (navbar, loading, etc.)
│   └── context/      # authentication context and route protection
├── backend/          # Node.js + Express API
│   ├── routes/       # API route modules (proposals, evaluations, auth, uploads, ...)
│   ├── db.js         # MySQL connection pool
│   └── uploads/      # uploaded PDF files
├── database/         # database schema (nust_portal.sql)
└── docs/             # project documentation
```

## Documentation

Full software design and developer documentation is in the `docs/` folder — system architecture, role hierarchy, process flow diagrams, the ER diagram, database design, setup, and handover notes.

## Known limitations / future work

- Production should authenticate against the university's single sign-on (Active Directory) instead of maintaining local accounts.
- Final marks are obtained through ITS in production; the supervisor-release step here models that flow for demonstration.
- Some research requires external clearance (a faculty letter to the relevant ministry or organisation); this is not yet modelled and is planned future work.
- Demonstration passwords are stored in plain text and must be hashed or replaced by single sign-on for production.

## Author

- **Name:** David Mbidi
- **Student Number:** 222017813
- **Programme:** Software Development
- **Faculty:** Computing and Informatics, Namibia University of Science and Technology
- **Supervisor:** Dr. Simon Muchinenyika
