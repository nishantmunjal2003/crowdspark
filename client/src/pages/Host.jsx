import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { socket } from '../socket';
import { Play, ChevronRight, Trophy, Users, BarChart2, ArrowLeft, CheckCircle, Clock } from 'lucide-react';

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

    useEffect(() => {
        const quiz = location.state?.quiz;

        if (!quiz) {
            navigate('/dashboard');
            return;
        }

        setQuizData(quiz);
        socket.emit('create_session', quiz, (response) => {
            setSessionId(response.sessionId);
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
            setParticipants(prev => [...prev, data]);
        });

        // ... rest of socket listeners
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
                            borderTop: '4px solid var(--accent)',
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
                <div className="container grid-center">
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-secondary"
                            style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>
                        <h1 className="title">Join the Quiz!</h1>
                        <div className="card" style={{ display: 'inline-block', padding: '2rem', background: 'white' }}>
                            <QRCodeSVG value={joinUrl} size={256} />
                        </div>
                        <div style={{ marginTop: '2rem' }}>
                            <h2 style={{ fontSize: '3rem', letterSpacing: '0.5rem', color: 'var(--accent)' }}>
                                {sessionId}
                            </h2>
                            <p className="subtitle">Go to <b>{window.location.host}/join</b> and enter code</p>
                        </div>

                        <div style={{ margin: '2rem 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.5rem' }}>
                                <Users />
                                <span>{participants.length} joined</span>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {participants.map((p, i) => (
                                    <span key={i} className="animate-fade-in" style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: '2rem' }}>
                                        {p.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button onClick={startQuiz} className="btn btn-primary" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }}>
                            <Play size={24} /> Start Quiz
                        </button>
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
                    name: opt,
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
                                color: timer <= 5 ? '#ef4444' : '#a78bfa',
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
                                // Only show correct/wrong for quiz type, not poll
                                const isCorrect = quizData.type !== 'poll' && showAnswer && opt === question.correctAnswer;
                                const isWrong = quizData.type !== 'poll' && showAnswer && opt !== question.correctAnswer;

                                return (
                                    <div key={i} style={{
                                        padding: '1.5rem',
                                        background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
                                        border: isCorrect ? '2px solid #10b981' : '1px solid transparent',
                                        opacity: isWrong ? 0.5 : 1,
                                        borderRadius: '0.5rem',
                                        fontSize: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <span style={{
                                            width: '40px', height: '40px',
                                            background: isCorrect ? '#10b981' : 'var(--accent)',
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
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} interval={0} />
                                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={showAnswer && entry.name === question.correctAnswer ? '#10b981' : '#8b5cf6'}
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
                <div className="container grid-center">
                    <div className="card" style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}>
                        <Trophy size={64} color="#fbbf24" style={{ marginBottom: '1rem' }} />
                        <h1 className="title">Final Results</h1>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {leaderboard.map((p, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1.5rem',
                                    background: i === 0 ? 'rgba(251, 191, 36, 0.1)' : 'var(--bg-secondary)',
                                    border: i === 0 ? '1px solid #fbbf24' : 'none',
                                    borderRadius: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '30px' }}>#{i + 1}</span>
                                        <span style={{ fontSize: '1.25rem' }}>{p.name}</span>
                                    </div>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{p.score} pts</span>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ marginTop: '2rem' }}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
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

            {renderContent()}
        </div>
    );
}
