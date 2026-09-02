import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
    const [sessionId, setSessionId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        try {
            return !!localStorage.getItem('current_user');
        } catch (e) {
            return false;
        }
    });
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            try {
                setIsLoggedIn(!!localStorage.getItem('current_user'));
            } catch (e) {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const handleJoin = (e) => {
        e.preventDefault();
        if (sessionId.trim()) {
            navigate(`/join/${sessionId}`);
        }
    };

    return (
        <div className="hero-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Responsive Navigation */}
            <Navbar />
            {/* Background Effects */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="hero-content-wrapper">
                <div className="hero-content animate-fade-in">
                    <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            padding: '0.85rem',
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
                            borderRadius: '1.15rem',
                            marginBottom: '0.75rem',
                            border: '2px solid rgba(251, 191, 36, 0.2)',
                            boxShadow: '0 8px 32px rgba(251, 191, 36, 0.15)',
                            animation: 'float 6s ease-in-out infinite'
                        }}>
                            <Zap size={36} color="#fbbf24" fill="#fbbf24" />
                        </div>
                        <h1 className="title" style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', marginBottom: '0.25rem' }}>CrowdSpark</h1>
                        <p className="subtitle" style={{ marginBottom: '0.25rem', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', fontWeight: '500' }}>Join the conversation. Live.</p>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Sparkles size={14} color="var(--accent-primary)" />
                            <span>Interactive quizzes & polls in real-time</span>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem 1.75rem', border: '2px solid var(--border-color)' }}>
                        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}>
                                    Enter Session Code
                                </label>
                                <input
                                    type="text"
                                    className="input input-large"
                                    placeholder="ABC123"
                                    value={sessionId}
                                    onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    autoFocus
                                    style={{
                                        border: '2px solid var(--border-color)',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: '700' }}
                                disabled={!sessionId.trim()}
                            >
                                Join Session <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>

                    <div className="host-link" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}>
                        {isLoggedIn ? (
                            <>Want to manage or host quizzes? <span>Go to Dashboard →</span></>
                        ) : (
                            <>Want to host a quiz? <span>Sign in →</span></>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
