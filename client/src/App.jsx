import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import Host from './pages/Host';
import Participant from './pages/Participant';
import AdminDashboard from './pages/AdminDashboard';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const [googleClientId, setGoogleClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.json();
      })
      .then(data => {
        // Prefer server-provided client ID, fallback to build-time env var or default placeholder
        setGoogleClientId(data.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID");
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dynamic config, falling back:', err);
        setGoogleClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#f8fafc',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>Loading configurations...</span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/host" element={<Host />} />
          <Route path="/join/:sessionId?" element={<Participant />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
