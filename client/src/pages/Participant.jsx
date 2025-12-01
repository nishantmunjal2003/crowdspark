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
    const [theme, setTheme] = useState(null);
    const [feedback, setFeedback] = useState(null); // correct/incorrect
    const [questionActive, setQuestionActive] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);

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
            setQuestionActive(true);
            setTimeLeft(question.timeLimit || 10);
        });

        socket.on('question_results', () => {
            setQuestionActive(false);
        });

        socket.on('quiz_finished', () => {
            setGameState('finished');
        });

        return () => {
            socket.off('quiz_started');
            socket.off('new_question');
            socket.off('question_results');
            socket.off('quiz_finished');
        };
    }, [sessionId, navigate]);

    useEffect(() => {
        let interval;
        if (gameState === 'active' && questionActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, questionActive, timeLeft]);

    const joinSession = (e) => {
        e.preventDefault();
        if (name.trim()) {
            socket.emit('join_session', { sessionId, name }, (response) => {
                if (response.success) {
                    setJoined(true);
                    if (response.theme) {
                        setTheme(response.theme);
                    }
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

    // Background Wrapper with Overlay
    const Background = () => (
        theme?.backgroundImage ? (
            <>
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${theme.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -2,
                }} />
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)', // Dark overlay for contrast
                    backdropFilter: 'blur(5px)',
                    zIndex: -1,
                }} />
            </>
        ) : (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'var(--bg-primary)',
                zIndex: -2,
            }} />
        )
    );

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
            <div className="grid-center" style={{ minHeight: '100vh', textAlign: 'center', padding: '2rem', position: 'relative', color: 'white' }}>
                <Background />
                <div className="animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '100px', height: '100px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem auto',
                        boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)'
                    }}>
                        <Clock size={48} style={{ color: '#a78bfa' }} />
                    </div>
                    <h1 className="title" style={{ fontSize: '3rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>You're in!</h1>
                    <p className="subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>See your name on the big screen?</p>
                    <div className="card" style={{
                        marginTop: '2rem',
                        display: 'inline-block',
                        padding: '1.5rem 4rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <p style={{ fontSize: '1.5rem' }}>Welcome, <b style={{ color: '#a78bfa' }}>{name}</b></p>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'active' && currentQuestion) {
        return (
            <div className="participant-question" style={{ minHeight: '100vh', padding: '1rem', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', position: 'relative', color: 'white' }}>
                <Background />
                <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <span className="timer-badge" style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: '#a78bfa',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <Clock size={16} />
                            {timeLeft}s
                        </span>
                        <h2 className="question-text" style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            marginTop: '1.5rem',
                            lineHeight: '1.4',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            padding: '0 0.5rem'
                        }}>
                            {currentQuestion.text}
                        </h2>

                        {/* Media Display */}
                        {currentQuestion.media && (
                            <div className="question-media" style={{
                                marginTop: '1.5rem',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                background: 'rgba(0, 0, 0, 0.3)',
                                padding: '0.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                {currentQuestion.media.type === 'image' ? (
                                    <img src={currentQuestion.media.data} alt="Question media" style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '0.5rem' }} />
                                ) : (
                                    <video src={currentQuestion.media.data} controls style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '0.5rem' }} />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="options-grid" style={{ display: 'grid', gap: '0.75rem', flex: 1 }}>
                        {currentQuestion.options.map((opt, i) => {
                            const isSelected = submittedAnswer === i;
                            const colors = ['#3b82f6', '#ef4444', '#eab308', '#22c55e']; // Kahoot-ish colors
                            const baseColor = colors[i % colors.length];

                            return (
                                <button
                                    key={i}
                                    onClick={() => submitAnswer(i)}
                                    disabled={submittedAnswer !== null || !questionActive}
                                    className="option-button"
                                    style={{
                                        padding: '1.25rem',
                                        textAlign: 'left',
                                        cursor: (submittedAnswer !== null || !questionActive) ? 'default' : 'pointer',
                                        background: isSelected ? baseColor : 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: `2px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '1rem',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        opacity: (submittedAnswer !== null || !questionActive) && !isSelected ? 0.5 : 1,
                                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                        boxShadow: isSelected ? `0 0 30px ${baseColor}60` : '0 4px 6px rgba(0,0,0,0.1)',
                                        color: 'white',
                                        minHeight: '60px'
                                    }}
                                >
                                    <span className="option-letter" style={{
                                        width: '36px', height: '36px',
                                        background: isSelected ? 'white' : 'rgba(255,255,255,0.1)',
                                        color: isSelected ? baseColor : 'white',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        flexShrink: 0
                                    }}>{String.fromCharCode(65 + i)}</span>
                                    <span className="option-text" style={{ fontSize: '1rem', fontWeight: '500', wordBreak: 'break-word' }}>{opt}</span>
                                </button>
                            );
                        })}
                    </div>

                    {submittedAnswer && (
                        <div className="animate-fade-in feedback-card" style={{
                            marginTop: '1.5rem',
                            textAlign: 'center',
                            padding: '1.5rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '1.5rem',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                            <div style={{
                                width: '60px', height: '60px',
                                background: 'rgba(16, 185, 129, 0.2)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem auto',
                                boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                            }}>
                                <Zap size={32} color="#34d399" fill="#34d399" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Answer Locked!</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Keep your eyes on the host screen.</p>
                        </div>
                    )}

                    {!questionActive && !submittedAnswer && (
                        <div className="animate-fade-in feedback-card" style={{
                            marginTop: '1.5rem',
                            textAlign: 'center',
                            padding: '1.5rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '1.5rem',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            <div style={{
                                width: '60px', height: '60px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem auto',
                                boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
                            }}>
                                <Clock size={32} color="#f87171" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Time's Up!</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>The answer has been revealed.</p>
                        </div>
                    )}
                </div>

                {/* Mobile Responsive Styles */}
                <style>{`
                    @media (max-width: 768px) {
                        .participant-question {
                            padding: 1rem 0.75rem !important;
                        }
                        .question-text {
                            font-size: 1.25rem !important;
                        }
                        .question-media img,
                        .question-media video {
                            max-height: 200px !important;
                        }
                        .option-button {
                            padding: 1rem !important;
                            min-height: 56px !important;
                        }
                        .option-letter {
                            width: 32px !important;
                            height: 32px !important;
                            font-size: 1rem !important;
                        }
                        .option-text {
                            font-size: 0.95rem !important;
                        }
                        .feedback-card {
                            padding: 1.25rem !important;
                        }
                    }
                    @media (max-width: 480px) {
                        .question-text {
                            font-size: 1.1rem !important;
                        }
                        .timer-badge {
                            font-size: 0.8rem !important;
                            padding: 0.4rem 0.8rem !important;
                        }
                        .option-button {
                            padding: 0.875rem !important;
                            gap: 0.5rem !important;
                        }
                        .option-text {
                            font-size: 0.9rem !important;
                        }
                    }
                `}</style>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="grid-center" style={{ minHeight: '100vh', padding: '2rem', position: 'relative' }}>
                <Background />
                <div className="card" style={{
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '3rem 2rem'
                }}>
                    <h1 className="title" style={{ fontSize: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)', color: 'white' }}>Quiz Finished!</h1>
                    <p className="subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Did you make it to the podium?</p>
                    <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginTop: '2rem', width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return <div className="grid-center">Loading...</div>;
}
