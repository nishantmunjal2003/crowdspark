import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { socket } from '../socket';
import { Play, ChevronRight, Trophy, Users, BarChart2, ArrowLeft, CheckCircle, Clock, Sun, Moon, Copy, Check } from 'lucide-react';

export default function Host() {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState('lobby');
    const [quizData, setQuizData] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [stats, setStats] = useState({ A: 0, B: 0, C: 0, D: 0 });
    const [leaderboard, setLeaderboard] = useState([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [timer, setTimer] = useState(0);
    const [copied, setCopied] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('host_theme');
        return saved ? saved === 'dark' : true; // default dark
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('host_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    const handleCopyCode = () => {
        if (!sessionId) return;
        navigator.clipboard.writeText(sessionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getAvatarGradient = (name, index) => {
        const gradients = [
            'linear-gradient(135deg, #6366f1, #8b5cf6)',
            'linear-gradient(135deg, #ec4899, #f43f5e)',
            'linear-gradient(135deg, #10b981, #14b8a6)',
            'linear-gradient(135deg, #f59e0b, #ef4444)',
            'linear-gradient(135deg, #3b82f6, #06b6d4)',
            'linear-gradient(135deg, #8b5cf6, #d946ef)'
        ];
        return gradients[index % gradients.length];
    };

    const leaveHostSession = () => {
        sessionStorage.removeItem('host_sessionId');
        sessionStorage.removeItem('host_quiz');
        navigate('/dashboard');
    };

    useEffect(() => {
        let quiz = location.state?.quiz;

        if (!quiz) {
            const savedQuiz = sessionStorage.getItem('host_quiz');
            if (savedQuiz) {
                try {
                    quiz = JSON.parse(savedQuiz);
                } catch (e) {
                    console.error('Failed to parse saved host quiz:', e);
                }
            }
        }

        if (!quiz) {
            navigate('/dashboard');
            return;
        }

        setQuizData(quiz);
        sessionStorage.setItem('host_quiz', JSON.stringify(quiz));

        const existingSessionId = sessionStorage.getItem('host_sessionId');

        socket.emit('create_session', { quizData: quiz, existingSessionId }, (response) => {
            if (response && response.sessionId) {
                setSessionId(response.sessionId);
                sessionStorage.setItem('host_sessionId', response.sessionId);
                if (response.reclaimed && Array.isArray(response.participants)) {
                    setParticipants(response.participants);
                }
            }
        });
    }, [navigate, location]);

    useEffect(() => {
        let interval;
        if (step === 'game' && !showAnswer && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        revealAnswer();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, showAnswer, timer]);

    useEffect(() => {
        socket.on('participant_joined', (data) => {
            setParticipants(prev => {
                if (prev.some(p => p.name.trim().toLowerCase() === data.name.trim().toLowerCase())) {
                    return prev;
                }
                return [...prev, data];
            });
        });

        socket.on('participant_left', (data) => {
            setParticipants(prev => prev.filter(p => p.name.trim().toLowerCase() !== data.name.trim().toLowerCase()));
        });

        socket.on('live_stats_update', (newStats) => {
            setStats(newStats);
        });

        socket.on('question_results', (newStats) => {
            setStats(newStats);
        });

        socket.on('quiz_finished', (finalLeaderboard) => {
            setLeaderboard(finalLeaderboard);
            setStep('results');
        });

        return () => {
            socket.off('participant_joined');
            socket.off('participant_left');
            socket.off('live_stats_update');
            socket.off('question_results');
            socket.off('quiz_finished');
        };
    }, []);

    const startQuiz = () => {
        socket.emit('start_quiz', { sessionId });
        setStep('game');
        setCurrentQuestionIndex(0);
        setShowAnswer(false);
        setStats({ A: 0, B: 0, C: 0, D: 0 });
        setTimer(quizData.questions[0].timeLimit || 10);
    };

    const nextQuestion = () => {
        socket.emit('next_question', { sessionId });
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setShowAnswer(false);
        setStats({ A: 0, B: 0, C: 0, D: 0 });
        if (quizData.questions[nextIndex]) {
            setTimer(quizData.questions[nextIndex].timeLimit || 10);
        }
    };

    const revealAnswer = () => {
        setShowAnswer(true);
        socket.emit('show_results', { sessionId });
    };

    const renderContent = () => {
        if (!quizData || !sessionId) {
            return (
                <div className="grid-center" style={{ minHeight: '100vh' }}>
                    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: '4px solid rgba(139, 92, 246, 0.2)',
                            borderTop: '4px solid var(--accent-primary, #8b5cf6)',
                            borderRadius: '50%',
                            margin: '0 auto 1rem auto',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p className="subtitle">Setting up your quiz...</p>
                    </div>
                </div>
            );
        }

        if (step === 'lobby') {
            const joinUrl = `${window.location.origin}/join/${sessionId}`;
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem 2.5rem',
                    boxSizing: 'border-box',
                    maxWidth: '1600px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    {/* Top Navigation Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={leaveHostSession}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>

                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <h1 style={{
                                fontSize: '1.75rem',
                                fontWeight: 800,
                                margin: 0,
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em'
                            }}>
                                {quizData.title || 'Live Session'}
                            </h1>
                            <span style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                marginTop: '0.2rem'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#10b981',
                                    boxShadow: '0 0 10px #10b981'
                                }}></span>
                                Lobby • {quizData.questions?.length || 0} Questions • {quizData.type === 'poll' ? 'Poll Mode' : 'Quiz Mode'}
                            </span>
                        </div>

                        {/* Spacer on right for visual symmetry with the left button */}
                        <div style={{ width: '160px' }}></div>
                    </div>

                    {/* Main Split-Screen Container */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(380px, 500px) 1fr',
                        gap: '2rem',
                        flex: 1,
                        alignItems: 'stretch',
                        minHeight: 'calc(100vh - 140px)'
                    }}>
                        {/* LEFT SIDE: QR Code & Join Information */}
                        <div className="card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            textAlign: 'center',
                            padding: '1.75rem 2rem',
                            background: 'var(--bg-card)',
                            boxShadow: 'var(--shadow-xl)',
                            borderRadius: '1.75rem'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                                    Join the Quiz!
                                </h2>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Scan with your phone camera or visit:
                                </p>
                                <div style={{
                                    marginTop: '0.35rem',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    color: 'var(--accent-primary)',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    padding: '0.3rem 0.9rem',
                                    borderRadius: '1rem',
                                    display: 'inline-block'
                                }}>
                                    {window.location.host}/join
                                </div>
                            </div>

                            {/* QR Code Container */}
                            <div style={{
                                margin: '1rem 0',
                                padding: '1.25rem',
                                background: 'white',
                                borderRadius: '1.25rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <QRCodeSVG value={joinUrl} size={260} level="M" />
                            </div>

                            {/* Game PIN Code Box with Copy */}
                            <div style={{ width: '100%', marginBottom: '1.25rem' }}>
                                <div style={{
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                    color: 'var(--text-muted)',
                                    fontWeight: 700,
                                    marginBottom: '0.25rem'
                                }}>
                                    GAME PIN
                                </div>
                                <div
                                    onClick={handleCopyCode}
                                    title="Click to copy PIN"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        padding: '0.6rem 1.5rem',
                                        background: 'var(--bg-secondary)',
                                        border: '2px dashed var(--border-color-hover)',
                                        borderRadius: '1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'all'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color-hover)'}
                                >
                                    <span style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 900,
                                        letterSpacing: '0.35rem',
                                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        {sessionId}
                                    </span>
                                    {copied ? (
                                        <Check size={20} color="#10b981" />
                                    ) : (
                                        <Copy size={20} color="var(--text-muted)" />
                                    )}
                                </div>
                                {copied && (
                                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', fontWeight: 600 }}>
                                        PIN copied to clipboard!
                                    </div>
                                )}
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={startQuiz}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    fontSize: '1.25rem',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    borderRadius: '1.25rem'
                                }}
                            >
                                <Play size={22} fill="white" />
                                {quizData.type === 'poll' ? 'Start Poll' : 'Start Quiz'}
                            </button>
                        </div>

                        {/* RIGHT SIDE: Participants Joining Area */}
                        <div className="card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '2rem',
                            background: 'var(--bg-card)',
                            boxShadow: 'var(--shadow-xl)',
                            borderRadius: '1.75rem',
                            minHeight: 0
                        }}>
                            {/* Players Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: '1.25rem',
                                borderBottom: '1px solid var(--border-color)',
                                marginBottom: '1.25rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        padding: '0.6rem',
                                        borderRadius: '0.85rem',
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        color: 'var(--accent-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Users size={22} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                            Players Joined
                                        </h2>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            Live audience roster
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'var(--bg-secondary)',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '2rem',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: participants.length > 0 ? '#10b981' : '#f59e0b',
                                        boxShadow: `0 0 8px ${participants.length > 0 ? '#10b981' : '#f59e0b'}`
                                    }}></span>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)'
                                    }}>
                                        {participants.length}
                                    </span>
                                </div>
                            </div>

                            {/* Participant Roster / Live List */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                paddingRight: '0.5rem',
                                minHeight: '260px'
                            }}>
                                {participants.length === 0 ? (
                                    <div style={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-muted)',
                                        textAlign: 'center',
                                        padding: '2rem'
                                    }}>
                                        <div style={{
                                            width: '72px',
                                            height: '72px',
                                            borderRadius: '50%',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '1rem',
                                            color: 'var(--accent-primary)',
                                            animation: 'pulse 2s infinite'
                                        }}>
                                            <Users size={36} />
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                            Waiting for players to join...
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '300px', margin: 0 }}>
                                            Players who scan the QR code or enter the Game PIN will appear here in real-time.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                        gap: '0.85rem',
                                        alignContent: 'start'
                                    }}>
                                        {participants.map((p, i) => (
                                            <div
                                                key={i}
                                                className="animate-fade-in"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '1rem',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: 'var(--shadow-sm)'
                                                }}
                                            >
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    background: getAvatarGradient(p.name, i),
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                }}>
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    color: 'var(--text-primary)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {p.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'game') {
            const question = quizData.questions[currentQuestionIndex];
            if (!question) return <div>Loading...</div>;

            const chartData = question.options.map((opt, index) => {
                const letter = String.fromCharCode(65 + index);
                return {
                    name: letter,
                    optionText: opt,
                    count: stats[letter] || 0
                };
            });

            return (
                <div className="container" style={{ paddingTop: '2rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <span className="subtitle" style={{ margin: 0 }}>Question {currentQuestionIndex + 1} / {quizData.questions.length}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                padding: '0.5rem 1rem',
                                background: timer <= 5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                                borderRadius: '2rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: timer <= 5 ? '#ef4444' : 'var(--accent-secondary)',
                                fontWeight: 'bold',
                                fontSize: '1.25rem',
                                transition: 'all 0.3s'
                            }}>
                                <Clock size={24} />
                                {timer}s
                            </div>
                            <div className="subtitle" style={{ margin: 0 }}>Session: {sessionId}</div>
                        </div>
                    </div>

                    <h1 className="title" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                        {question.text}
                    </h1>

                    {/* Media Display */}
                    {question.media && (
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'inline-block', borderRadius: '0.5rem', overflow: 'hidden', background: 'var(--bg-secondary)', padding: '1rem', maxWidth: '600px' }}>
                                {question.media.type === 'image' ? (
                                    <img src={question.media.data} alt="Question media" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '0.5rem' }} />
                                ) : (
                                    <video src={question.media.data} controls style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '0.5rem' }} />
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {question.options.map((opt, i) => {
                                const isCorrect = quizData.type !== 'poll' && showAnswer && opt === question.correctAnswer;
                                const isWrong = quizData.type !== 'poll' && showAnswer && opt !== question.correctAnswer;

                                return (
                                    <div key={i} style={{
                                        padding: '1.5rem',
                                        background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
                                        border: isCorrect ? '2px solid #10b981' : '1px solid var(--border-color)',
                                        opacity: isWrong ? 0.5 : 1,
                                        borderRadius: '0.5rem',
                                        fontSize: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        transition: 'all 0.3s ease',
                                        color: 'var(--text-primary)'
                                    }}>
                                        <span style={{
                                            width: '40px', height: '40px',
                                            background: isCorrect ? '#10b981' : 'var(--accent-primary, #8b5cf6)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}>{String.fromCharCode(65 + i)}</span>
                                        {opt}
                                        {isCorrect && <CheckCircle className="ml-auto" color="#10b981" />}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                <BarChart2 size={20} />
                                <span>Live Responses</span>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 16, fontWeight: 700 }} interval={0} />
                                    <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        formatter={(value, name, item) => [`${value} responses`, `${item.payload.name}: ${item.payload.optionText}`]}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={showAnswer && entry.optionText === question.correctAnswer ? '#10b981' : '#8b5cf6'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ padding: '2rem 0', display: 'flex', justifyContent: 'center' }}>
                        {!showAnswer ? (
                            <button onClick={revealAnswer} className="btn btn-primary" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }}>
                                {quizData.type === 'poll' ? 'Show Results' : 'Show Correct Answer'}
                            </button>
                        ) : (
                            <button onClick={nextQuestion} className="btn btn-primary" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }}>
                                Next Question <ChevronRight />
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        if (step === 'results') {
            return (
                <div className="container grid-center" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '840px', textAlign: 'center', padding: '2.5rem 2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(251, 191, 36, 0.15)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            boxShadow: '0 0 30px rgba(251, 191, 36, 0.2)'
                        }}>
                            <Trophy size={48} color="#fbbf24" />
                        </div>
                        <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Final Results</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>
                            {leaderboard.length} {leaderboard.length === 1 ? 'Player' : 'Players'} Completed
                        </p>

                        <div style={{
                            maxHeight: '52vh',
                            overflowY: 'auto',
                            paddingRight: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem'
                        }}>
                            {leaderboard.map((p, i) => {
                                const isFirst = i === 0;
                                const isSecond = i === 1;
                                const isThird = i === 2;

                                const bg = isFirst
                                    ? 'rgba(251, 191, 36, 0.12)'
                                    : isSecond
                                        ? 'rgba(148, 163, 184, 0.12)'
                                        : isThird
                                            ? 'rgba(249, 115, 22, 0.12)'
                                            : 'var(--bg-secondary)';

                                const borderColor = isFirst
                                    ? '#fbbf24'
                                    : isSecond
                                        ? '#94a3b8'
                                        : isThird
                                            ? '#f97316'
                                            : 'var(--border-color)';

                                const medalBadgeBg = isFirst
                                    ? '#fbbf24'
                                    : isSecond
                                        ? '#94a3b8'
                                        : isThird
                                            ? '#f97316'
                                            : 'var(--bg-tertiary, rgba(255,255,255,0.08))';

                                const medalTextColor = (isFirst || isSecond || isThird) ? '#0f172a' : 'var(--text-primary)';

                                return (
                                    <div
                                        key={i}
                                        className="animate-fade-in"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1.1rem 1.5rem',
                                            background: bg,
                                            border: `1.5px solid ${borderColor}`,
                                            borderRadius: '1rem',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isFirst ? '0 4px 20px rgba(251, 191, 36, 0.15)' : 'var(--shadow-sm)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: medalBadgeBg,
                                                color: medalTextColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.1rem',
                                                fontWeight: 800,
                                                flexShrink: 0
                                            }}>
                                                #{i + 1}
                                            </span>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: getAvatarGradient(p.name, i),
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {p.name}
                                            </span>
                                        </div>
                                        <span style={{
                                            fontSize: '1.35rem',
                                            fontWeight: 800,
                                            color: isFirst ? '#fbbf24' : 'var(--accent-primary, #8b5cf6)'
                                        }}>
                                            {p.score || 0} pts
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <button onClick={leaveHostSession} className="btn btn-secondary" style={{ marginTop: '2rem', padding: '0.8rem 2.5rem' }}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
            {/* Background Image */}
            {quizData?.backgroundImage && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${quizData.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -1,
                    opacity: 0.3,
                    filter: 'blur(5px)',
                    transform: 'scale(1.1)'
                }} />
            )}

            {/* Background Music */}
            {quizData?.music && (
                <audio
                    src={quizData.music}
                    autoPlay
                    loop
                    controls
                    style={{
                        position: 'fixed',
                        bottom: '1rem',
                        right: '1rem',
                        zIndex: 1000,
                        opacity: 0.7,
                        borderRadius: '2rem',
                        height: '40px'
                    }}
                />
            )}

            {/* Dark / Light Mode Toggle — always visible */}
            <button
                onClick={toggleTheme}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    right: '2.5rem',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.1rem',
                    borderRadius: '2rem',
                    border: '1.5px solid var(--border-color)',
                    background: isDarkMode
                        ? 'rgba(255,255,255,0.07)'
                        : 'rgba(0,0,0,0.06)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-family)',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: 'var(--shadow-md)',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
            >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            {renderContent()}
        </div>
    );
}
