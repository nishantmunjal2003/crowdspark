import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Edit, Trash2, LogOut, BookOpen, Users, BarChart3, Download, Sparkles, Shield } from 'lucide-react';
import '../dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // all, quiz, poll
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const currentUser = localStorage.getItem('current_user');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(currentUser);
        setUser(userData);

        // Load quizzes from MongoDB API - ONLY for this user
        fetch(`/api/quizzes?userId=${userData._id}`)
            .then(res => res.json())
            .then(data => {
                setQuizzes(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching quizzes:', err);
                setIsLoading(false);
            });
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
            // Delete from backend first
            const response = await fetch(`/api/quizzes/${quizToDelete}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete quiz');
            }

            // Update UI only after successful deletion
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
    const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);

    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top center, #1e293b 0%, #0f172a 100%)' }}>
            {/* Animated Background - Softer */}
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

            {/* Header - Glassmorphic */}
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
                        <button onClick={handleLogout} className="btn btn-secondary">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="dashboard-content">
                {/* Stats Cards - Softer Glass */}
                <div className="dashboard-stats-grid">
                    <div className="card animate-fade-in" style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
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
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', lineHeight: 1 }}>
                                    {totalQuizzes}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    Total Quizzes
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-fade-in" style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
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
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', lineHeight: 1 }}>
                                    {totalPolls}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    Total Polls
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-fade-in" style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
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
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', lineHeight: 1 }}>
                                    {totalQuestions}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    Total Questions
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create New Buttons - Refined Gradients */}
                <div className="dashboard-create-grid">
                    <button
                        onClick={() => navigate('/create-quiz', { state: { type: 'quiz' } })}
                        className="btn animate-fade-in create-card-btn"
                        style={{
                            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(99, 102, 241, 0.05))',
                            border: '1px solid rgba(129, 140, 248, 0.2)',
                            color: '#e2e8f0',
                            animationDelay: '0.3s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(129, 140, 248, 0.15), rgba(99, 102, 241, 0.1))';
                            e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(99, 102, 241, 0.05))';
                            e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
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
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Questions with correct answers</div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/create-quiz', { state: { type: 'poll' } })}
                        className="btn animate-fade-in create-card-btn"
                        style={{
                            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(16, 185, 129, 0.05))',
                            border: '1px solid rgba(52, 211, 153, 0.2)',
                            color: '#e2e8f0',
                            animationDelay: '0.4s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.1))';
                            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(16, 185, 129, 0.05))';
                            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
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
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Collect opinions, no scoring</div>
                        </div>
                    </button>
                </div>

                {/* Filter Tabs - Pill Design */}
                <div className="dashboard-filter-tabs">
                    {['all', 'quiz', 'poll'].map((tab, index) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="animate-fade-in"
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '2rem',
                                border: activeTab === tab ? '1px solid rgba(129, 140, 248, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                                background: activeTab === tab ? 'rgba(129, 140, 248, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                                color: activeTab === tab ? '#818cf8' : '#94a3b8',
                                fontWeight: activeTab === tab ? '600' : '500',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                animationDelay: `${0.5 + index * 0.1}s`
                            }}
                        >
                            {tab === 'all' ? `All (${quizzes.length})` : tab === 'quiz' ? `Quizzes (${totalQuizzes})` : `Polls (${totalPolls})`}
                        </button>
                    ))}
                </div>

                {/* Quiz/Poll List - Minimalist Cards */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading...</div>
                ) : filteredQuizzes.length === 0 ? (
                    <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', animationDelay: '0.8s', background: 'rgba(30, 41, 59, 0.2)' }}>
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
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>No {activeTab === 'all' ? 'Content' : activeTab === 'quiz' ? 'Quizzes' : 'Polls'} Yet</h2>
                        <p style={{ color: '#94a3b8' }}>Create your first {activeTab === 'all' ? 'quiz or poll' : activeTab} to get started!</p>
                    </div>
                ) : (
                    <div className="dashboard-quiz-list">
                        {filteredQuizzes.map((quiz, index) => (
                            <div key={quiz._id || quiz.id} className="quiz-card animate-fade-in"
                                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateX(6px)';
                                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                                    e.currentTarget.style.borderColor = quiz.type === 'poll' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(129, 140, 248, 0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
                                }}>
                                <div className="quiz-info">
                                    <div className="quiz-header">
                                        <h3 className="quiz-title">
                                            {quiz.title}
                                        </h3>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            background: quiz.type === 'poll' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(129, 140, 248, 0.15)',
                                            color: quiz.type === 'poll' ? '#34d399' : '#818cf8',
                                            border: quiz.type === 'poll' ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(129, 140, 248, 0.2)'
                                        }}>
                                            {quiz.type === 'poll' ? 'POLL' : 'QUIZ'}
                                        </span>
                                    </div>
                                    <div className="quiz-meta">
                                        <span>{quiz.questions?.length || 0} questions</span>
                                        <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="quiz-actions">
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
                                            borderRadius: '0.75rem'
                                        }}
                                    >
                                        <Play size={16} />
                                        Host
                                    </button>
                                    <button
                                        onClick={() => handleEditQuiz(quiz)}
                                        className="btn"
                                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderRadius: '0.75rem' }}
                                        title="Edit"
                                        onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDuplicateQuiz(quiz)}
                                        className="btn"
                                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderRadius: '0.75rem' }}
                                        title="Duplicate"
                                        onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                    >
                                        <Download size={16} style={{ transform: 'rotate(180deg)' }} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(quiz._id || quiz.id)}
                                        className="btn"
                                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#f87171', borderRadius: '0.75rem' }}
                                        title="Delete"
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: '#1e293b',
                        padding: '2rem',
                        borderRadius: '1rem',
                        maxWidth: '400px',
                        width: '90%',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        transform: 'scale(1)',
                        animation: 'scaleIn 0.2s ease-out'
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '0.5rem' }}>Delete Quiz?</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                            Are you sure you want to delete this quiz? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#e2e8f0',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                                onMouseLeave={e => e.target.style.background = 'transparent'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    background: '#ef4444',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)'
                                }}
                                onMouseEnter={e => e.target.style.background = '#dc2626'}
                                onMouseLeave={e => e.target.style.background = '#ef4444'}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
