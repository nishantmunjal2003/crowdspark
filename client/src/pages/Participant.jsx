import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

export default function Participant() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const [gameState, setGameState] = useState('waiting'); // waiting, active, finished
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [submittedAnswer, setSubmittedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // correct/incorrect

    useEffect(() => {
        if (!sessionId) {
            navigate('/');
            return;
        }

        socket.on('quiz_started', () => {
            setGameState('active');
            setFeedback(null);
        });

        socket.on('new_question', (question) => {
            setCurrentQuestion(question);
            setSubmittedAnswer(null);
            setFeedback(null);
            setGameState('active');
        });

        socket.on('quiz_finished', () => {
            setGameState('finished');
        });

        return () => {
            socket.off('quiz_started');
            socket.off('new_question');
            socket.off('quiz_finished');
        };
    }, [sessionId, navigate]);

    const joinSession = (e) => {
        e.preventDefault();
        if (name.trim()) {
            socket.emit('join_session', { sessionId, name }, (response) => {
                if (response.success) {
                    setJoined(true);
                } else {
                    alert(response.message);
                    navigate('/');
                }
            });
        }
    };

    const submitAnswer = (optionIndex) => {
        if (!submittedAnswer) {
            const letter = String.fromCharCode(65 + optionIndex); // Convert index to A, B, C, D
            setSubmittedAnswer(optionIndex);
            socket.emit('submit_answer', { sessionId, answer: letter });
        }
    };

    if (!joined) {
        return (
            <div className="grid-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <div className="card" style={{ maxWidth: '400px', width: '90%', margin: '0 auto' }}>
                    <h1 className="title" style={{ fontSize: '2rem', textAlign: 'center' }}>Join Session</h1>
                    <p className="subtitle" style={{ textAlign: 'center' }}>Enter your name to join the game.</p>
                    <form onSubmit={joinSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            className="input"
                            placeholder="Your Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                            style={{ padding: '1rem' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Join Game</button>
                    </form>
                </div>
            </div>
        );
    }

    if (gameState === 'waiting') {
        return (
            <div className="grid-center" style={{ minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
                <div className="animate-fade-in">
                    <div style={{
                        width: '100px', height: '100px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem auto'
                    }}>
                        <Clock size={48} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h1 className="title" style={{ fontSize: '2.5rem' }}>You're in!</h1>
                    <p className="subtitle">See your name on the big screen?</p>
                    <div className="card" style={{ marginTop: '2rem', display: 'inline-block', padding: '1rem 3rem' }}>
                        <p style={{ fontSize: '1.2rem' }}>Welcome, <b style={{ color: 'var(--accent)' }}>{name}</b></p>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'active' && currentQuestion) {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <span style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                    }}>
                        LIVE QUESTION
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem', lineHeight: '1.4' }}>
                        {currentQuestion.text}
                    </h2>

                    {/* Media Display */}
                    {currentQuestion.media && (
                        <div style={{ marginTop: '1.5rem', borderRadius: '0.5rem', overflow: 'hidden', background: 'var(--bg-secondary)', padding: '1rem' }}>
                            {currentQuestion.media.type === 'image' ? (
                                <img src={currentQuestion.media.data} alt="Question media" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '0.5rem' }} />
                            ) : (
                                <video src={currentQuestion.media.data} controls style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.5rem' }} />
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gap: '1rem', flex: 1 }}>
                    {currentQuestion.options.map((opt, i) => {
                        const isSelected = submittedAnswer === i;
                        const colors = ['#3b82f6', '#ef4444', '#eab308', '#22c55e']; // Kahoot-ish colors
                        const baseColor = colors[i % colors.length];

                        return (
                            <button
                                key={i}
                                onClick={() => submitAnswer(i)}
                                disabled={submittedAnswer !== null}
                                style={{
                                    padding: '1.5rem',
                                    textAlign: 'left',
                                    cursor: submittedAnswer !== null ? 'default' : 'pointer',
                                    background: isSelected ? baseColor : 'var(--bg-card)',
                                    border: `2px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: '0.75rem',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    opacity: submittedAnswer !== null && !isSelected ? 0.5 : 1,
                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                    boxShadow: isSelected ? `0 0 20px ${baseColor}40` : 'none'
                                }}
                            >
                                <span style={{
                                    width: '40px', height: '40px',
                                    background: isSelected ? 'white' : 'rgba(255,255,255,0.1)',
                                    color: isSelected ? baseColor : 'white',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    flexShrink: 0
                                }}>{String.fromCharCode(65 + i)}</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{opt}</span>
                            </button>
                        );
                    })}
                </div>

                {submittedAnswer && (
                    <div className="animate-fade-in" style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        padding: '1.5rem',
                        background: 'var(--bg-card)',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{
                            width: '60px', height: '60px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem auto'
                        }}>
                            <Zap size={32} color="#10b981" fill="#10b981" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Answer Locked!</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Keep your eyes on the host screen.</p>
                    </div>
                )}
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="grid-center" style={{ minHeight: '100vh', padding: '2rem' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <h1 className="title">Quiz Finished!</h1>
                    <p className="subtitle">Did you make it to the podium?</p>
                    <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return <div className="grid-center">Loading...</div>;
}
