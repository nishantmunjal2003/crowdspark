import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Play,
    Edit,
    Trash2,
    LogOut,
    BookOpen,
    Users,
    BarChart3,
    Download,
    Sparkles,
    Shield,
    Sun,
    Moon,
    FileSpreadsheet,
    Calendar,
    Trophy,
    Zap,
    Check,
    X
} from 'lucide-react';
import '../dashboard.css';
import QuizReportModal from '../components/QuizReportModal';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // all, quiz, poll
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuizReport, setSelectedQuizReport] = useState(null);
    const [userTokens, setUserTokens] = useState({
        aiTokens: 50,
        aiTokensUsed: 0,
        aiTokensTotal: 50
    });
    const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('host_theme');
        return saved ? saved === 'dark' : true;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('host_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    const loadQuizzes = (userId) => {
        setIsLoading(true);
        fetch(`/api/quizzes?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                setQuizzes(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching quizzes:', err);
                setIsLoading(false);
            });
    };

    const loadUserTokens = (userId) => {
        fetch(`/api/users/${userId}/tokens`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUserTokens({
                        aiTokens: data.aiTokens !== undefined ? data.aiTokens : 50,
                        aiTokensUsed: data.aiTokensUsed || 0,
                        aiTokensTotal: data.aiTokensTotal || 50
                    });
                }
            })
            .catch(err => console.error('Error fetching user tokens:', err));
    };

    useEffect(() => {
        // Check if user is logged in
        const currentUser = localStorage.getItem('current_user');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(currentUser);
        setUser(userData);

        loadQuizzes(userData._id);
        loadUserTokens(userData._id);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('current_user');
        navigate('/login');
    };

    const handleHostQuiz = (quiz) => {
        navigate('/host', { state: { quiz } });
    };

    const handleEditQuiz = (quiz) => {
        navigate('/create-quiz', { state: { quiz } });
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);

    const handleDeleteClick = (quizId) => {
        setQuizToDelete(quizId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!quizToDelete) return;

        try {
            const response = await fetch(`/api/quizzes/${quizToDelete}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete quiz');
            }

            const updatedQuizzes = quizzes.filter(q => (q._id || q.id) !== quizToDelete);
            setQuizzes(updatedQuizzes);

            setDeleteModalOpen(false);
            setQuizToDelete(null);
        } catch (err) {
            console.error('Error deleting quiz:', err);
            alert('Failed to delete quiz: ' + err.message);
        }
    };

    const handleDuplicateQuiz = (quiz) => {
        const duplicated = {
            ...quiz,
            _id: undefined, // Let DB generate new ID
            title: `${quiz.title} (Copy)`,
            createdAt: new Date().toISOString()
        };

        fetch('/api/quizzes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duplicated)
        })
            .then(res => res.json())
            .then(newQuiz => {
                setQuizzes([newQuiz, ...quizzes]);
            })
            .catch(err => console.error('Error duplicating quiz:', err));
    };

    if (!user) return null;

    const filteredQuizzes = activeTab === 'all'
        ? quizzes
        : quizzes.filter(q => (q.type || 'quiz') === activeTab);

    const totalQuizzes = quizzes.filter(q => (q.type || 'quiz') === 'quiz').length;
    const totalPolls = quizzes.filter(q => q.type === 'poll').length;
    const totalParticipantsAll = quizzes.reduce((sum, q) => sum + (q.totalParticipants || 0), 0);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Animated Background */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>

            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-user-info">
                        <div className="dashboard-logo-icon">
                            <Sparkles size={24} color="#818cf8" />
                        </div>
                        <div className="dashboard-title-text">
                            <h1>CrowdSpark</h1>
                            <p>
                                Welcome back, <span style={{ color: '#818cf8', fontWeight: '500' }}>{user.name}</span>
                            </p>
                        </div>
                    </div>
                    <div className="dashboard-actions">
                        {/* AI Tokens Indicator Chip */}
                        <button
                            onClick={() => setShowBuyTokensModal(true)}
                            className="btn"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                background: (userTokens.aiTokens || 0) > 10 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: (userTokens.aiTokens || 0) > 10 ? 'var(--accent-primary)' : 'var(--error)',
                                border: `1px solid ${(userTokens.aiTokens || 0) > 10 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                padding: '0.5rem 0.9rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                borderRadius: '0.75rem'
                            }}
                            title="Click to view AI Token Balance & Top Up"
                        >
                            <Zap size={16} fill="currentColor" />
                            <span>{userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50} AI Tokens</span>
                        </button>

                        {user.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="btn"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))',
                                    border: '1px solid rgba(236, 72, 153, 0.3)',
                                    color: 'var(--accent-tertiary)'
                                }}
                            >
                                <Shield size={16} />
                                Admin
                            </button>
                        )}
                        <button
                            onClick={toggleTheme}
                            className="btn btn-secondary"
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            style={{ gap: '0.5rem' }}
                        >
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                            {isDarkMode ? 'Light' : 'Dark'}
                        </button>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="dashboard-content">
                {/* Stats Cards */}
                <div className="dashboard-stats-grid">
                    <div className="card animate-fade-in" style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'rgba(129, 140, 248, 0.1)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(129, 140, 248, 0.2)'
                            }}>
                                <BookOpen size={26} color="#818cf8" />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {totalQuizzes}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    Total Quizzes
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-fade-in" style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        animationDelay: '0.1s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'rgba(52, 211, 153, 0.1)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(52, 211, 153, 0.2)'
                            }}>
                                <BarChart3 size={26} color="#34d399" />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {totalPolls}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    Total Polls
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-fade-in" style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        animationDelay: '0.2s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'rgba(244, 114, 182, 0.1)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(244, 114, 182, 0.2)'
                            }}>
                                <Users size={26} color="#f472b6" />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {totalParticipantsAll}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    Total Participants Taken
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Tokens Card */}
                    <div
                        className="card animate-fade-in"
                        onClick={() => setShowBuyTokensModal(true)}
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--accent-primary)',
                            animationDelay: '0.25s',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'rgba(99, 102, 241, 0.12)',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(99, 102, 241, 0.3)'
                                }}>
                                    <Zap size={26} color="var(--accent-primary)" fill="var(--accent-primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                                        {userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                        AI Tokens Left
                                    </div>
                                </div>
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.65rem',
                                fontWeight: 700,
                                background: 'rgba(99, 102, 241, 0.15)',
                                color: 'var(--accent-primary)',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}>
                                + Buy More
                            </span>
                        </div>
                    </div>
                </div>

                {/* Create New Buttons */}
                <div className="dashboard-create-grid">
                    <button
                        onClick={() => navigate('/create-quiz', { state: { type: 'quiz' } })}
                        className="btn animate-fade-in create-card-btn"
                        style={{
                            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(99, 102, 241, 0.05))',
                            border: '1px solid rgba(129, 140, 248, 0.2)',
                            color: 'var(--text-primary)',
                            animationDelay: '0.3s'
                        }}
                    >
                        <div style={{
                            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                            padding: '1rem',
                            borderRadius: '50%',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            <Plus size={32} color="white" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Create Quiz</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Questions with correct answers</div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/create-quiz', { state: { type: 'poll' } })}
                        className="btn animate-fade-in create-card-btn"
                        style={{
                            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(16, 185, 129, 0.05))',
                            border: '1px solid rgba(52, 211, 153, 0.2)',
                            color: 'var(--text-primary)',
                            animationDelay: '0.4s'
                        }}
                    >
                        <div style={{
                            background: 'linear-gradient(135deg, #34d399, #10b981)',
                            padding: '1rem',
                            borderRadius: '50%',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                            <Plus size={32} color="white" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Create Poll</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Collect opinions, no scoring</div>
                        </div>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="dashboard-filter-tabs">
                    {['all', 'quiz', 'poll'].map((tab, index) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="animate-fade-in"
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '2rem',
                                border: activeTab === tab ? '1px solid rgba(129, 140, 248, 0.4)' : '1px solid var(--border-color)',
                                background: activeTab === tab ? 'rgba(129, 140, 248, 0.15)' : 'var(--bg-secondary)',
                                color: activeTab === tab ? '#818cf8' : 'var(--text-secondary)',
                                fontWeight: activeTab === tab ? '600' : '500',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                animationDelay: `${0.5 + index * 0.1}s`
                            }}
                        >
                            {tab === 'all' ? `All (${quizzes.length})` : tab === 'quiz' ? `Quizzes (${totalQuizzes})` : `Polls (${totalPolls})`}
                        </button>
                    ))}
                </div>

                {/* Quiz List */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading quizzes...</div>
                ) : filteredQuizzes.length === 0 ? (
                    <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', animationDelay: '0.8s', background: 'var(--bg-card)' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(129, 140, 248, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <BookOpen size={40} color="#818cf8" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No {activeTab === 'all' ? 'Content' : activeTab === 'quiz' ? 'Quizzes' : 'Polls'} Yet</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Create your first {activeTab === 'all' ? 'quiz or poll' : activeTab} to get started!</p>
                    </div>
                ) : (
                    <div className="dashboard-quiz-list">
                        {filteredQuizzes.map((quiz, index) => {
                            const pCount = quiz.totalParticipants || 0;
                            const playsCount = quiz.totalPlays || 0;

                            return (
                                <div
                                    key={quiz._id || quiz.id}
                                    className="quiz-card animate-fade-in"
                                    style={{ animationDelay: `${0.8 + index * 0.05}s` }}
                                    onClick={() => setSelectedQuizReport(quiz)}
                                    title="Click to view full quiz history, player names & download reports"
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.background = 'var(--bg-secondary)';
                                        e.currentTarget.style.borderColor = quiz.type === 'poll' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(129, 140, 248, 0.4)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.background = 'var(--bg-card)';
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                    }}
                                >
                                    <div className="quiz-info">
                                        <div className="quiz-header">
                                            <h3 className="quiz-title">
                                                {quiz.title}
                                            </h3>
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                background: quiz.type === 'poll' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(129, 140, 248, 0.15)',
                                                color: quiz.type === 'poll' ? '#34d399' : '#818cf8',
                                                border: quiz.type === 'poll' ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(129, 140, 248, 0.2)'
                                            }}>
                                                {quiz.type === 'poll' ? 'POLL' : 'QUIZ'}
                                            </span>

                                            {/* Participants & Plays Badges */}
                                            <span style={{
                                                padding: '0.2rem 0.65rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.725rem',
                                                fontWeight: '600',
                                                background: pCount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(129, 140, 248, 0.1)',
                                                color: pCount > 0 ? 'var(--success)' : 'var(--text-secondary)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                border: `1px solid ${pCount > 0 ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-color)'}`
                                            }}>
                                                <Users size={12} />
                                                {pCount} {pCount === 1 ? 'Taken' : 'Taken'}
                                            </span>

                                            {playsCount > 0 && (
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.725rem',
                                                    fontWeight: '600',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    color: 'var(--accent-primary)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem'
                                                }}>
                                                    {playsCount} {playsCount === 1 ? 'play' : 'plays'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="quiz-meta">
                                            <span>{quiz.questions?.length || 0} questions</span>
                                            <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                                            {quiz.lastPlayed && (
                                                <span style={{ color: 'var(--accent-primary)' }}>
                                                    Last Played: {new Date(quiz.lastPlayed).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="quiz-actions" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => setSelectedQuizReport(quiz)}
                                            className="btn btn-secondary"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                padding: '0.5rem 0.85rem',
                                                fontSize: '0.85rem',
                                                borderRadius: '0.75rem',
                                                fontWeight: '600'
                                            }}
                                            title="View Report & Participants History"
                                        >
                                            <BarChart3 size={15} color="var(--accent-primary)" />
                                            Report
                                        </button>
                                        <button
                                            onClick={() => handleHostQuiz(quiz)}
                                            className="btn"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                color: 'white',
                                                fontSize: '0.875rem',
                                                borderRadius: '0.75rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <Play size={15} />
                                            Host
                                        </button>
                                        <button
                                            onClick={() => handleEditQuiz(quiz)}
                                            className="btn"
                                            style={{ padding: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '0.75rem' }}
                                            title="Edit Quiz"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDuplicateQuiz(quiz)}
                                            className="btn"
                                            style={{ padding: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '0.75rem' }}
                                            title="Duplicate"
                                        >
                                            <Download size={16} style={{ transform: 'rotate(180deg)' }} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(quiz._id || quiz.id)}
                                            className="btn"
                                            style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quiz Report & History Modal */}
            {selectedQuizReport && (
                <QuizReportModal
                    quiz={selectedQuizReport}
                    onClose={() => setSelectedQuizReport(null)}
                    onHostQuiz={(q) => {
                        setSelectedQuizReport(null);
                        handleHostQuiz(q);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--bg-card)',
                        padding: '2rem',
                        borderRadius: '1rem',
                        maxWidth: '400px',
                        width: '90%',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            color: '#ef4444'
                        }}>
                            <Trash2 size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Delete Quiz?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5, fontSize: '0.9rem' }}>
                            Are you sure you want to delete this quiz? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="btn btn-secondary"
                                style={{ padding: '0.65rem 1.25rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn"
                                style={{
                                    padding: '0.65rem 1.25rem',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Buy / Top-Up AI Tokens Modal */}
            {showBuyTokensModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1.5rem'
                    }}
                    onClick={() => setShowBuyTokensModal(false)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="card animate-fade-in"
                        style={{
                            background: 'var(--bg-card)',
                            padding: '2.25rem',
                            borderRadius: '1.5rem',
                            maxWidth: '680px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            border: '1.5px solid var(--accent-primary)',
                            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.35)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                }}>
                                    <Zap size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                        AI Question Tokens
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                                        ⚡ <strong>1 Token = 1 AI Question Generated</strong>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowBuyTokensModal(false)}
                                className="btn btn-secondary"
                                style={{ padding: '0.45rem 0.65rem' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Current Balance Banner */}
                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '1rem',
                            border: '1px solid var(--border-color)',
                            marginBottom: '1.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your Available Balance</div>
                                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--accent-primary)', lineHeight: 1.1 }}>
                                    {userTokens.aiTokens !== undefined ? userTokens.aiTokens : 50} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tokens Remaining</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Questions Generated</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {userTokens.aiTokensUsed || 0} questions
                                </div>
                            </div>
                        </div>

                        {/* Token Package Options */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                                Choose a Token Package:
                            </h4>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                {/* Pack 1 */}
                                <div style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '1rem',
                                    padding: '1.25rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Starter</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.4rem 0' }}>50 Tokens</div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                                            50 AI Questions<br />($0.10 / question)
                                        </p>
                                    </div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '1rem' }}>$5</div>
                                    <button
                                        onClick={() => {
                                            alert('Thank you! Token top-up request initiated. In production, this links to your Stripe/payment checkout or grants immediate credits.');
                                        }}
                                        className="btn btn-secondary"
                                        style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700, padding: '0.6rem' }}
                                    >
                                        Select $5 Pack
                                    </button>
                                </div>

                                {/* Pack 2 (Popular) */}
                                <div style={{
                                    background: 'var(--bg-secondary)',
                                    border: '2px solid var(--accent-primary)',
                                    borderRadius: '1rem',
                                    padding: '1.25rem',
                                    textAlign: 'center',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-12px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: 'white',
                                        fontSize: '0.675rem',
                                        fontWeight: 800,
                                        padding: '0.2rem 0.65rem',
                                        borderRadius: '1rem',
                                        letterSpacing: '0.05em'
                                    }}>
                                        MOST POPULAR
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Pro Educator</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.4rem 0' }}>250 Tokens</div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                                            250 AI Questions<br /><strong>Save 25%</strong> ($0.076/q)
                                        </p>
                                    </div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '1rem' }}>$19</div>
                                    <button
                                        onClick={() => {
                                            alert('Thank you! Token top-up request initiated. In production, this links to your Stripe/payment checkout or grants immediate credits.');
                                        }}
                                        className="btn btn-primary"
                                        style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700, padding: '0.6rem' }}
                                    >
                                        Select $19 Pack
                                    </button>
                                </div>

                                {/* Pack 3 */}
                                <div style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '1rem',
                                    padding: '1.25rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Power Host</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.4rem 0' }}>1,000 Tokens</div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                                            1,000 AI Questions<br /><strong>Save 50%</strong> ($0.049/q)
                                        </p>
                                    </div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '1rem' }}>$49</div>
                                    <button
                                        onClick={() => {
                                            alert('Thank you! Token top-up request initiated. In production, this links to your Stripe/payment checkout or grants immediate credits.');
                                        }}
                                        className="btn btn-secondary"
                                        style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700, padding: '0.6rem' }}
                                    >
                                        Select $49 Pack
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Info Footnote */}
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                            Tokens never expire and apply to all AI models and quiz generator tools on your account.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
