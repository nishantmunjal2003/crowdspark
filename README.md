# CrowdSpark - Real-time Quiz & Poll Platform

**CrowdSpark** is a real-time interactive audience engagement platform similar to Kahoot. Create quizzes and polls, host live sessions, and engage your audience instantly.

## 🚀 Tech Stack
- **Frontend:** Vite + React + Modern CSS (Glassmorphism)
- **Backend:** Node.js + Express + Socket.io
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.io for bi-directional communication

## ✨ Features
- **Create & Manage:** Design custom quizzes and polls with a beautiful "Midnight Glass" UI.
- **Live Hosting:** Generate session codes, control game flow, and see live responses.
- **Real-time Analytics:** Watch results stream in with animated bar charts and leaderboards.
- **Persistent Storage:** All quizzes and response history are saved to MongoDB.
- **Export Data:** Download session results as CSV files for analysis.

## 🛠️ How to Run

### Prerequisites
- Node.js installed.
- MongoDB Atlas account (or local MongoDB).

### 1. Setup Environment
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

### 2. Start the App (Development)
You can run both client and server with one command from the root:
```bash
npm install
npm run dev
```

Or run them separately:

**Server:**
```bash
cd server
npm install
npm start
```

**Client:**
```bash
cd client
npm install
npm run dev
```

## 📦 Deployment
This app is ready for deployment on platforms like Render, Heroku, or Railway.
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
