import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';
import Footer from '../components/Footer';

import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
    const [sessionId, setSessionId] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (sessionId.trim()) {
            navigate(`/join/${sessionId}`);
        }
    };

    return (
        <div className="hero-container">
            {/* Navigation Bar */}
            <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'transform 0.3s' }} onClick={() => navigate('/')} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <div style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        padding: '0.5rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Zap size={24} color="white" fill="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CrowdSpark</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <span onClick={() => navigate('/about')} style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', transition: 'all 0.3s', fontSize: '0.95rem' }} onMouseOver={(e) => { e.target.style.color = 'var(--text-primary)'; e.target.style.transform = 'translateY(-2px)'; }} onMouseOut={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.transform = 'translateY(0)'; }}>About</span>
                    <span onClick={() => navigate('/pricing')} style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', transition: 'all 0.3s', fontSize: '0.95rem' }} onMouseOver={(e) => { e.target.style.color = 'var(--text-primary)'; e.target.style.transform = 'translateY(-2px)'; }} onMouseOut={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.transform = 'translateY(0)'; }}>Pricing</span>
                    <ThemeToggle />
                </div>
            </nav>
            {/* Background Effects */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="hero-content animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
                        borderRadius: '1.5rem',
                        marginBottom: '2rem',
                        border: '2px solid rgba(251, 191, 36, 0.2)',
                        boxShadow: '0 8px 32px rgba(251, 191, 36, 0.15)',
                        animation: 'float 6s ease-in-out infinite'
                    }}>
                        <Zap size={48} color="#fbbf24" fill="#fbbf24" />
                    </div>
                    <h1 className="title" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '1rem' }}>CrowdSpark</h1>
                    <p className="subtitle" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.3rem)', fontWeight: '500' }}>Join the conversation. Live.</p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <Sparkles size={16} color="var(--accent-primary)" />
                        <span>Interactive quizzes & polls in real-time</span>
                    </div>
                </div>

                <div className="card" style={{ padding: '2.5rem 2rem', background: 'rgba(31, 41, 55, 0.6)', border: '2px solid var(--border-color)' }}>
                    <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '1rem',
                                color: 'var(--text-secondary)',
                                fontSize: '0.875rem',
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
                                    background: 'rgba(10, 14, 26, 0.8)',
                                    border: '2px solid var(--border-color)',
                                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem', fontWeight: '700' }}
                            disabled={!sessionId.trim()}
                        >
                            Join Session <ArrowRight size={22} />
                        </button>
                    </form>
                </div>

                <div className="host-link" onClick={() => navigate('/login')}>
                    Want to host a quiz? <span>Sign in →</span>
                </div>
            </div>

            <Footer style={{ position: 'absolute', bottom: 0, zIndex: 20 }} />
        </div>
    );
}
