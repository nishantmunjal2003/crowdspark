import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

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
            {/* Background Effects */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>

            <div className="hero-content animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '1rem',
                        marginBottom: '1.5rem',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                        <Zap size={40} color="#fbbf24" fill="#fbbf24" />
                    </div>
                    <h1 className="title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>CrowdSpark</h1>
                    <p className="subtitle" style={{ marginBottom: '0', fontSize: '1.1rem' }}>Join the conversation. Live.</p>
                </div>

                <div className="card" style={{ padding: '2.5rem 2rem' }}>
                    <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.75rem',
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}>
                                Enter Session Code
                            </label>
                            <input
                                type="text"
                                className="input input-large"
                                placeholder="123 456"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem' }}
                            disabled={!sessionId.trim()}
                        >
                            Join Session <ArrowRight size={20} />
                        </button>
                    </form>
                </div>

                <div className="host-link" onClick={() => navigate('/login')}>
                    Want to host a quiz? <span>Sign in</span>
                </div>
            </div>

            <Footer style={{ position: 'absolute', bottom: 0, zIndex: 20 }} />
        </div>
    );
}
