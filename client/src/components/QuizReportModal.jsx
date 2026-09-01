import React, { useState, useEffect } from 'react';
import {
    X,
    Download,
    Users,
    Trophy,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    BarChart3,
    FileSpreadsheet,
    HelpCircle,
    Sparkles
} from 'lucide-react';

export default function QuizReportModal({ quiz, onClose, onHostQuiz }) {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSessionId, setExpandedSessionId] = useState(null);
    const [expandedParticipantIndex, setExpandedParticipantIndex] = useState(null);

    useEffect(() => {
        if (!quiz) return;

        const quizId = quiz._id || quiz.id;
        setIsLoading(true);
        setError(null);

        fetch(`/api/quizzes/${quizId}/analytics`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load quiz report');
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    setAnalytics(data);
                    if (data.sessions && data.sessions.length > 0) {
                        setExpandedSessionId(data.sessions[0].sessionId);
                    }
                } else {
                    throw new Error(data.error || 'Failed to load report');
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching quiz report:', err);
                setError(err.message);
                setIsLoading(false);
            });
    }, [quiz]);

    if (!quiz) return null;

    const handleDownloadFullReport = () => {
        const quizId = quiz._id || quiz.id;
        window.open(`/api/quizzes/${quizId}/export`, '_blank');
    };

    const handleDownloadSessionReport = (sessionId, e) => {
        e.stopPropagation();
        window.open(`/api/sessions/${sessionId}/export`, '_blank');
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

    return (
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
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="card animate-fade-in"
                style={{
                    width: '100%',
                    maxWidth: '850px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '2rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                    borderRadius: '1.25rem'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                            <span style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '1rem',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: (quiz.type || 'quiz') === 'poll' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(129, 140, 248, 0.15)',
                                color: (quiz.type || 'quiz') === 'poll' ? '#34d399' : '#818cf8',
                                border: (quiz.type || 'quiz') === 'poll' ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(129, 140, 248, 0.25)'
                            }}>
                                {quiz.type || 'QUIZ'} REPORT
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {quiz.questions?.length || 0} Questions
                            </span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                            {quiz.title}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {analytics && analytics.sessions?.length > 0 && (
                            <button
                                onClick={handleDownloadFullReport}
                                className="btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.55rem 1rem',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    borderRadius: '0.75rem',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                                }}
                                title="Download Complete CSV Report for all sessions"
                            >
                                <FileSpreadsheet size={16} />
                                Export CSV
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="btn btn-secondary"
                            style={{ padding: '0.55rem', borderRadius: '0.75rem' }}
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {isLoading ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>Loading session history and participant data...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--error)' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
                    </div>
                ) : !analytics || analytics.sessions?.length === 0 ? (
                    <div style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem auto'
                        }}>
                            <Users size={32} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                            No Participants Yet
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                            Host this quiz to invite participants. Their names, scores, timestamps, and answer logs will appear here for download.
                        </p>
                        {onHostQuiz && (
                            <button
                                onClick={() => onHostQuiz(quiz)}
                                className="btn"
                                style={{
                                    padding: '0.65rem 1.5rem',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    borderRadius: '0.75rem',
                                    fontWeight: '600'
                                }}
                            >
                                Host Quiz Now
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        {/* Summary Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.85rem', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                    <Users size={16} color="var(--accent-primary)" />
                                    Total Participants
                                </div>
                                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {analytics.totalParticipants}
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.85rem', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                    <Calendar size={16} color="#34d399" />
                                    Times Hosted
                                </div>
                                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {analytics.totalPlays}
                                </div>
                            </div>

                            {quiz.type !== 'poll' && (
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.85rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                        <Trophy size={16} color="#f59e0b" />
                                        Avg. Score
                                    </div>
                                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                        {analytics.averageScore} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>pts</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Session History Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                Hosted Sessions & Players
                            </h3>
                            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                                {analytics.sessions.length} {analytics.sessions.length === 1 ? 'session' : 'sessions'} recorded
                            </span>
                        </div>

                        {/* Sessions List */}
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {analytics.sessions.map((sess, sIdx) => {
                                const isExpanded = expandedSessionId === sess.sessionId;
                                const sessionDate = sess.startedAt ? new Date(sess.startedAt) : new Date();

                                return (
                                    <div
                                        key={sess.sessionId || sIdx}
                                        style={{
                                            border: `1.5px solid ${isExpanded ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                            borderRadius: '0.85rem',
                                            background: 'var(--bg-secondary)',
                                            overflow: 'hidden',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {/* Session Accordion Bar */}
                                        <div
                                            onClick={() => setExpandedSessionId(isExpanded ? null : sess.sessionId)}
                                            style={{
                                                padding: '1rem 1.25rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                background: isExpanded ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                                                flexWrap: 'wrap',
                                                gap: '0.75rem'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                                                <div style={{
                                                    padding: '0.35rem 0.65rem',
                                                    borderRadius: '0.5rem',
                                                    background: 'rgba(99, 102, 241, 0.15)',
                                                    color: 'var(--accent-primary)',
                                                    fontWeight: 700,
                                                    fontSize: '0.825rem',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    #{sess.sessionId}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                                        {sessionDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                                                        {sessionDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                <div style={{
                                                    padding: '0.25rem 0.7rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    background: sess.totalParticipants > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                    color: sess.totalParticipants > 0 ? 'var(--success)' : 'var(--error)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem'
                                                }}>
                                                    <Users size={14} />
                                                    {sess.totalParticipants} {sess.totalParticipants === 1 ? 'Participant' : 'Participants'}
                                                </div>

                                                <button
                                                    onClick={(e) => handleDownloadSessionReport(sess.sessionId, e)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                    title="Download this session CSV report"
                                                >
                                                    <Download size={13} />
                                                    CSV
                                                </button>

                                                {isExpanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                                            </div>
                                        </div>

                                        {/* Expanded Session Details (Participants Table) */}
                                        {isExpanded && (
                                            <div style={{ padding: '1rem 1.25rem 1.25rem 1.25rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                                {!sess.participants || sess.participants.length === 0 ? (
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                                                        No participant responses recorded for this session.
                                                    </p>
                                                ) : (
                                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                            Participants ({sess.participants.length})
                                                        </div>

                                                        <div style={{ overflowX: 'auto' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                                                <thead>
                                                                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                                        <th style={{ padding: '0.5rem 0.75rem' }}>#</th>
                                                                        <th style={{ padding: '0.5rem 0.75rem' }}>Participant Name</th>
                                                                        <th style={{ padding: '0.5rem 0.75rem' }}>Score</th>
                                                                        <th style={{ padding: '0.5rem 0.75rem' }}>Correct</th>
                                                                        <th style={{ padding: '0.5rem 0.75rem' }}>Accuracy</th>
                                                                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Answers</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {sess.participants.map((p, pIdx) => {
                                                                        const pKey = `${sess.sessionId}-${pIdx}`;
                                                                        const showAnswers = expandedParticipantIndex === pKey;

                                                                        return (
                                                                            <React.Fragment key={pKey}>
                                                                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                                                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                                                        {pIdx + 1}
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                            <div style={{
                                                                                                width: '28px',
                                                                                                height: '28px',
                                                                                                borderRadius: '50%',
                                                                                                background: getAvatarGradient(p.name, pIdx),
                                                                                                color: 'white',
                                                                                                fontWeight: 800,
                                                                                                fontSize: '0.75rem',
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                justifyContent: 'center'
                                                                                            }}>
                                                                                                {(p.name || 'P').charAt(0).toUpperCase()}
                                                                                            </div>
                                                                                            <span>{p.name}</span>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                                                                        {p.score || 0} pts
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                                                                                        {p.correctAnswers || 0} / {p.totalAnswered || 0}
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem' }}>
                                                                                        <span style={{
                                                                                            padding: '0.2rem 0.5rem',
                                                                                            borderRadius: '0.5rem',
                                                                                            fontSize: '0.75rem',
                                                                                            fontWeight: 700,
                                                                                            background: (p.accuracy || 0) >= 70 ? 'rgba(16, 185, 129, 0.15)' : (p.accuracy || 0) >= 40 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                                                            color: (p.accuracy || 0) >= 70 ? 'var(--success)' : (p.accuracy || 0) >= 40 ? '#f59e0b' : 'var(--error)'
                                                                                        }}>
                                                                                            {p.accuracy || 0}%
                                                                                        </span>
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                                                        {p.answers && p.answers.length > 0 ? (
                                                                                            <button
                                                                                                onClick={() => setExpandedParticipantIndex(showAnswers ? null : pKey)}
                                                                                                className="btn btn-secondary"
                                                                                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                                                                                            >
                                                                                                {showAnswers ? 'Hide' : 'View'} ({p.answers.length})
                                                                                            </button>
                                                                                        ) : (
                                                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>

                                                                                {/* Question-by-Question breakdown */}
                                                                                {showAnswers && p.answers && (
                                                                                    <tr>
                                                                                        <td colSpan="6" style={{ padding: '0.85rem', background: 'var(--bg-secondary)' }}>
                                                                                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                                                                {p.answers.map((ans, aIdx) => (
                                                                                                    <div
                                                                                                        key={aIdx}
                                                                                                        style={{
                                                                                                            display: 'flex',
                                                                                                            alignItems: 'center',
                                                                                                            justifyContent: 'space-between',
                                                                                                            padding: '0.5rem 0.75rem',
                                                                                                            background: 'var(--bg-card)',
                                                                                                            borderRadius: '0.5rem',
                                                                                                            fontSize: '0.8rem',
                                                                                                            border: '1px solid var(--border-color)'
                                                                                                        }}
                                                                                                    >
                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                                                                            {ans.isCorrect ? (
                                                                                                                <CheckCircle2 size={16} color="var(--success)" />
                                                                                                            ) : (
                                                                                                                <XCircle size={16} color="var(--error)" />
                                                                                                            )}
                                                                                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                                                                Q{(ans.questionIndex !== undefined ? ans.questionIndex + 1 : aIdx + 1)}: {ans.questionText}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                                            <span style={{ color: 'var(--text-muted)' }}>Chosen:</span>
                                                                                                            <span style={{ fontWeight: 700, color: ans.isCorrect ? 'var(--success)' : 'var(--error)' }}>
                                                                                                                {ans.selectedOption || ans.answerText || 'N/A'}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </React.Fragment>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
