# Learning App - Live Quiz Platform

A real-time interactive quiz platform similar to Kahoot.

## Tech Stack
- **Frontend:** Vite + React + Tailwind (via CSS variables)
- **Backend:** Node.js + Express + Socket.io
- **Real-time:** Socket.io for bi-directional communication

## Features
- **Host:** Create quizzes, generate session codes (QR), control live game flow.
- **Participant:** Join via code/QR, answer in real-time.
- **Live Results:** Real-time bar charts and leaderboards.

## How to Run

### Prerequisites
- Node.js installed.

### 1. Start the Server (Backend)
```bash
cd server
npm install
npm start
```
Runs on `http://localhost:3001`.

### 2. Start the Client (Frontend)
```bash
cd client
npm install
npm run dev
```
Runs on `http://localhost:5173`.

## Usage
1. Open `http://localhost:5173` in your browser.
2. **Host:** Click "Create & Host" -> "Create Session" to start a lobby.
3. **Participant:** Open `http://localhost:5173` in another tab/device, enter the Session ID (displayed on Host screen), and join.
