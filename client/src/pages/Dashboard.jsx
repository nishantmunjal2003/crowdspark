import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    X,
    Search,
    Folder,
    FolderPlus,
    FolderInput,
    Filter,
    FolderCheck,
    Tag,
    User,
    ChevronDown
} from 'lucide-react';
import '../dashboard.css';
import QuizReportModal from '../components/QuizReportModal';
import UserProfileModal from '../components/UserProfileModal';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef(null);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const groupDropdownRef = useRef(null);
    const [quizzes, setQuizzes] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // all, quiz, poll
    const [selectedGroup, setSelectedGroup] = useState('all'); // all or group name
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuizReport, setSelectedQuizReport] = useState(null);
    const [userTokens, setUserTokens] = useState({
        aiTokens: 50,
        aiTokensUsed: 0,
        aiTokensTotal: 50
    });
    const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);
    const [selectedTokenPack, setSelectedTokenPack] = useState({ tokens: 50, price: 1 });
    const [isSubmittingTokenReq, setIsSubmittingTokenReq] = useState(false);
    const [tokenReqSuccessMsg, setTokenReqSuccessMsg] = useState('');
    const [tokenReqNote, setTokenReqNote] = useState('');
    
    // Group management states
    const [quickMoveQuiz, setQuickMoveQuiz] = useState(null);
    const [targetGroup, setTargetGroup] = useState('');
    const [isMovingGroup, setIsMovingGroup] = useState(false);
    const [showManageGroupsModal, setShowManageGroupsModal] = useState(false);
    const [groupToRename, setGroupToRename] = useState('');
    const [renamedGroupName, setRenamedGroupName] = useState('');
    const [isRenamingGroup, setIsRenamingGroup] = useState(false);
    const [groupActionSuccess, setGroupActionSuccess] = useState('');

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('host_theme');
        return saved ? saved === 'dark' : true;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('host_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
            if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target)) {
                setShowGroupDropdown(false);
            }
        }
        if (showProfileDropdown || showGroupDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileDropdown, showGroupDropdown]);

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

    const handleRequestTokens = async () => {
        if (!user?._id) return;
        setIsSubmittingTokenReq(true);
        setTokenReqSuccessMsg('');
        try {
            const res = await fetch('/api/tokens/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    tokensRequested: selectedTokenPack.tokens,
                    amount: selectedTokenPack.price,
                    note: tokenReqNote
                })
            });
            const data = await res.json();
            if (data.success) {
                setTokenReqSuccessMsg(`🎉 Your request for ${selectedTokenPack.tokens} AI Tokens ($${selectedTokenPack.price}) has been sent! Our administrator has received the request and will raise your token balance shortly.`);
                setTokenReqNote('');
            } else {
                alert(data.error || 'Failed to submit token request');
            }
        } catch (err) {
            console.error('Error submitting token request:', err);
            alert('Network error submitting request. Please try again.');
        } finally {
            setIsSubmittingTokenReq(false);
        }
    };

    const handleMoveQuizToGroup = async (e) => {
        if (e) e.preventDefault();
        if (!quickMoveQuiz || !targetGroup.trim()) return;

        setIsMovingGroup(true);
        const cleanGroup = targetGroup.trim();

        try {
            const res = await fetch(`/api/quizzes/${quickMoveQuiz._id || quickMoveQuiz.id}/group`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group: cleanGroup })
            });
            const data = await res.json();
            if (res.ok) {
                setQuizzes(prev => prev.map(q => 
                    (q._id || q.id) === (quickMoveQuiz._id || quickMoveQuiz.id)
                        ? { ...q, group: cleanGroup }
                        : q
                ));
                setGroupActionSuccess(`Quiz moved to group "${cleanGroup}"!`);
                setQuickMoveQuiz(null);
                setTargetGroup('');
                setTimeout(() => setGroupActionSuccess(''), 3000);
            } else {
                alert(data.error || 'Failed to move quiz to group');
            }
        } catch (err) {
            console.error('Error moving quiz group:', err);
            alert('Network error moving quiz to group');
        } finally {
            setIsMovingGroup(false);
        }
    };

    const handleRenameGroup = async (e) => {
        if (e) e.preventDefault();
        if (!user?._id || !groupToRename || !renamedGroupName.trim()) return;

        setIsRenamingGroup(true);
        const cleanNewGroup = renamedGroupName.trim();

        try {
            const res = await fetch('/api/quizzes/rename-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    oldGroup: groupToRename,
                    newGroup: cleanNewGroup
                })
            });
            const data = await res.json();
            if (res.ok) {
                setQuizzes(prev => prev.map(q => {
                    if ((q.group || 'General').trim().toLowerCase() === groupToRename.toLowerCase()) {
                        return { ...q, group: cleanNewGroup };
                    }
                    return q;
                }));
                if (selectedGroup.toLowerCase() === groupToRename.toLowerCase()) {
                    setSelectedGroup(cleanNewGroup);
                }
                setGroupActionSuccess(`Group renamed from "${groupToRename}" to "${cleanNewGroup}"`);
                setGroupToRename('');
                setRenamedGroupName('');
                setTimeout(() => setGroupActionSuccess(''), 3000);
            } else {
                alert(data.error || 'Failed to rename group');
            }
        } catch (err) {
            console.error('Error renaming group:', err);
            alert('Network error renaming group');
        } finally {
            setIsRenamingGroup(false);
        }
    };

    const uniqueGroups = useMemo(() => {
        const set = new Set();
        quizzes.forEach(q => {
            const g = (q.group || 'General').trim();
            if (g) set.add(g);
        });
        const list = Array.from(set).sort((a, b) => {
            if (a.toLowerCase() === 'general') return -1;
            if (b.toLowerCase() === 'general') return 1;
            return a.localeCompare(b);
        });
        if (!list.some(g => g.toLowerCase() === 'general')) {
            list.unshift('General');
        }
        return list;
    }, [quizzes]);

    const groupCounts = useMemo(() => {
        const counts = {};
        quizzes.forEach(q => {
            const g = (q.group || 'General').trim();
            counts[g] = (counts[g] || 0) + 1;
        });
        return counts;
    }, [quizzes]);

    if (!user) return null;

    const filteredQuizzes = quizzes.filter(quiz => {
        // 1. Tab filter (all, quiz, poll)
        const matchesTab = activeTab === 'all' || (quiz.type || 'quiz') === activeTab;
        if (!matchesTab) return false;

        // 2. Group filter (all or specific group)
        const quizGroup = (quiz.group || 'General').trim();
        const matchesGroup = selectedGroup === 'all' || quizGroup.toLowerCase() === selectedGroup.toLowerCase();
        if (!matchesGroup) return false;

        // 3. Search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const titleMatch = quiz.title?.toLowerCase().includes(query);
            const groupMatch = quizGroup.toLowerCase().includes(query);
            const questionMatch = quiz.questions?.some(q => q.text?.toLowerCase().includes(query));
            return titleMatch || groupMatch || questionMatch;
        }

        return true;
    });

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
                        <div className="dashboard-logo-icon" onClick={() => navigate('/')} title="CrowdSpark Home">
                            <Zap size={24} color="white" fill="white" />
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

                        {/* Theme Toggle Button (Icon Only) */}
                        <button
                            onClick={toggleTheme}
                            className="btn btn-secondary"
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            style={{
                                width: '42px',
                                height: '42px',
                                padding: 0,
                                borderRadius: '50%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* User Profile Dropdown Button & Menu */}
                        <div style={{ position: 'relative' }} ref={profileDropdownRef}>
                            <button
                                onClick={() => setShowProfileDropdown(prev => !prev)}
                                className="btn"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.65rem',
                                    padding: '0.35rem 0.85rem 0.35rem 0.45rem',
                                    background: showProfileDropdown ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                    border: showProfileDropdown ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                    borderRadius: '2rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}
                                title="Account & Profile Menu"
                            >
                                {user.picture ? (
                                    <img
                                        src={user.picture}
                                        alt={user.name}
                                        style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: 800
                                    }}>
                                        {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.15 }}>
                                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.675rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        color: user.role === 'admin' ? '#ec4899' : '#818cf8',
                                        letterSpacing: '0.03em'
                                    }}>
                                        {user.role === 'admin' ? '🛡️ Admin' : '👤 Host'}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={15}
                                    color="var(--text-secondary)"
                                    style={{
                                        transition: 'transform 0.2s ease',
                                        transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                />
                            </button>

                            {/* Floating Dropdown Menu */}
                            {showProfileDropdown && (
                                <div
                                    className="animate-fade-in"
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        right: 0,
                                        width: '240px',
                                        background: 'var(--bg-secondary)',
                                        border: '1.5px solid var(--border-color)',
                                        borderRadius: '1.25rem',
                                        padding: '0.5rem',
                                        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--border-color)',
                                        zIndex: 1050,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem'
                                    }}
                                >
                                    {/* Header Info */}
                                    <div style={{
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '0.85rem',
                                        background: 'var(--bg-tertiary)',
                                        marginBottom: '0.25rem',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.email}
                                        </div>
                                    </div>

                                    {/* Option 1: Profile */}
                                    <button
                                        onClick={() => {
                                            setShowProfileDropdown(false);
                                            setShowProfileModal(true);
                                        }}
                                        className="btn"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            width: '100%',
                                            padding: '0.65rem 0.85rem',
                                            borderRadius: '0.75rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            justifyContent: 'flex-start',
                                            textAlign: 'left',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(129, 140, 248, 0.12)';
                                            e.currentTarget.style.color = '#818cf8';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                        }}
                                    >
                                        <User size={16} color="#818cf8" />
                                        <span>Profile</span>
                                    </button>

                                    {/* Option 2: Role: Admin (Only shown if user is admin, otherwise hidden) */}
                                    {user.role === 'admin' && (
                                        <button
                                            onClick={() => {
                                                setShowProfileDropdown(false);
                                                navigate('/admin');
                                            }}
                                            className="btn"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '0.75rem',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                justifyContent: 'flex-start',
                                                textAlign: 'left',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(236, 72, 153, 0.12)';
                                                e.currentTarget.style.color = '#ec4899';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'var(--text-primary)';
                                            }}
                                        >
                                            <Shield size={16} color="#ec4899" />
                                            <span>Role: Admin</span>
                                        </button>
                                    )}

                                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />

                                    {/* Option 3: Logout */}
                                    <button
                                        onClick={() => {
                                            setShowProfileDropdown(false);
                                            handleLogout();
                                        }}
                                        className="btn"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            width: '100%',
                                            padding: '0.65rem 0.85rem',
                                            borderRadius: '0.75rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            justifyContent: 'flex-start',
                                            textAlign: 'left',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <LogOut size={16} color="#ef4444" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
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
                </div>

                {/* Onboarding Cards if user has 0 quizzes */}
                {quizzes.length === 0 && (
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
                )}

                {/* Search & Groups Toolbar */}
                <div className="dashboard-toolbar animate-fade-in" style={{ animationDelay: '0.45s' }}>
                    {/* Search Bar & Quick Create Actions Row */}
                    <div className="dashboard-search-row">
                        <div className="dashboard-search-container">
                            <span className="dashboard-search-icon">
                                <Search size={19} />
                            </span>
                            <input
                                type="text"
                                className="dashboard-search-input"
                                placeholder="Search quizzes by title, question text, or group..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="dashboard-search-clear"
                                    onClick={() => setSearchQuery('')}
                                    title="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            className="dashboard-search-btn"
                            onClick={() => {}}
                        >
                            <Search size={16} />
                            <span>Search</span>
                        </button>

                        {/* Create Buttons on the Right Side of Search Row */}
                        <button
                            onClick={() => navigate('/create-quiz', { state: { type: 'quiz' } })}
                            className="btn animate-fade-in"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                height: '50px',
                                padding: '0 1.25rem',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                borderRadius: '1.25rem',
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 18px rgba(99, 102, 241, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.25)';
                            }}
                            title="Create a new quiz"
                        >
                            <Plus size={17} />
                            <span>Create Quiz</span>
                        </button>

                        <button
                            onClick={() => navigate('/create-quiz', { state: { type: 'poll' } })}
                            className="btn animate-fade-in"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                height: '50px',
                                padding: '0 1.25rem',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                borderRadius: '1.25rem',
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.25)';
                            }}
                            title="Create a new poll"
                        >
                            <Plus size={17} />
                            <span>Create Poll</span>
                        </button>
                    </div>

                    {/* Filter Tabs & Groups Section (Single Unified Row) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            flexWrap: 'wrap'
                        }}>
                            {/* Left: Type Tabs + Group Pills */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                flex: 1
                            }}>
                                {/* Type Tabs (All, Quizzes, Polls) */}
                                <div className="dashboard-filter-tabs" style={{ marginBottom: 0, gap: '0.4rem' }}>
                                    {['all', 'quiz', 'poll'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            style={{
                                                padding: '0.5rem 1.1rem',
                                                borderRadius: '2rem',
                                                border: activeTab === tab ? '1.5px solid #818cf8' : '1px solid var(--border-color)',
                                                background: activeTab === tab ? 'rgba(129, 140, 248, 0.18)' : 'var(--bg-secondary)',
                                                color: activeTab === tab ? '#818cf8' : 'var(--text-secondary)',
                                                fontWeight: activeTab === tab ? '700' : '500',
                                                fontSize: '0.825rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: activeTab === tab ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none'
                                            }}
                                        >
                                            {tab === 'all' ? `All (${quizzes.length})` : tab === 'quiz' ? `Quizzes (${totalQuizzes})` : `Polls (${totalPolls})`}
                                        </button>
                                    ))}
                                </div>

                                {/* Subtle Vertical Divider */}
                                <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 0.25rem' }} />

                                {/* Groups Dropdown Menu */}
                                <div style={{ position: 'relative' }} ref={groupDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowGroupDropdown(prev => !prev)}
                                        className="btn"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '2rem',
                                            border: selectedGroup !== 'all' ? '1.5px solid #818cf8' : '1px solid var(--border-color)',
                                            background: selectedGroup !== 'all' ? 'rgba(129, 140, 248, 0.18)' : 'var(--bg-secondary)',
                                            color: selectedGroup !== 'all' ? '#818cf8' : 'var(--text-secondary)',
                                            fontWeight: selectedGroup !== 'all' ? '700' : '500',
                                            fontSize: '0.825rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: selectedGroup !== 'all' ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none'
                                        }}
                                        title="Filter quizzes by group / folder"
                                    >
                                        <Folder size={14} color={selectedGroup !== 'all' ? '#818cf8' : 'currentColor'} />
                                        <span>{selectedGroup === 'all' ? `All Groups (${quizzes.length})` : `${selectedGroup} (${groupCounts[selectedGroup] || 0})`}</span>
                                        <ChevronDown
                                            size={14}
                                            style={{
                                                transition: 'transform 0.2s ease',
                                                transform: showGroupDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }}
                                        />
                                    </button>

                                    {/* Floating Groups Dropdown Menu */}
                                    {showGroupDropdown && (
                                        <div
                                            className="animate-fade-in"
                                            style={{
                                                position: 'absolute',
                                                top: 'calc(100% + 6px)',
                                                left: 0,
                                                minWidth: '220px',
                                                background: 'var(--bg-secondary)',
                                                border: '1.5px solid var(--border-color)',
                                                borderRadius: '1rem',
                                                padding: '0.4rem',
                                                boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--border-color)',
                                                zIndex: 1050,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.2rem'
                                            }}
                                        >
                                            <div style={{
                                                fontSize: '0.725rem',
                                                fontWeight: 700,
                                                color: 'var(--text-secondary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                padding: '0.4rem 0.6rem 0.2rem 0.6rem'
                                            }}>
                                                Filter by Group
                                            </div>

                                            {/* All Groups Option */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedGroup('all');
                                                    setShowGroupDropdown(false);
                                                }}
                                                className="btn"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '0.6rem',
                                                    background: selectedGroup === 'all' ? 'rgba(129, 140, 248, 0.15)' : 'transparent',
                                                    border: 'none',
                                                    color: selectedGroup === 'all' ? '#818cf8' : 'var(--text-primary)',
                                                    fontWeight: selectedGroup === 'all' ? 700 : 500,
                                                    fontSize: '0.825rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                    <Folder size={14} />
                                                    <span>All Groups</span>
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                    {quizzes.length}
                                                </span>
                                            </button>

                                            {uniqueGroups.map((g) => {
                                                const count = groupCounts[g] || 0;
                                                const isSelected = selectedGroup.toLowerCase() === g.toLowerCase();
                                                return (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedGroup(g);
                                                            setShowGroupDropdown(false);
                                                        }}
                                                        className="btn"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            width: '100%',
                                                            padding: '0.5rem 0.75rem',
                                                            borderRadius: '0.6rem',
                                                            background: isSelected ? 'rgba(129, 140, 248, 0.15)' : 'transparent',
                                                            border: 'none',
                                                            color: isSelected ? '#818cf8' : 'var(--text-primary)',
                                                            fontWeight: isSelected ? 700 : 500,
                                                            fontSize: '0.825rem',
                                                            cursor: 'pointer',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            <Folder size={14} />
                                                            <span>{g}</span>
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                            {count}
                                                        </span>
                                                    </button>
                                                );
                                            })}

                                            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowGroupDropdown(false);
                                                    setShowManageGroupsModal(true);
                                                }}
                                                className="btn"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.45rem',
                                                    width: '100%',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '0.6rem',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <Folder size={14} color="#818cf8" />
                                                <span>Manage & Rename Groups</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Manage Groups Button */}
                            <button
                                type="button"
                                onClick={() => setShowManageGroupsModal(true)}
                                className="btn"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.45rem 0.85rem',
                                    fontSize: '0.775rem',
                                    fontWeight: 600,
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.75rem',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                title="Manage and rename groups"
                            >
                                <Folder size={13} color="#818cf8" />
                                <span>Manage Groups</span>
                            </button>
                        </div>

                        {/* Active Filter Indicator & Reset Button */}
                        {(searchQuery.trim() || selectedGroup !== 'all' || activeTab !== 'all') && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(129, 140, 248, 0.08)',
                                border: '1px solid rgba(129, 140, 248, 0.2)',
                                padding: '0.6rem 1rem',
                                borderRadius: '0.75rem',
                                fontSize: '0.85rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                    <Filter size={15} color="#818cf8" />
                                    <span>
                                        Showing <strong>{filteredQuizzes.length}</strong> of {quizzes.length} quizzes
                                        {selectedGroup !== 'all' && <> in group <strong style={{ color: '#818cf8' }}>📁 {selectedGroup}</strong></>}
                                        {searchQuery.trim() && <> matching "<strong style={{ color: '#818cf8' }}>{searchQuery.trim()}</strong>"</>}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedGroup('all');
                                        setActiveTab('all');
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#818cf8',
                                        fontWeight: 600,
                                        fontSize: '0.825rem',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}

                        {groupActionSuccess && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: 'var(--success)',
                                padding: '0.6rem 1rem',
                                borderRadius: '0.75rem',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                <Check size={16} />
                                <span>{groupActionSuccess}</span>
                            </div>
                        )}
                    </div>
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
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                            {searchQuery.trim() || selectedGroup !== 'all' ? 'No Matching Quizzes' : `No ${activeTab === 'all' ? 'Content' : activeTab === 'quiz' ? 'Quizzes' : 'Polls'} Yet`}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            {searchQuery.trim() || selectedGroup !== 'all'
                                ? 'Try searching for something else or clearing your active filters.'
                                : `Create your first ${activeTab === 'all' ? 'quiz or poll' : activeTab} to get started!`}
                        </p>
                        {(searchQuery.trim() || selectedGroup !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedGroup('all');
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '0.6rem 1.25rem' }}
                            >
                                Clear Search & Group Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="dashboard-quiz-list">
                        {filteredQuizzes.map((quiz, index) => {
                            const pCount = quiz.totalParticipants || 0;
                            const playsCount = quiz.totalPlays || 0;
                            const quizGroup = quiz.group || 'General';

                            return (
                                <div
                                    key={quiz._id || quiz.id}
                                    className="quiz-card animate-fade-in"
                                    style={{ animationDelay: `${0.6 + index * 0.04}s` }}
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

                                            {/* Clickable Group Tag */}
                                            <button
                                                type="button"
                                                className="quiz-group-tag"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedGroup(quizGroup);
                                                }}
                                                title={`Filter by group "${quizGroup}"`}
                                            >
                                                <Folder size={11} />
                                                <span>{quizGroup}</span>
                                            </button>

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
                                            onClick={() => {
                                                setQuickMoveQuiz(quiz);
                                                setTargetGroup(quiz.group || 'General');
                                            }}
                                            className="btn"
                                            style={{ padding: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '0.75rem' }}
                                            title="Move to Group / Folder"
                                        >
                                            <FolderInput size={16} />
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

                        {/* Success Banner */}
                        {tokenReqSuccessMsg ? (
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '1rem',
                                padding: '1.75rem',
                                textAlign: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    width: '54px',
                                    height: '54px',
                                    borderRadius: '50%',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: 'var(--success)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem auto'
                                }}>
                                    <Sparkles size={28} />
                                </div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                                    Token Request Received!
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                                    {tokenReqSuccessMsg}
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setShowBuyTokensModal(false)}
                                        className="btn btn-primary"
                                        style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}
                                    >
                                        Back to Dashboard
                                    </button>
                                    <button
                                        onClick={() => setTokenReqSuccessMsg('')}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.65rem 1.25rem' }}
                                    >
                                        Submit Another Request
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Pricing Value Proposition Banner */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.08))',
                                    border: '1.5px solid rgba(99, 102, 241, 0.35)',
                                    borderRadius: '1rem',
                                    padding: '1.25rem 1.5rem',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            ⚡ Special Rate
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                                            $1.00 for 50 AI Tokens
                                        </div>
                                        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                            Only $0.02 per AI-generated question • No expiry
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.5rem 1rem',
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        fontWeight: 800,
                                        fontSize: '0.9rem',
                                        borderRadius: '0.75rem',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                    }}>
                                        50 Qs = $1
                                    </div>
                                </div>

                                {/* Token Quantity Selector */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                        Select Amount to Request:
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                                        {[
                                            { tokens: 50, price: 1, label: '50 Tokens', tag: 'Starter' },
                                            { tokens: 100, price: 2, label: '100 Tokens', tag: 'Popular' },
                                            { tokens: 250, price: 5, label: '250 Tokens', tag: 'Educator' },
                                            { tokens: 500, price: 10, label: '500 Tokens', tag: 'Pro Host' }
                                        ].map(pkg => {
                                            const isSelected = selectedTokenPack.tokens === pkg.tokens;
                                            return (
                                                <div
                                                    key={pkg.tokens}
                                                    onClick={() => setSelectedTokenPack({ tokens: pkg.tokens, price: pkg.price })}
                                                    style={{
                                                        padding: '0.85rem 0.65rem',
                                                        borderRadius: '0.85rem',
                                                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                                                        border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                        boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                        {pkg.tag}
                                                    </div>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                                                        {pkg.tokens}
                                                    </div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                                                        ${pkg.price}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Optional Note Input */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                                        Optional Note / Message for Admin:
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Need tokens for upcoming exam session..."
                                        value={tokenReqNote}
                                        onChange={e => setTokenReqNote(e.target.value)}
                                        className="admin-filter-control"
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.875rem' }}
                                    />
                                </div>

                                {/* Submit Request Button */}
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowBuyTokensModal(false)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.65rem 1.25rem' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRequestTokens}
                                        disabled={isSubmittingTokenReq}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '0.7rem 1.75rem',
                                            fontWeight: 800,
                                            fontSize: '0.95rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                                        }}
                                    >
                                        <Zap size={18} fill="currentColor" />
                                        {isSubmittingTokenReq ? 'Submitting Request...' : `Request ${selectedTokenPack.tokens} Tokens ($${selectedTokenPack.price})`}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Info Footnote */}
                        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.25rem', marginBottom: 0, lineHeight: 1.5 }}>
                            Upon submitting, your administrator will receive an alert to approve and credit tokens to your account.
                        </p>
                    </div>
                </div>
            )}

            {/* Quick Move Quiz to Group Modal */}
            {quickMoveQuiz && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                        padding: '1.5rem'
                    }}
                    onClick={() => setQuickMoveQuiz(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="card animate-fade-in"
                        style={{
                            background: 'var(--bg-card)',
                            padding: '2rem',
                            borderRadius: '1.5rem',
                            maxWidth: '480px',
                            width: '100%',
                            border: '1.5px solid rgba(129, 140, 248, 0.3)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    background: 'rgba(129, 140, 248, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#818cf8'
                                }}>
                                    <FolderInput size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                        Move to Group
                                    </h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                        {quickMoveQuiz.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setQuickMoveQuiz(null)}
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleMoveQuizToGroup}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                    Select or Enter Group Name
                                </label>
                                <input
                                    type="text"
                                    list="quick-group-list"
                                    className="input"
                                    placeholder="e.g. Linux Administration, Science Grade 10..."
                                    value={targetGroup}
                                    onChange={(e) => setTargetGroup(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                                    autoFocus
                                    required
                                />
                                <datalist id="quick-group-list">
                                    {uniqueGroups.map((g, idx) => (
                                        <option key={idx} value={g} />
                                    ))}
                                </datalist>
                            </div>

                            {/* Existing Groups Fast Buttons */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                                    Existing Groups:
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {uniqueGroups.map((g, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setTargetGroup(g)}
                                            style={{
                                                border: targetGroup.toLowerCase() === g.toLowerCase() ? '1px solid #818cf8' : '1px solid var(--border-color)',
                                                background: targetGroup.toLowerCase() === g.toLowerCase() ? 'rgba(129, 140, 248, 0.2)' : 'var(--bg-secondary)',
                                                color: targetGroup.toLowerCase() === g.toLowerCase() ? '#818cf8' : 'var(--text-secondary)',
                                                fontSize: '0.775rem',
                                                padding: '0.3rem 0.7rem',
                                                borderRadius: '1rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            📁 {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setQuickMoveQuiz(null)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.65rem 1.25rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isMovingGroup || !targetGroup.trim()}
                                    className="btn btn-primary"
                                    style={{
                                        padding: '0.65rem 1.5rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem'
                                    }}
                                >
                                    <FolderCheck size={16} />
                                    {isMovingGroup ? 'Saving...' : 'Move Quiz'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Groups Modal */}
            {showManageGroupsModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                        padding: '1.5rem'
                    }}
                    onClick={() => setShowManageGroupsModal(false)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="card animate-fade-in"
                        style={{
                            background: 'var(--bg-card)',
                            padding: '2.25rem',
                            borderRadius: '1.5rem',
                            maxWidth: '560px',
                            width: '100%',
                            border: '1.5px solid var(--border-color)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            maxHeight: '85vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: 'rgba(129, 140, 248, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#818cf8'
                                }}>
                                    <Folder size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                        Manage Quiz Groups
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                        Organize, rename, and filter by groups
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowManageGroupsModal(false)}
                                className="btn btn-secondary"
                                style={{ padding: '0.45rem 0.65rem' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* All Groups Breakdown Table */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                Your Groups & Quiz Counts
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {uniqueGroups.map((g) => {
                                    const count = groupCounts[g] || 0;
                                    return (
                                        <div
                                            key={g}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.75rem',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <Folder size={16} color="#818cf8" />
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g}</span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '1rem',
                                                    background: 'rgba(129, 140, 248, 0.15)',
                                                    color: '#818cf8',
                                                    fontWeight: 700
                                                }}>
                                                    {count} {count === 1 ? 'quiz' : 'quizzes'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedGroup(g);
                                                        setShowManageGroupsModal(false);
                                                    }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setGroupToRename(g);
                                                        setRenamedGroupName(g);
                                                    }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
                                                >
                                                    Rename
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rename Group Section */}
                        {groupToRename && (
                            <form
                                onSubmit={handleRenameGroup}
                                style={{
                                    background: 'rgba(129, 140, 248, 0.08)',
                                    border: '1px solid rgba(129, 140, 248, 0.3)',
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    marginBottom: '1.5rem'
                                }}
                            >
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#818cf8' }}>
                                    Rename Group "{groupToRename}"
                                </h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                                    All quizzes currently in "{groupToRename}" will be updated to the new name.
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        value={renamedGroupName}
                                        onChange={(e) => setRenamedGroupName(e.target.value)}
                                        placeholder="Enter new group name..."
                                        style={{ flex: 1, padding: '0.65rem 0.85rem' }}
                                        required
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={isRenamingGroup || !renamedGroupName.trim() || renamedGroupName.trim() === groupToRename}
                                        className="btn btn-primary"
                                        style={{ padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' }}
                                    >
                                        {isRenamingGroup ? 'Renaming...' : 'Save Name'}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setGroupToRename('');
                                        setRenamedGroupName('');
                                    }}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Cancel rename
                                </button>
                            </form>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowManageGroupsModal(false)}
                                className="btn btn-secondary"
                                style={{ padding: '0.65rem 1.5rem' }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Profile Modal */}
            {showProfileModal && (
                <UserProfileModal
                    user={user}
                    userTokens={userTokens}
                    totalQuizzes={totalQuizzes}
                    totalParticipants={totalParticipantsAll}
                    onClose={() => setShowProfileModal(false)}
                    onUpdateUser={(updatedUser) => setUser(updatedUser)}
                    onLogout={handleLogout}
                />
            )}
        </div>
    );
}
