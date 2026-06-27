EduTech - School Management System
A comprehensive school/college management platform built with the MERN stack (MongoDB, Express.js, React, Node.js) and styled with Tailwind CSS. It features distinct portals for Administrators, Teachers, and Students, alongside attendance tracking, assignment management, timetable schedules, academic result publishing, and secure OTP verification.

🚀 Features
🔑 Authentication & Security
Role-Based Access Control: Secure login and dashboards for Admin, Teacher, and Student roles.
OTP Verification: SMS/Email verification for registration, password reset, and changes (powered by Fast2SMS).
Email Verification: Verification steps for securing accounts.
🏢 Administrator Portal
Staff & Student Management: Full CRUD operations to onboard, update, and manage teacher and student profiles.
Department/Branch Administration: Organization of semesters, branches, and class divisions.
System Audits: Access to system-wide logs and configurations.
👨‍🏫 Teacher Portal
Attendance Tracker: Seamless attendance marking and historic log edits for students.
Grade & Results Management: Class-wise result updates, publication, and editing.
Assignments & Timetables: Post assignments and set up weekly classes.
👨‍🎓 Student Portal
Personal Dashboard: Real-time overview of attendance percentage, pending assignments, and timetable schedules.
Gradebook: View published exam results and semester grades.
📁 Folder Structure
School Management System/
├── backend/                   # Node.js + Express + Mongoose Backend
│   ├── middleware/            # JWT authentication & authorization middleware
│   ├── models/                # MongoDB Schema models (User, Student, Faculty, etc.)
│   ├── routes/                # Express API endpoints
│   ├── utils/                 # Utility functions (SMS, OTP generators)
│   ├── server.js              # Entry point of the backend server
│   ├── reset_admin.js         # Admin user reset utility script
│   ├── reset_db.js            # Database reset utility script
│   └── package.json           # Backend dependencies and run scripts
│
├── school-management-frontend/ # React + Vite + Tailwind CSS Frontend
│   ├── public/                # Static assets and icons
│   ├── src/                   # React application source code
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components grouped by role (admin, auth, student, teacher)
│   │   ├── services/          # API services using Axios
│   │   ├── utils/             # Helper utilities
│   │   ├── App.jsx            # Main app router mapping
│   │   └── main.jsx           # ReactDOM entry point
│   ├── index.html             # HTML template entry
│   ├── vite.config.js         # Vite compilation configuration
│   └── package.json           # Frontend dependencies and scripts
│
└── README.md                  # Project documentation (this file)
🛠️ Local Installation & Setup
Prerequisites
Node.js (v18 or higher recommended)
MongoDB (Local installation or MongoDB Atlas URI)
Setup Instructions
Clone the Repository

git clone <your-repository-url>
cd "School Management System"
Configure the Backend

Navigate to the backend folder:
cd backend
Install dependencies:
npm install
Create a .env file in the backend directory with the following variables:
PORT=5000
MONGO_URI=mongodb://localhost:27017/collage_management_fresh
JWT_SECRET=your_jwt_secret_key_here
FAST2SMS_API_KEY=your_fast2sms_api_key_here
(Optional) Seed/Reset Admin password:
node reset_admin.js
Start the backend server:
npm start
Configure the Frontend

Navigate to the school-management-frontend folder:
cd ../school-management-frontend
Install dependencies:
npm install
Start the frontend dev server:
npm run dev
Open your browser to http://localhost:5173.
🌐 Deployment Guidelines
Frontend (Netlify Deployment)
Set up a new site on Netlify connected to your GitHub repository.
Configure build settings:
Base directory: school-management-frontend
Build command: npm run build
Publish directory: school-management-frontend/dist
If using React Router, create a netlify.toml file or a _redirects file in the public folder to support SPA routing:
/*    /index.html   200
Backend (Render or Heroku Deployment)
Create a Web Service on your hosting provider (e.g., Render).
Configure settings:
Root directory: backend
Build Command: npm install
Start Command: node server.js
Add Environment Variables:
Set MONGO_URI (pointing to your Atlas cluster), JWT_SECRET, and FAST2SMS_API_KEY.
// .gitignore

Logs
logs .log npm-debug.log yarn-debug.log* pnpm-debug.log* lerna-debug.log*

Dependency directories
node_modules/

Build outputs
dist/ dist-ssr/ build/ out/

Environment files (Crucial for API keys and secrets)
.env .env.local .env.development.local .env.test.local .env.production.local .env.*.local backend/.env

Editor directories and files
.vscode/* !.vscode/extensions.json .idea/ .DS_Store *.suo .ntvs *.njsproj *.sln *.sw?

Temporary files
tmp/ temp/

// vscode (Settings)

{ "css.lint.unknownAtRules": "ignore", "tailwindCSS.experimental.classRegex": [ [ "cn\(([^)])\)", "(?:'|"|)([^'\"])(?:'|"|`)" ] ] }
