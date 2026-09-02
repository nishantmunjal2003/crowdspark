# CrowdSpark — Interactive Live Quizzes & AI-Powered Audience Engagement Platform

[![Website](https://img.shields.io/badge/Website-crowdspark.nishantmunjal.com-4f46e5?style=flat&logo=google-chrome&logoColor=white)](https://crowdspark.nishantmunjal.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101.svg?logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**CrowdSpark** is a modern, real-time web platform for hosting gamified live quizzes, interactive assessments, and polls. Powered by built-in AI question generation, synchronized countdown timers, animated leaderboards, and instant CSV/Excel grading exports.

---

## 🌟 Key Features

### 🤖 Instant AI Quiz Generator
- Generate rich multi-question quizzes from any text prompt, topic, subject, or article snippet.
- Custom difficulty levels (*Easy*, *Medium*, *Hard*) and question counts.
- Automatic distractor generation, validated correct answers, and educational explanations.
- Token-based usage tracking with admin allocation controls.

### ⚡ Live Synchronized Multiplayer Engine
- Sub-second bi-directional WebSocket synchronization via **Socket.io**.
- Configurable countdown timers per question (10s, 20s, 30s, 60s, 90s).
- Live real-time response distribution charts displayed to the host before revealing answers.
- Zero-lag participant buzzer and color-coded answer pads.

### 📱 Zero-Friction Mobile Participation
- No app download or account creation required for players.
- Instant access via 6-digit numeric game PIN or auto-generated QR code scan.
- Fully responsive across mobile browsers, tablets, and desktop displays.

### 🏆 Gamification & Animated Leaderboards
- Speed + accuracy dynamic scoring engine.
- Streak multipliers for consecutive correct answers.
- Animated podiums and top-rank transitions after each round and at game completion.

### 📊 Deep Analytics & Export
- Host analytics dashboard summarizing overall accuracy, question difficulty breakdown, and attendance.
- One-click export to **CSV / Excel** formatted reports for grading and classroom records.

### 🔒 Enterprise-Grade Authentication & Security
- **Google OAuth 2.0** One-Tap and standard sign-in.
- **Email & Password** authentication with bcrypt hashing and JWT tokens.
- **Passwordless Email OTP** login & registration powered by ZeptoMail / SMTP.
- Rate-limited API routes and brute-force protection.
- Role-Based Access Control (RBAC) with full **Admin Dashboard**.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Lucide React, Vanilla CSS Design System, Responsive Glassmorphism UI |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB & Mongoose ODM |
| **AI Integration** | Google Gemini API |
| **Email Service** | ZeptoMail API / SMTP Transporter |
| **SEO & GEO** | Schema.org JSON-LD, Dynamic Meta tags, `llms.txt`, `sitemap.xml`, `robots.txt` |

---

## 📂 Project Structure

```text
crowdspark/
├── client/                     # Frontend React SPA
│   ├── public/                 # Static assets, favicon, robots.txt, sitemap.xml, llms.txt
│   ├── src/
│   │   ├── components/         # Navbar, Footer, SEO, ThemeToggle, Modals
│   │   ├── pages/              # Home, About, HowItWorks, Pricing, Login, Dashboard, Host, Participant, etc.
│   │   ├── App.jsx             # React router & OAuth provider setup
│   │   ├── index.css           # Global modern CSS variables and dark/light themes
│   │   └── main.jsx            # React root entry
│   └── package.json
│
├── server/                     # Backend API & Socket.io Server
│   ├── models/                 # Mongoose models (User, Quiz, Question, Session, Otp, ActivityLog)
│   ├── services/               # Mail service (ZeptoMail/SMTP), AI service (Gemini API)
│   ├── index.js                # Express REST API routes & Socket event handlers
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)
- *(Optional)* Google Cloud Console OAuth Client ID
- *(Optional)* Google Gemini API Key (for AI Quiz Generation)
- *(Optional)* ZeptoMail / SMTP credentials (for OTP emails)

### 1. Clone the Repository
```bash
git clone https://github.com/nishantmunjal2003/crowdspark.git
cd crowdspark
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/crowdspark?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# Google Gemini AI (Optional - for AI Quiz Generation)
GEMINI_API_KEY=your_gemini_api_key_here

# ZeptoMail / SMTP Email Configuration (Optional - for OTP verification)
ZEPTOMAIL_API_KEY=your_zeptomail_send_mail_token
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="CrowdSpark"

# Admin Access
ADMIN_EMAIL=admin@yourdomain.com
```

### 3. Install Dependencies & Run

#### Running Both Concurrently:
```bash
npm install
npm run dev
```

#### Or Run Independently:

**Server:**
```bash
cd server
npm install
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

Open your browser at `http://localhost:5173` (or the port specified by Vite).

---

## 🌐 Production Deployment

- **Build Client:**
  ```bash
  cd client
  npm run build
  ```
- **Start Production Server:**
  ```bash
  cd server
  npm start
  ```

---

## 📄 License & Author

- **Author:** [Nishant Munjal](https://nishantmunjal.com)
- **GitHub:** [@nishantmunjal2003](https://github.com/nishantmunjal2003)
- **Live Application:** [https://crowdspark.nishantmunjal.com](https://crowdspark.nishantmunjal.com)

Distributed under the MIT License. See `LICENSE` for more details.
