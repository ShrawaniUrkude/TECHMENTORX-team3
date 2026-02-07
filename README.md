# 🎁 DonateConnect - Donation Management System

A comprehensive full-stack donation management platform connecting **Donors**, **Volunteers**, and **Organizations** to streamline the donation process and help those in need.

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Demo Credentials](#-demo-credentials)
- [Screenshots](#-screenshots)
- [Team](#-team)

---

## ✨ Features

### 🧑‍💼 Donor Dashboard
- **Create Donations** - Select category (food, clothes, medical, books, etc.)
- **Live Tracking** - Track volunteer location in real-time on map
- **Donation History** - View all past donations with status
- **Impact Badges** - Earn badges based on donation milestones
- **Urgent Needs Alerts** - See organizations' urgent requirements

### 🚚 Volunteer Dashboard
- **Available Tasks** - View and accept donation pickup tasks
- **My Tasks** - Manage assigned deliveries
- **QR Code Verification** - Scan to verify deliveries
- **Mission Map** - Geographic view of donation hotspots
- **Digital ID** - Volunteer identification card
- **Points & Rewards** - Gamified volunteer experience

### 🏢 Organization Dashboard
- **Campaign Management** - Create and track donation campaigns
- **Volunteer Management** - View and communicate with volunteers
- **Donations Overview** - Accept/reject incoming donations
- **🚨 Urgent Needs** - Post emergency donation requests with urgency levels
- **👥 Needy Persons Registry** - Manage beneficiary list with OTP verification
- **Messaging System** - Communicate with donors and volunteers

### 🔐 Authentication
- Role-based login (Donor, Volunteer, Organization)
- Separate registration flows for each role
- Demo mode with localStorage fallback

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router DOM** - Navigation
- **Leaflet** - Interactive maps
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB/Mongoose** - Database (optional)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

---

## 📁 Project Structure

```
TECHMENTORX-team3/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── LiveTracking.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── VolunteerDashboard.jsx
│   │   │   ├── OrganizationDashboard.jsx
│   │   │   ├── DonorLogin.jsx
│   │   │   ├── VolunteerLogin.jsx
│   │   │   ├── OrganizationLogin.jsx
│   │   │   └── ...
│   │   ├── context/         # React context
│   │   │   └── AuthContext.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   └── utils/           # Utility functions
│   │       └── location.js
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Express backend
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── donations.js
│   │   ├── volunteers.js
│   │   ├── admin.js
│   │   ├── messages.js
│   │   └── organization.js
│   ├── middleware/          # Middleware
│   │   └── auth.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   └── Donation.js
│   ├── config/              # Configuration
│   │   └── demoData.js
│   ├── server.js
│   └── package.json
│
├── README.md
└── package.json
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShrawaniUrkude/TECHMENTORX-team3.git
   cd TECHMENTORX-team3
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Create Backend Environment File** (optional)
   ```bash
   # backend/.env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/donateconnect
   JWT_SECRET=your-secret-key
   ```

5. **Start the Backend Server**
   ```bash
   cd backend
   node server.js
   # Server runs on http://localhost:5000
   ```

6. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # App runs on http://localhost:5173
   ```

---

## 📖 Usage

### For Donors
1. Click "Donor" on homepage → Login/Register
2. Select a donation category
3. Fill donation details with pickup address
4. Track your donation in real-time
5. Earn impact badges!

### For Volunteers
1. Click "Volunteer" on homepage → Login/Register
2. View available tasks on map
3. Accept a task and pick up donation
4. Use QR verification for delivery
5. Earn points and level up!

### For Organizations
1. Click "Organization" on homepage → Login/Register
2. Create donation campaigns
3. Post urgent needs with priority levels
4. Register needy persons with OTP verification
5. Manage volunteers and track donations

---

## 🔑 Demo Credentials

The app works in **demo mode** without a database. Use any email/password to login, or use:

| Role | Email | Password |
|------|-------|----------|
| Donor | demo@donor.com | password |
| Volunteer | demo@volunteer.com | password |
| Organization | demo@org.com | password |

---

## 📸 Screenshots

### Home Page
- Role selection cards for Donor, Volunteer, Organization
- Animated statistics
- Feature highlights

### Donor Dashboard
- Category-based donation creation
- Live tracking with map
- Impact badges and history

### Volunteer Dashboard
- Mission map with hotspots
- Task management
- Points leaderboard

### Organization Dashboard
- Campaign progress tracking
- Urgent needs management
- OTP-verified beneficiary registry

---

## 👥 Team - TECHMENTORX

| Name | Role |
|------|------|
| Shrawani Urkude | Team Lead |
| Team Member 2 | Developer |
| Team Member 3 | Developer |
| Team Member 4 | Developer |

---

## 📄 License

This project is built for educational/hackathon purposes.

---

## 🙏 Acknowledgments

- React & Vite teams
- TailwindCSS
- Leaflet Maps
- OpenStreetMap contributors

---

**Made with ❤️ by Team TECHMENTORX**