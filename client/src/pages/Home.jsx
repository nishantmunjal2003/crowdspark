import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Presentation } from 'lucide-react';

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
        <div className="grid-center">
            <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
                <h1 className="title">CrowdSpark</h1>
                <p className="subtitle">Ignite engagement with interactive live quizzes & polls. Real-time insights, instant feedback.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
                    {/* Host Card */}
                    <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>
                            <Presentation size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For Facilitators</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Create quizzes, host live sessions, and see real-time results.
                        </p>
                        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%' }}>
                            Create & Host
                        </button>
                    </div>

                    {/* Participant Card */}
                    <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div style={{ marginBottom: '1.5rem', color: 'var(--success)' }}>
                            <Users size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For Participants</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Join a session using a code or QR scan.
                        </p>
                        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter Session Code"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                                Join Session
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
