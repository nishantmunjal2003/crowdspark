import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import Host from './pages/Host';
import Participant from './pages/Participant';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/host" element={<Host />} />
        <Route path="/join/:sessionId?" element={<Participant />} />
      </Routes>
    </Router>
  );
}

export default App;
