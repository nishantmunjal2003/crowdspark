import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    BookOpen,
    Activity,
    Shield,
    UserX,
    UserCheck,
    ArrowLeft,
    Eye,
    TrendingUp,
    Search,
    Filter,
    ArrowUpDown,
    RotateCcw,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    X,
    Mail,
    KeyRound,
    Zap,
    Sparkles,
    Coins,
    Trophy,
    ChevronDown,
    ChevronUp,
    Trash2,
    Archive
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import '../admin.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, quizzes, logs
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);

    // AI Token Configuration & Grant States
    const [systemSettings, setSystemSettings] = useState({ defaultAiTokens: 50 });
    const [defaultTokensInput, setDefaultTokensInput] = useState(50);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [settingsSaveMsg, setSettingsSaveMsg] = useState('');
    const [tokenModalUser, setTokenModalUser] = useState(null);
    const [tokenAmountInput, setTokenAmountInput] = useState(50);
    const [tokenActionType, setTokenActionType] = useState('add'); // 'add' or 'set'
    const [isGrantingTokens, setIsGrantingTokens] = useState(false);
    const [tokenRequests, setTokenRequests] = useState([]);
    const [isProcessingTokenReq, setIsProcessingTokenReq] = useState(null);
    const [showProcessedRequests, setShowProcessedRequests] = useState(false);

    // Filter & Sort States for Users
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all'); // all, admin, user
    const [userStatusFilter, setUserStatusFilter] = useState('all'); // all, active, inactive
    const [userAuthFilter, setUserAuthFilter] = useState('all'); // all, google, email
    const [userSort, setUserSort] = useState('newest'); // newest, oldest, name_asc, name_desc, login_desc

    // Filter & Sort States for Quizzes
    const [quizSearch, setQuizSearch] = useState('');
    const [quizTypeFilter, setQuizTypeFilter] = useState('all'); // all, quiz, poll
    const [quizLengthFilter, setQuizLengthFilter] = useState('all'); // all, short, medium, long
    const [quizSort, setQuizSort] = useState('newest'); // newest, oldest, title_asc, title_desc, questions_desc, questions_asc

    // Filter & Sort States for Logs
    const [logSearch, setLogSearch] = useState('');
    const [logActionFilter, setLogActionFilter] = useState('all'); // all, login, signup, quiz, admin
    const [logTimeFilter, setLogTimeFilter] = useState('all'); // all, 24h, 7d, 30d
    const [logSort, setLogSort] = useState('newest'); // newest, oldest, action_asc, user_asc

    // Filter & Sort States for AI Tokens Tab
    const [tokenUserSearch, setTokenUserSearch] = useState('');
    const [tokenRoleFilter, setTokenRoleFilter] = useState('all'); // all, admin, user
    const [tokenBalanceFilter, setTokenBalanceFilter] = useState('all'); // all, zero, low, standard, high
    const [tokenSort, setTokenSort] = useState('tokens_desc'); // tokens_desc, tokens_asc, used_desc, used_asc, name_asc, name_desc, newest

    useEffect(() => {
        const initAdmin = async () => {
            const currentUser = localStorage.getItem('current_user');
            if (!currentUser) {
                navigate('/login');
                return;
            }

            let userData = JSON.parse(currentUser);

            // If local storage role is not admin, verify fresh role from backend
            if (userData.role !== 'admin') {
                try {
                    const profRes = await fetch(`/api/users/${userData._id}/profile`);
                    const profData = await profRes.json();
                    if (profData.success && profData.user?.role === 'admin') {
                        userData = { ...userData, ...profData.user };
                        localStorage.setItem('current_user', JSON.stringify(userData));
                    } else {
                        alert('Access denied. Admin privileges required.');
                        navigate('/dashboard');
                        return;
                    }
                } catch (e) {
                    alert('Access denied. Admin privileges required.');
                    navigate('/dashboard');
                    return;
                }
            }

            setUser(userData);
            loadAdminData(userData._id);
        };

        initAdmin();
    }, [navigate]);

    const loadAdminData = async (userId) => {
        try {
            const token = localStorage.getItem('auth_token') || user?.token || '';
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const [statsRes, settingsRes, usersRes, quizzesRes, logsRes, tokenReqsRes] = await Promise.allSettled([
                fetch(`/api/admin/stats?userId=${userId}`, { headers }).then(r => r.json()),
                fetch(`/api/admin/settings?userId=${userId}`, { headers }).then(r => r.json()),
                fetch(`/api/admin/users?userId=${userId}`, { headers }).then(r => r.json()),
                fetch(`/api/admin/quizzes?userId=${userId}`, { headers }).then(r => r.json()),
                fetch(`/api/admin/logs?userId=${userId}&limit=250`, { headers }).then(r => r.json()),
                fetch(`/api/admin/token-requests?userId=${userId}`, { headers }).then(r => r.json())
            ]);

            let fetchedStats = null;
            if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
                fetchedStats = statsRes.value.stats;
                setStats(statsRes.value.stats);
            }

            if (settingsRes.status === 'fulfilled' && settingsRes.value?.success && settingsRes.value.settings) {
                setSystemSettings(settingsRes.value.settings);
                setDefaultTokensInput(settingsRes.value.settings.defaultAiTokens !== undefined ? settingsRes.value.settings.defaultAiTokens : 50);
            }

            let userList = [];
            if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
                userList = usersRes.value.users || [];
                setUsers(userList);
            }

            let quizList = [];
            if (quizzesRes.status === 'fulfilled' && quizzesRes.value?.success) {
                quizList = quizzesRes.value.quizzes || [];
                setQuizzes(quizList);
            }

            if (logsRes.status === 'fulfilled' && logsRes.value?.success) {
                setLogs(logsRes.value.logs || []);
            } else if (statsRes.status === 'fulfilled' && statsRes.value?.recentActivities) {
                setLogs(statsRes.value.recentActivities || []);
            }

            if (tokenReqsRes.status === 'fulfilled' && tokenReqsRes.value?.success) {
                setTokenRequests(tokenReqsRes.value.requests || []);
            }

            // Fallback stats if stats endpoint had an issue
            if (!fetchedStats) {
                setStats({
                    users: {
                        total: userList.length || 1,
                        active: userList.filter(u => u.isActive !== false).length || 1,
                        inactive: userList.filter(u => u.isActive === false).length || 0,
                        admins: userList.filter(u => u.role === 'admin').length || 1
                    },
                    quizzes: {
                        total: quizList.length || 0,
                        totalParticipants: quizList.reduce((sum, q) => sum + (q.totalParticipants || 0), 0),
                        uniqueParticipants: 0
                    },
                    activities: {
                        total: 0
                    }
                });
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Error loading admin data:', err);
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (targetUserId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/users/${targetUserId}/role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    role: newRole
                })
            });

            const data = await res.json();
            if (data.success) {
                loadAdminData(user._id);
                alert(data.message);
            } else {
                alert(data.error || 'Failed to update user role');
            }
        } catch (err) {
            console.error('Error updating user role:', err);
            alert('Failed to update user role');
        }
    };

    const handleToggleUserStatus = async (targetUserId, currentStatus) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user account?`)) {
            return;
        }

        try {
            const endpoint = currentStatus ? 'deactivate' : 'activate';
            const res = await fetch(`/api/admin/users/${targetUserId}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id })
            });

            const data = await res.json();
            if (data.success) {
                loadAdminData(user._id);
                alert(data.message);
            } else {
                alert(data.error || 'Failed to update user status');
            }
        } catch (err) {
            console.error('Error toggling user status:', err);
            alert('Failed to update user status');
        }
    };

    const viewUserDetails = async (targetUserId) => {
        try {
            const res = await fetch(`/api/admin/users/${targetUserId}?userId=${user._id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedUser(data);
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        setSettingsSaveMsg('');
        try {
            const res = await fetch(`/api/admin/settings?userId=${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    key: 'defaultAiTokens',
                    value: parseInt(defaultTokensInput) || 50,
                    description: 'Default number of AI tokens allocated to newly registered users'
                })
            });
            const data = await res.json();
            if (data.success) {
                setSystemSettings(prev => ({ ...prev, defaultAiTokens: parseInt(defaultTokensInput) || 50 }));
                setSettingsSaveMsg('✓ Default AI tokens setting saved successfully!');
                setTimeout(() => setSettingsSaveMsg(''), 4000);
            } else {
                alert(data.error || 'Failed to save settings');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            alert('Failed to save settings');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleGrantTokens = async () => {
        if (!tokenModalUser) return;
        setIsGrantingTokens(true);
        try {
            const res = await fetch(`/api/admin/users/${tokenModalUser._id}/tokens?userId=${user._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    amount: parseInt(tokenAmountInput) || 0,
                    action: tokenActionType
                })
            });
            const data = await res.json();
            if (data.success) {
                // Update local users array
                setUsers(prev => prev.map(u => u._id === tokenModalUser._id ? {
                    ...u,
                    aiTokens: data.user.aiTokens,
                    aiTokensUsed: data.user.aiTokensUsed,
                    aiTokensTotal: data.user.aiTokensTotal
                } : u));
                alert(`✓ Tokens updated: ${data.user.name} now has ${data.user.aiTokens} AI tokens.`);
                setTokenModalUser(null);
            } else {
                alert(data.error || 'Failed to update user tokens');
            }
        } catch (err) {
            console.error('Error updating tokens:', err);
            alert('Failed to update tokens');
        } finally {
            setIsGrantingTokens(false);
        }
    };

    const handleApproveTokenRequest = async (requestId) => {
        setIsProcessingTokenReq(requestId);
        try {
            const res = await fetch(`/api/admin/token-requests/${requestId}/approve?userId=${user._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id })
            });
            const data = await res.json();
            if (data.success) {
                alert(`✓ Request approved! Credited tokens to ${data.user?.name || 'user'}.`);
                setTokenRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: 'approved', reviewedAt: new Date() } : r));
                if (data.user) {
                    setUsers(prev => prev.map(u => u._id === data.user._id ? {
                        ...u,
                        aiTokens: data.user.aiTokens,
                        aiTokensUsed: data.user.aiTokensUsed,
                        aiTokensTotal: data.user.aiTokensTotal
                    } : u));
                }
            } else {
                alert(data.error || 'Failed to approve token request');
            }
        } catch (err) {
            console.error('Error approving token request:', err);
            alert('Network error approving token request');
        } finally {
            setIsProcessingTokenReq(null);
        }
    };

    const handleRejectTokenRequest = async (requestId) => {
        const targetReq = tokenRequests.find(r => r._id === requestId);
        const defaultReason = 'AI token limit reached or payment verification needed';
        const reasonInput = prompt(`Please enter a reason for rejecting this token request (this will be emailed to ${targetReq?.userName || 'the user'}):`, defaultReason);
        if (reasonInput === null) return; // User cancelled prompt

        setIsProcessingTokenReq(requestId);
        try {
            const res = await fetch(`/api/admin/token-requests/${requestId}/reject?userId=${user._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, reason: reasonInput.trim() })
            });
            const data = await res.json();
            if (data.success) {
                alert(`✓ Request rejected and notification email sent to ${targetReq?.userName || 'the user'}.`);
                setTokenRequests(prev => prev.map(r => r._id === requestId ? {
                    ...r,
                    status: 'rejected',
                    reviewedAt: new Date(),
                    note: reasonInput.trim() ? `${r.note ? r.note + ' | ' : ''}Admin: ${reasonInput.trim()}` : r.note
                } : r));
            } else {
                alert(data.error || 'Failed to reject token request');
            }
        } catch (err) {
            console.error('Error rejecting token request:', err);
            alert('Network error rejecting token request');
        } finally {
            setIsProcessingTokenReq(null);
        }
    };

    const handleDeleteTokenRequest = async (requestId) => {
        if (!confirm('Are you sure you want to permanently delete this request from history?')) return;
        setIsProcessingTokenReq(requestId);
        try {
            const res = await fetch(`/api/admin/token-requests/${requestId}?userId=${user._id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setTokenRequests(prev => prev.filter(r => r._id !== requestId));
            } else {
                alert(data.error || 'Failed to delete token request');
            }
        } catch (err) {
            console.error('Error deleting token request:', err);
            alert('Network error deleting token request');
        } finally {
            setIsProcessingTokenReq(null);
        }
    };

    // Filtered & Sorted Users
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = !userSearch ||
                (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
                (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));
            const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
            const matchesStatus = userStatusFilter === 'all' || (userStatusFilter === 'active' ? u.isActive : !u.isActive);
            const isGoogle = u.authMethod === 'google' || !!u.googleId;
            const matchesAuth = userAuthFilter === 'all' || (userAuthFilter === 'google' ? isGoogle : !isGoogle);

            return matchesSearch && matchesRole && matchesStatus && matchesAuth;
        }).sort((a, b) => {
            if (userSort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (userSort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            if (userSort === 'name_asc') return (a.name || '').localeCompare(b.name || '');
            if (userSort === 'name_desc') return (b.name || '').localeCompare(a.name || '');
            if (userSort === 'login_desc') return new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0);
            return 0;
        });
    }, [users, userSearch, userRoleFilter, userStatusFilter, userAuthFilter, userSort]);

    // Derived user auth stats for Overview
    const userAuthStats = useMemo(() => {
        const googleCount = users.filter(u => u.authMethod === 'google' || !!u.googleId).length;
        const emailCount = users.length - googleCount;
        return { googleCount, emailCount };
    }, [users]);

    // Filtered & Sorted Quizzes
    const filteredQuizzes = useMemo(() => {
        return quizzes.filter(q => {
            const creatorStr = q.creatorEmail || (q.creatorId && (q.creatorId.email || q.creatorId.name)) || '';
            const matchesSearch = !quizSearch ||
                (q.title && q.title.toLowerCase().includes(quizSearch.toLowerCase())) ||
                creatorStr.toLowerCase().includes(quizSearch.toLowerCase());
            const matchesType = quizTypeFilter === 'all' || q.type === quizTypeFilter;
            const qCount = q.questions?.length || 0;
            let matchesLength = true;
            if (quizLengthFilter === 'short') matchesLength = qCount <= 5;
            else if (quizLengthFilter === 'medium') matchesLength = qCount >= 6 && qCount <= 15;
            else if (quizLengthFilter === 'long') matchesLength = qCount >= 16;
            return matchesSearch && matchesType && matchesLength;
        }).sort((a, b) => {
            if (quizSort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (quizSort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            if (quizSort === 'title_asc') return (a.title || '').localeCompare(b.title || '');
            if (quizSort === 'title_desc') return (b.title || '').localeCompare(a.title || '');
            if (quizSort === 'questions_desc') return (b.questions?.length || 0) - (a.questions?.length || 0);
            if (quizSort === 'questions_asc') return (a.questions?.length || 0) - (b.questions?.length || 0);
            return 0;
        });
    }, [quizzes, quizSearch, quizTypeFilter, quizLengthFilter, quizSort]);

    // Filtered & Sorted Logs
    const filteredLogs = useMemo(() => {
        const now = Date.now();
        return logs.filter(l => {
            const detailsStr = JSON.stringify(l.details || {});
            const matchesSearch = !logSearch ||
                (l.userName && l.userName.toLowerCase().includes(logSearch.toLowerCase())) ||
                (l.userEmail && l.userEmail.toLowerCase().includes(logSearch.toLowerCase())) ||
                (l.action && l.action.toLowerCase().includes(logSearch.toLowerCase())) ||
                (l.ipAddress && l.ipAddress.includes(logSearch)) ||
                detailsStr.toLowerCase().includes(logSearch.toLowerCase());

            let matchesAction = true;
            if (logActionFilter === 'login') matchesAction = l.action.includes('login');
            else if (logActionFilter === 'signup') matchesAction = l.action.includes('signup');
            else if (logActionFilter === 'quiz') matchesAction = l.action.includes('quiz');
            else if (logActionFilter === 'admin') matchesAction = l.action.includes('admin') || l.action.includes('user_');

            let matchesTime = true;
            const logTime = new Date(l.timestamp).getTime();
            if (logTimeFilter === '24h') matchesTime = (now - logTime) <= 24 * 60 * 60 * 1000;
            else if (logTimeFilter === '7d') matchesTime = (now - logTime) <= 7 * 24 * 60 * 60 * 1000;
            else if (logTimeFilter === '30d') matchesTime = (now - logTime) <= 30 * 24 * 60 * 60 * 1000;

            return matchesSearch && matchesAction && matchesTime;
        }).sort((a, b) => {
            if (logSort === 'newest') return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
            if (logSort === 'oldest') return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
            if (logSort === 'action_asc') return (a.action || '').localeCompare(b.action || '');
            if (logSort === 'user_asc') return (a.userName || '').localeCompare(b.userName || '');
            return 0;
        });
    }, [logs, logSearch, logActionFilter, logTimeFilter, logSort]);

    // Filter & Sort Token Users
    const filteredTokenUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = !tokenUserSearch ||
                (u.name && u.name.toLowerCase().includes(tokenUserSearch.toLowerCase())) ||
                (u.email && u.email.toLowerCase().includes(tokenUserSearch.toLowerCase()));

            const matchesRole = tokenRoleFilter === 'all' || u.role === tokenRoleFilter;

            const tokens = u.aiTokens !== undefined ? u.aiTokens : 50;
            let matchesBalance = true;
            if (tokenBalanceFilter === 'zero') matchesBalance = tokens === 0;
            else if (tokenBalanceFilter === 'low') matchesBalance = tokens > 0 && tokens <= 25;
            else if (tokenBalanceFilter === 'standard') matchesBalance = tokens > 25 && tokens <= 50;
            else if (tokenBalanceFilter === 'high') matchesBalance = tokens > 50;

            return matchesSearch && matchesRole && matchesBalance;
        }).sort((a, b) => {
            const aTokens = a.aiTokens !== undefined ? a.aiTokens : 50;
            const bTokens = b.aiTokens !== undefined ? b.aiTokens : 50;
            const aUsed = a.aiTokensUsed || 0;
            const bUsed = b.aiTokensUsed || 0;

            if (tokenSort === 'tokens_desc') return bTokens - aTokens;
            if (tokenSort === 'tokens_asc') return aTokens - bTokens;
            if (tokenSort === 'used_desc') return bUsed - aUsed;
            if (tokenSort === 'used_asc') return aUsed - bUsed;
            if (tokenSort === 'name_asc') return (a.name || '').localeCompare(b.name || '');
            if (tokenSort === 'name_desc') return (b.name || '').localeCompare(a.name || '');
            if (tokenSort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            return 0;
        });
    }, [users, tokenUserSearch, tokenRoleFilter, tokenBalanceFilter, tokenSort]);

    // Derived Pending Token Requests
    const pendingTokenRequests = useMemo(() => {
        return tokenRequests.filter(r => r.status === 'pending');
    }, [tokenRequests]);

    // Derived Processed Token Requests (Approved & Rejected)
    const processedTokenRequests = useMemo(() => {
        return tokenRequests.filter(r => r.status !== 'pending');
    }, [tokenRequests]);

    const hasUserFilters = userSearch || userRoleFilter !== 'all' || userStatusFilter !== 'all' || userAuthFilter !== 'all' || userSort !== 'newest';
    const hasQuizFilters = quizSearch || quizTypeFilter !== 'all' || quizLengthFilter !== 'all' || quizSort !== 'newest';
    const hasLogFilters = logSearch || logActionFilter !== 'all' || logTimeFilter !== 'all' || logSort !== 'newest';
    const hasTokenFilters = tokenUserSearch || tokenRoleFilter !== 'all' || tokenBalanceFilter !== 'all' || tokenSort !== 'tokens_desc';

    if (!user || user.role !== 'admin') return null;

    if (isLoading) {
        return (
            <div className="admin-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
                    <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-wrapper">
            <div className="admin-container">
                {/* Header */}
                <div className="admin-header">
                    <div className="admin-header-left">
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.65rem' }} title="Back to Dashboard">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Shield size={28} color="var(--accent-primary)" />
                                <h1 className="title admin-title">Admin Dashboard</h1>
                            </div>
                            <p className="subtitle admin-subtitle">Manage users, authentication methods, quizzes, and monitor activity</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="admin-stats-grid">
                        <div className="card admin-stat-card">
                            <div className="admin-stat-card-inner">
                                <div className="admin-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)' }}>
                                    <Users size={24} color="var(--accent-primary)" />
                                </div>
                                <div>
                                    <div className="admin-stat-value">{stats.users.total}</div>
                                    <div className="admin-stat-label">Total Users</div>
                                    <div className="admin-stat-sub" style={{ color: 'var(--success)' }}>
                                        {stats.users.active} active • {stats.users.admins} admin
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card admin-stat-card">
                            <div className="admin-stat-card-inner">
                                <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                                    <BookOpen size={24} color="var(--success)" />
                                </div>
                                <div>
                                    <div className="admin-stat-value">{stats.quizzes.total}</div>
                                    <div className="admin-stat-label">Total Quizzes</div>
                                    <div className="admin-stat-sub" style={{ color: 'var(--text-muted)' }}>
                                        Interactive & Live
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card admin-stat-card">
                            <div className="admin-stat-card-inner">
                                <div className="admin-stat-icon" style={{ background: 'rgba(244, 114, 182, 0.14)' }}>
                                    <Trophy size={24} color="#f472b6" />
                                </div>
                                <div>
                                    <div className="admin-stat-value">
                                        {stats.quizzes?.totalParticipants || 0}
                                    </div>
                                    <div className="admin-stat-label">Users Taken Quiz</div>
                                    <div className="admin-stat-sub" style={{ color: '#f472b6' }}>
                                        {stats.quizzes?.uniqueParticipants || 0} unique players
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card admin-stat-card">
                            <div className="admin-stat-card-inner">
                                <div className="admin-stat-icon" style={{ background: 'rgba(236, 72, 153, 0.12)' }}>
                                    <Activity size={24} color="var(--accent-tertiary)" />
                                </div>
                                <div>
                                    <div className="admin-stat-value">{stats.activities.total}</div>
                                    <div className="admin-stat-label">Activity Logs</div>
                                    <div className="admin-stat-sub" style={{ color: 'var(--accent-primary)' }}>
                                        Audit History
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="admin-tabs-nav">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'users', label: `Users (${users.length})`, icon: Users },
                        { id: 'quizzes', label: `Quizzes (${quizzes.length})`, icon: BookOpen },
                        { id: 'logs', label: `Logs (${logs.length})`, icon: Activity },
                        { id: 'tokens', label: pendingTokenRequests.length > 0 ? `AI Tokens (${pendingTokenRequests.length} New)` : 'AI Tokens', icon: Zap }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="admin-tab-btn"
                                style={{
                                    background: isActive ? 'var(--accent-primary)' : 'var(--bg-card)',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    border: `1.5px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                }}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: USERS */}
                {activeTab === 'users' && (
                    <div className="card" style={{ padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>User Management</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                    Showing {filteredUsers.length} of {users.length} registered users
                                </p>
                            </div>
                            {hasUserFilters && (
                                <button
                                    onClick={() => {
                                        setUserSearch('');
                                        setUserRoleFilter('all');
                                        setUserStatusFilter('all');
                                        setUserAuthFilter('all');
                                        setUserSort('newest');
                                    }}
                                    className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                                >
                                    <RotateCcw size={14} /> Reset Filters
                                </button>
                            )}
                        </div>

                        {/* Filter & Sort Bar */}
                        <div className="admin-filter-bar">
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="admin-filter-control"
                                    placeholder="Search by name or email..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem', paddingRight: userSearch ? '2rem' : '0.85rem' }}
                                />
                                {userSearch && (
                                    <button
                                        onClick={() => setUserSearch('')}
                                        style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Auth Provider Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <KeyRound size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={userAuthFilter}
                                    onChange={e => setUserAuthFilter(e.target.value)}
                                >
                                    <option value="all">All Login Methods</option>
                                    <option value="google">Google Login Only</option>
                                    <option value="email">Email / Password Only</option>
                                </select>
                            </div>

                            {/* Role Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={userRoleFilter}
                                    onChange={e => setUserRoleFilter(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin Only</option>
                                    <option value="user">Regular Users Only</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={userStatusFilter}
                                    onChange={e => setUserStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active Accounts</option>
                                    <option value="inactive">Inactive / Deactivated</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowUpDown size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={userSort}
                                    onChange={e => setUserSort(e.target.value)}
                                >
                                    <option value="newest">Sort: Newest First</option>
                                    <option value="oldest">Sort: Oldest First</option>
                                    <option value="name_asc">Sort: Name (A - Z)</option>
                                    <option value="name_desc">Sort: Name (Z - A)</option>
                                    <option value="login_desc">Sort: Recent Login</option>
                                </select>
                            </div>
                        </div>

                        {/* Users Table */}
                        {filteredUsers.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <Users size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                                <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No users match your criteria</p>
                                <p style={{ fontSize: '0.875rem', margin: 0 }}>Try clearing your search query or changing filters.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="admin-table-hint">👈 Swipe table horizontally to view full table 👉</div>
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <th style={{ padding: '0.85rem 1rem' }}>User</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>Login Method</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>AI Tokens</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>Joined / Last Login</th>
                                                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                    <tbody>
                                        {filteredUsers.map(u => {
                                            const isGoogle = u.authMethod === 'google' || !!u.googleId;
                                            return (
                                                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                            <div style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '50%',
                                                                background: isGoogle
                                                                    ? 'linear-gradient(135deg, #ea4335, #fbbc05)'
                                                                    : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.85rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                {(u.name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span>{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        {isGoogle ? (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                padding: '0.25rem 0.65rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.775rem',
                                                                fontWeight: 700,
                                                                background: 'rgba(234, 67, 53, 0.12)',
                                                                color: '#ef4444',
                                                                border: '1px solid rgba(234, 67, 53, 0.25)'
                                                            }}>
                                                                <span style={{ fontWeight: 900, fontSize: '0.85rem' }}>G</span> Google
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                padding: '0.25rem 0.65rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.775rem',
                                                                fontWeight: 600,
                                                                background: 'rgba(99, 102, 241, 0.12)',
                                                                color: 'var(--accent-primary)',
                                                                border: '1px solid rgba(99, 102, 241, 0.25)'
                                                            }}>
                                                                <Mail size={13} /> Email / Pass
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.35rem',
                                                                padding: '0.25rem 0.65rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 700,
                                                                background: (u.aiTokens !== undefined ? u.aiTokens : 50) > 10 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                                color: (u.aiTokens !== undefined ? u.aiTokens : 50) > 10 ? 'var(--accent-primary)' : 'var(--error)',
                                                                border: `1px solid ${(u.aiTokens !== undefined ? u.aiTokens : 50) > 10 ? 'rgba(99, 102, 241, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                                                                width: 'fit-content'
                                                            }}>
                                                                <Zap size={13} fill="currentColor" /> {u.aiTokens !== undefined ? u.aiTokens : 50}
                                                            </span>
                                                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                                                {u.aiTokensUsed || 0} questions used
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '1rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.04em',
                                                            background: u.role === 'admin' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                            color: u.role === 'admin' ? 'var(--accent-tertiary)' : 'var(--accent-primary)',
                                                            border: `1px solid ${u.role === 'admin' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                                                        }}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '1rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            background: u.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                            color: u.isActive ? 'var(--success)' : 'var(--error)'
                                                        }}>
                                                            {u.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                                                        <div>Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</div>
                                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                            Login: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setTokenModalUser(u);
                                                                    setTokenAmountInput(50);
                                                                    setTokenActionType('add');
                                                                }}
                                                                className="btn"
                                                                style={{
                                                                    padding: '0.45rem 0.65rem',
                                                                    fontSize: '0.8rem',
                                                                    background: 'rgba(99, 102, 241, 0.12)',
                                                                    color: 'var(--accent-primary)',
                                                                    border: '1px solid rgba(99, 102, 241, 0.3)'
                                                                }}
                                                                title="Manage AI Tokens"
                                                            >
                                                                <Zap size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => viewUserDetails(u._id)}
                                                                className="btn btn-secondary"
                                                                style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                                                                title="View User Details"
                                                            >
                                                                <Eye size={15} />
                                                            </button>
                                                            {u.role !== 'admin' && (
                                                                <button
                                                                    onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                                                    className="btn"
                                                                    style={{
                                                                        padding: '0.45rem 0.65rem',
                                                                        fontSize: '0.8rem',
                                                                        background: u.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                                        color: u.isActive ? 'var(--error)' : 'var(--success)',
                                                                        border: `1px solid ${u.isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                                                                    }}
                                                                    title={u.isActive ? 'Deactivate User' : 'Activate User'}
                                                                >
                                                                    {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                                                                </button>
                                                            )}
                                                            {u._id !== user._id && (
                                                                <button
                                                                    onClick={() => handleRoleChange(u._id, u.role)}
                                                                    className="btn"
                                                                    style={{
                                                                        padding: '0.45rem 0.65rem',
                                                                        fontSize: '0.8rem',
                                                                        background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                                        color: u.role === 'admin' ? 'var(--error)' : 'var(--accent-primary)',
                                                                        border: `1px solid ${u.role === 'admin' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                                                                    }}
                                                                    title={u.role === 'admin' ? 'Remove Admin Role' : 'Promote to Admin'}
                                                                >
                                                                    <Shield size={15} fill={u.role === 'admin' ? 'currentColor' : 'none'} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        )}
                    </div>
                )}

                {/* TAB 2: QUIZZES */}
                {activeTab === 'quizzes' && (
                    <div className="card" style={{ padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Quiz & Poll Management</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                    Showing {filteredQuizzes.length} of {quizzes.length} quizzes & polls
                                </p>
                            </div>
                            {hasQuizFilters && (
                                <button
                                    onClick={() => {
                                        setQuizSearch('');
                                        setQuizTypeFilter('all');
                                        setQuizLengthFilter('all');
                                        setQuizSort('newest');
                                    }}
                                    className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                                >
                                    <RotateCcw size={14} /> Reset Filters
                                </button>
                            )}
                        </div>

                        {/* Filter & Sort Bar */}
                        <div className="admin-filter-bar">
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="admin-filter-control"
                                    placeholder="Search by title or creator..."
                                    value={quizSearch}
                                    onChange={e => setQuizSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem', paddingRight: quizSearch ? '2rem' : '0.85rem' }}
                                />
                                {quizSearch && (
                                    <button
                                        onClick={() => setQuizSearch('')}
                                        style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Type Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={quizTypeFilter}
                                    onChange={e => setQuizTypeFilter(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="quiz">Quizzes Only</option>
                                    <option value="poll">Live Polls Only</option>
                                </select>
                            </div>

                            {/* Question Count Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BookOpen size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={quizLengthFilter}
                                    onChange={e => setQuizLengthFilter(e.target.value)}
                                >
                                    <option value="all">All Lengths</option>
                                    <option value="short">Short (1 - 5 Qs)</option>
                                    <option value="medium">Medium (6 - 15 Qs)</option>
                                    <option value="long">Long (16+ Qs)</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowUpDown size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={quizSort}
                                    onChange={e => setQuizSort(e.target.value)}
                                >
                                    <option value="newest">Sort: Newest First</option>
                                    <option value="oldest">Sort: Oldest First</option>
                                    <option value="title_asc">Sort: Title (A - Z)</option>
                                    <option value="title_desc">Sort: Title (Z - A)</option>
                                    <option value="questions_desc">Sort: Most Questions</option>
                                    <option value="questions_asc">Sort: Fewest Questions</option>
                                </select>
                            </div>
                        </div>

                        {/* Quizzes List */}
                        {filteredQuizzes.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <BookOpen size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                                <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No quizzes match your criteria</p>
                                <p style={{ fontSize: '0.875rem', margin: 0 }}>Try clearing your search query or changing filters.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {filteredQuizzes.map(quiz => {
                                    const creator = quiz.creatorEmail || (quiz.creatorId && (quiz.creatorId.email || quiz.creatorId.name)) || 'Unknown Host';
                                    return (
                                        <div
                                            key={quiz._id}
                                            className="card"
                                            style={{
                                                padding: '1.25rem 1.5rem',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: '1rem'
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: '260px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                                        {quiz.title}
                                                    </h3>
                                                    <span style={{
                                                        padding: '0.2rem 0.65rem',
                                                        borderRadius: '1rem',
                                                        fontSize: '0.725rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        background: quiz.type === 'poll' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                        color: quiz.type === 'poll' ? 'var(--success)' : 'var(--accent-primary)',
                                                        border: `1px solid ${quiz.type === 'poll' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                                                    }}>
                                                        {quiz.type}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                    <span>Creator: <strong style={{ color: 'var(--text-primary)' }}>{creator}</strong></span>
                                                    <span>Questions: <strong>{quiz.questions?.length || 0}</strong></span>
                                                    <span>Created: {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: LOGS */}
                {activeTab === 'logs' && (
                    <div className="card" style={{ padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Activity & Audit Logs</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                    Showing {filteredLogs.length} of {logs.length} logged events
                                </p>
                            </div>
                            {hasLogFilters && (
                                <button
                                    onClick={() => {
                                        setLogSearch('');
                                        setLogActionFilter('all');
                                        setLogTimeFilter('all');
                                        setLogSort('newest');
                                    }}
                                    className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                                >
                                    <RotateCcw size={14} /> Reset Filters
                                </button>
                            )}
                        </div>

                        {/* Filter & Sort Bar */}
                        <div className="admin-filter-bar">
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="admin-filter-control"
                                    placeholder="Search user, action, IP, details..."
                                    value={logSearch}
                                    onChange={e => setLogSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem', paddingRight: logSearch ? '2rem' : '0.85rem' }}
                                />
                                {logSearch && (
                                    <button
                                        onClick={() => setLogSearch('')}
                                        style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Action Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={logActionFilter}
                                    onChange={e => setLogActionFilter(e.target.value)}
                                >
                                    <option value="all">All Actions</option>
                                    <option value="login">Logins</option>
                                    <option value="signup">Signups</option>
                                    <option value="quiz">Quiz Actions</option>
                                    <option value="admin">Admin Actions</option>
                                </select>
                            </div>

                            {/* Time Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={logTimeFilter}
                                    onChange={e => setLogTimeFilter(e.target.value)}
                                >
                                    <option value="all">All Time</option>
                                    <option value="24h">Past 24 Hours</option>
                                    <option value="7d">Past 7 Days</option>
                                    <option value="30d">Past 30 Days</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowUpDown size={16} color="var(--text-secondary)" />
                                <select
                                    className="admin-filter-control"
                                    value={logSort}
                                    onChange={e => setLogSort(e.target.value)}
                                >
                                    <option value="newest">Sort: Most Recent First</option>
                                    <option value="oldest">Sort: Oldest First</option>
                                    <option value="action_asc">Sort: Action (A - Z)</option>
                                    <option value="user_asc">Sort: User Name (A - Z)</option>
                                </select>
                            </div>
                        </div>

                        {/* Logs Table */}
                        {filteredLogs.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <Activity size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                                <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No logs match your criteria</p>
                                <p style={{ fontSize: '0.875rem', margin: 0 }}>Try clearing your search query or changing filters.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="admin-table-hint">👈 Swipe table horizontally to view full audit log 👉</div>
                                <div className="admin-table-container">
                                    <table className="admin-table admin-table-logs">
                                        <thead>
                                            <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>User</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                                                <th style={{ padding: '0.85rem 1rem' }}>Details Summary</th>
                                                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>View</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLogs.map((log, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                                                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                        <div>{log.userName || 'Anonymous'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.userEmail || ''}</div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <span style={{
                                                            padding: '0.2rem 0.6rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            background: log.action.includes('admin') ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                            color: log.action.includes('admin') ? 'var(--accent-tertiary)' : 'var(--accent-primary)',
                                                            border: `1px solid ${log.action.includes('admin') ? 'rgba(236, 72, 153, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                                                        }}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {JSON.stringify(log.details)}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => setSelectedLog(log)}
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                                                            title="View Complete Payload"
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: OVERVIEW */}
                {activeTab === 'overview' && stats && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* User Breakdown & System Status Card */}
                        <div className="card" style={{ padding: '1.75rem' }}>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                <TrendingUp size={22} color="var(--accent-primary)" />
                                User Breakdown & System Status
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active Accounts</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>{stats.users.active}</div>
                                </div>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Inactive Accounts</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: stats.users.inactive > 0 ? 'var(--error)' : 'var(--text-muted)' }}>{stats.users.inactive}</div>
                                </div>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Google Sign-In Users</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ea4335' }}>{userAuthStats.googleCount}</div>
                                </div>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email / Password Users</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{userAuthStats.emailCount}</div>
                                </div>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Quiz Plays / Takers</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f472b6' }}>{stats.quizzes?.totalParticipants || 0}</div>
                                </div>
                                <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Unique Quiz Players</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ec4899' }}>{stats.quizzes?.uniqueParticipants || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: AI TOKENS CONFIGURATION */}
                {activeTab === 'tokens' && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* AI Token System Configuration Card */}
                        <div className="card" style={{ padding: '1.75rem', border: '1.5px solid rgba(99, 102, 241, 0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.12)', borderRadius: '0.6rem' }}>
                                        <Zap size={22} color="var(--accent-primary)" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                            AI Quiz Generation & Token Configuration
                                        </h2>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                            Configure global default AI questions quota for new users & view platform token consumption
                                        </p>
                                    </div>
                                </div>
                                <span style={{
                                    padding: '0.3rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    color: 'var(--accent-primary)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)'
                                }}>
                                    1 TOKEN = 1 AI QUESTION
                                </span>
                            </div>

                            {/* Token Quota Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Default New User Quota</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                                        {systemSettings.defaultAiTokens || 50} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>tokens</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Given upon signup</div>
                                </div>

                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Total Tokens Available</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                                        {users.reduce((sum, u) => sum + (u.aiTokens !== undefined ? u.aiTokens : 50), 0)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Across all {users.length} users</div>
                                </div>

                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>AI Questions Generated</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ec4899' }}>
                                        {users.reduce((sum, u) => sum + (u.aiTokensUsed || 0), 0)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Total AI questions produced</div>
                                </div>
                            </div>

                            {/* Configuration Form */}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: '1.25rem',
                                borderRadius: '1rem',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <div style={{ flex: '1 1 300px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                        Default AI Tokens for New Signups
                                    </label>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                        Every new user automatically receives this number of AI tokens (e.g., 50 tokens = 50 AI questions). After depleting, users will need to buy tokens.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <div style={{ position: 'relative', width: '130px' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10000"
                                            value={defaultTokensInput}
                                            onChange={e => setDefaultTokensInput(e.target.value)}
                                            className="admin-filter-control"
                                            style={{
                                                padding: '0.6rem 0.85rem',
                                                fontSize: '1.05rem',
                                                fontWeight: 800,
                                                textAlign: 'center'
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={isSavingSettings}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '0.65rem 1.25rem',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        <Zap size={16} />
                                        {isSavingSettings ? 'Saving...' : 'Save Default Quota'}
                                    </button>
                                </div>
                            </div>

                            {settingsSaveMsg && (
                                <div style={{
                                    marginTop: '0.85rem',
                                    padding: '0.6rem 1rem',
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    color: 'var(--success)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    border: '1px solid rgba(16, 185, 129, 0.25)'
                                }}>
                                    {settingsSaveMsg}
                                </div>
                            )}
                        </div>

                        {/* AI Token Upgrade Requests Card */}
                        <div className="card" style={{ padding: '1.75rem', border: pendingTokenRequests.length > 0 ? '1.5px solid #f59e0b' : '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <div style={{ padding: '0.5rem', background: pendingTokenRequests.length > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.12)', borderRadius: '0.6rem' }}>
                                        <Sparkles size={20} color={pendingTokenRequests.length > 0 ? '#f59e0b' : 'var(--accent-primary)'} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                            AI Token Upgrade Requests
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                                            User requests to purchase AI Tokens ($1 for 50 Tokens)
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {pendingTokenRequests.length > 0 ? (
                                        <span style={{
                                            padding: '0.35rem 0.85rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            background: 'rgba(245, 158, 11, 0.15)',
                                            color: '#f59e0b',
                                            border: '1px solid rgba(245, 158, 11, 0.35)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                                            {pendingTokenRequests.length} Pending Approval
                                        </span>
                                    ) : (
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.775rem',
                                            fontWeight: 600,
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-muted)'
                                        }}>
                                            All Caught Up
                                        </span>
                                    )}
                                </div>
                            </div>

                            {tokenRequests.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '0.75rem' }}>
                                    <Zap size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.3, color: 'var(--accent-primary)' }} />
                                    <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>No Token Requests Yet</p>
                                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>When users click 'Request Tokens' in their dashboard, their requests will appear here for one-click approval.</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Active Pending Requests Section */}
                                    {pendingTokenRequests.length === 0 ? (
                                        <div style={{
                                            padding: '1.25rem 1.5rem',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '1rem',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '0.4rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex' }}>
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                        All Caught Up
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        No pending token upgrade requests requiring review right now.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="admin-table-hint">👈 Swipe table horizontally to view full details 👉</div>
                                            <div className="admin-table-container">
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            <th style={{ padding: '0.85rem 1rem' }}>User</th>
                                                            <th style={{ padding: '0.85rem 1rem' }}>Tokens Requested</th>
                                                            <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                                                            <th style={{ padding: '0.85rem 1rem' }}>Date & Note</th>
                                                            <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                                                            <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pendingTokenRequests.map(req => {
                                                            const isProcessing = isProcessingTokenReq === req._id;
                                                            return (
                                                                <tr key={req._id} style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(245, 158, 11, 0.04)' }}>
                                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{req.userName}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.userEmail}</div>
                                                                    </td>
                                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                                                                            <Zap size={14} fill="currentColor" />
                                                                            {req.tokensRequested || 50} Tokens
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                                        ${req.amount || 1}
                                                                    </td>
                                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                                            {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </div>
                                                                        {req.note && (
                                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                                                                                "{req.note}"
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                                                            Pending
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                                                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                                                            <button
                                                                                onClick={() => handleApproveTokenRequest(req._id)}
                                                                                disabled={isProcessing}
                                                                                className="btn btn-primary"
                                                                                style={{
                                                                                    padding: '0.4rem 0.8rem',
                                                                                    fontSize: '0.8rem',
                                                                                    fontWeight: 700,
                                                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                                                    borderColor: '#10b981',
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '0.35rem'
                                                                                }}
                                                                            >
                                                                                <Zap size={14} fill="currentColor" />
                                                                                {isProcessing ? 'Processing...' : `Approve (+${req.tokensRequested || 50})`}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRejectTokenRequest(req._id)}
                                                                                disabled={isProcessing}
                                                                                className="btn btn-secondary"
                                                                                style={{
                                                                                    padding: '0.4rem 0.65rem',
                                                                                    fontSize: '0.8rem',
                                                                                    color: 'var(--error)',
                                                                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '0.3rem'
                                                                                }}
                                                                                title="Reject and email user"
                                                                            >
                                                                                <X size={14} /> Reject
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Collapsible Accordion for Processed / Past Requests */}
                                    {processedTokenRequests.length > 0 && (
                                        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => setShowProcessedRequests(!showProcessedRequests)}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '0.75rem',
                                                    padding: '0.75rem 1.15rem',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Archive size={16} color="var(--accent-primary)" />
                                                    <span>Processed & Past Requests ({processedTokenRequests.length})</span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                        ({processedTokenRequests.filter(r => r.status === 'approved').length} Approved, {processedTokenRequests.filter(r => r.status === 'rejected').length} Rejected)
                                                    </span>
                                                </span>
                                                {showProcessedRequests ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>

                                            {showProcessedRequests && (
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <div className="admin-table-container">
                                                        <table className="admin-table">
                                                            <thead>
                                                                <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                    <th style={{ padding: '0.75rem 1rem' }}>User</th>
                                                                    <th style={{ padding: '0.75rem 1rem' }}>Tokens</th>
                                                                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                                                                    <th style={{ padding: '0.75rem 1rem' }}>Date & Notes</th>
                                                                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {processedTokenRequests.map(req => {
                                                                    const isApproved = req.status === 'approved';
                                                                    const isProcessing = isProcessingTokenReq === req._id;
                                                                    return (
                                                                        <tr key={req._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{req.userName}</div>
                                                                                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{req.userEmail}</div>
                                                                            </td>
                                                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                                                <span style={{ fontWeight: 700, color: isApproved ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                                                    ⚡ {req.tokensRequested || 50} Tokens
                                                                                </span>
                                                                            </td>
                                                                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                                                                ${req.amount || 1}
                                                                            </td>
                                                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                                                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                                                                                    {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </div>
                                                                                {req.note && (
                                                                                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.15rem' }}>
                                                                                        "{req.note}"
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                                                {isApproved ? (
                                                                                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.4rem', fontSize: '0.725rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                                                                                        Approved ✓
                                                                                    </span>
                                                                                ) : (
                                                                                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.4rem', fontSize: '0.725rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.12)', color: 'var(--error)' }}>
                                                                                        Rejected ✗
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                                                <button
                                                                                    onClick={() => handleDeleteTokenRequest(req._id)}
                                                                                    disabled={isProcessing}
                                                                                    className="btn btn-secondary"
                                                                                    style={{
                                                                                        padding: '0.35rem 0.65rem',
                                                                                        fontSize: '0.75rem',
                                                                                        color: 'var(--error)',
                                                                                        borderColor: 'rgba(239, 68, 68, 0.3)',
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '0.3rem'
                                                                                    }}
                                                                                    title="Delete record from history"
                                                                                >
                                                                                    <Trash2 size={13} /> Delete
                                                                                </button>
                                                                            </td>
                                                                        </tr>
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
                            )}
                        </div>

                        {/* User Token Balances Quick Management Table */}
                        <div className="card" style={{ padding: '1.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                        User AI Token Balances
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                                        Showing {filteredTokenUsers.length} of {users.length} user token balances
                                    </p>
                                </div>
                                {hasTokenFilters && (
                                    <button
                                        onClick={() => {
                                            setTokenUserSearch('');
                                            setTokenRoleFilter('all');
                                            setTokenBalanceFilter('all');
                                            setTokenSort('tokens_desc');
                                        }}
                                        className="btn btn-secondary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                                    >
                                        <RotateCcw size={14} /> Reset Filters
                                    </button>
                                )}
                            </div>

                            {/* Filter & Sort Bar */}
                            <div className="admin-filter-bar">
                                {/* Search */}
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        className="admin-filter-control"
                                        placeholder="Search by name or email..."
                                        value={tokenUserSearch}
                                        onChange={e => setTokenUserSearch(e.target.value)}
                                        style={{ paddingLeft: '2.5rem', paddingRight: tokenUserSearch ? '2rem' : '0.85rem' }}
                                    />
                                    {tokenUserSearch && (
                                        <button
                                            onClick={() => setTokenUserSearch('')}
                                            style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Role Filter */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={16} color="var(--text-secondary)" />
                                    <select
                                        className="admin-filter-control"
                                        value={tokenRoleFilter}
                                        onChange={e => setTokenRoleFilter(e.target.value)}
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="admin">Admins Only</option>
                                        <option value="user">Regular Users</option>
                                    </select>
                                </div>

                                {/* Balance Filter */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Filter size={16} color="var(--text-secondary)" />
                                    <select
                                        className="admin-filter-control"
                                        value={tokenBalanceFilter}
                                        onChange={e => setTokenBalanceFilter(e.target.value)}
                                    >
                                        <option value="all">All Balances</option>
                                        <option value="zero">0 Tokens (Depleted)</option>
                                        <option value="low">Low (1 - 25 Tokens)</option>
                                        <option value="standard">Standard (26 - 50 Tokens)</option>
                                        <option value="high">High (51+ Tokens)</option>
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ArrowUpDown size={16} color="var(--text-secondary)" />
                                    <select
                                        className="admin-filter-control"
                                        value={tokenSort}
                                        onChange={e => setTokenSort(e.target.value)}
                                    >
                                        <option value="tokens_desc">Sort: Most Tokens Left</option>
                                        <option value="tokens_asc">Sort: Fewest Tokens Left</option>
                                        <option value="used_desc">Sort: Most Questions Produced</option>
                                        <option value="used_asc">Sort: Fewest Questions Produced</option>
                                        <option value="name_asc">Sort: Name (A - Z)</option>
                                        <option value="name_desc">Sort: Name (Z - A)</option>
                                        <option value="newest">Sort: Newest Users</option>
                                    </select>
                                </div>
                            </div>

                            {/* Table / Empty State */}
                            {filteredTokenUsers.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <Zap size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                                    <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No users match your token filter criteria</p>
                                    <p style={{ fontSize: '0.875rem', margin: 0 }}>Try clearing your search query or changing filters.</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="admin-table-hint">👈 Swipe table horizontally to view full details 👉</div>
                                    <div className="admin-table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    <th style={{ padding: '0.85rem 1rem' }}>User</th>
                                                    <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                                                    <th style={{ padding: '0.85rem 1rem' }}>Available Tokens</th>
                                                    <th style={{ padding: '0.85rem 1rem' }}>Questions Produced</th>
                                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredTokenUsers.map(u => (
                                                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                            <div>{u.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem' }}>
                                                            <span style={{
                                                                padding: '0.2rem 0.55rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                background: u.role === 'admin' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                                color: u.role === 'admin' ? 'var(--accent-tertiary)' : 'var(--accent-primary)',
                                                                textTransform: 'capitalize'
                                                            }}>
                                                                {u.role || 'user'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem' }}>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.3rem',
                                                                fontWeight: 800,
                                                                color: (u.aiTokens !== undefined ? u.aiTokens : 50) === 0 ? 'var(--error)' : 'var(--accent-primary)',
                                                                fontSize: '0.95rem'
                                                            }}>
                                                                <Zap size={14} fill="currentColor" />
                                                                {u.aiTokens !== undefined ? u.aiTokens : 50}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                            {u.aiTokensUsed || 0} questions
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setTokenModalUser(u);
                                                                    setTokenAmountInput(50);
                                                                    setTokenActionType('add');
                                                                }}
                                                                className="btn btn-secondary"
                                                                style={{
                                                                    padding: '0.4rem 0.75rem',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 700,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.35rem',
                                                                    color: 'var(--accent-primary)',
                                                                    borderColor: 'rgba(99, 102, 241, 0.3)'
                                                                }}
                                                            >
                                                                <Zap size={13} /> Manage Tokens
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="admin-modal-card animate-fade-in"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    background: (selectedUser.user?.authMethod === 'google' || !!selectedUser.user?.googleId)
                                        ? 'linear-gradient(135deg, #ea4335, #fbbc05)'
                                        : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                    color: 'white',
                                    fontWeight: '800',
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {(selectedUser.user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{selectedUser.user?.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedUser.user?.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Auth Method</div>
                                    <div style={{ fontWeight: 700, textTransform: 'capitalize', color: selectedUser.user?.authMethod === 'google' ? '#ea4335' : 'var(--accent-primary)' }}>
                                        {selectedUser.user?.authMethod === 'google' ? 'Google Account' : 'Email / Password'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account Role</div>
                                    <div style={{ fontWeight: 700, textTransform: 'capitalize', color: selectedUser.user?.role === 'admin' ? 'var(--accent-tertiary)' : 'var(--text-primary)' }}>
                                        {selectedUser.user?.role || 'User'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
                                    <div style={{ fontWeight: 700, color: selectedUser.user?.isActive ? 'var(--success)' : 'var(--error)' }}>
                                        {selectedUser.user?.isActive ? 'Active' : 'Deactivated'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Tokens</div>
                                    <div style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>
                                        ⚡ {selectedUser.user?.aiTokens !== undefined ? selectedUser.user?.aiTokens : 50}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => {
                                        const target = users.find(u => u._id === selectedUser.user?._id) || selectedUser.user;
                                        setTokenModalUser(target);
                                        setTokenAmountInput(50);
                                        setTokenActionType('add');
                                    }}
                                    className="btn btn-primary"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.85rem',
                                        padding: '0.5rem 1rem'
                                    }}
                                >
                                    <Zap size={15} /> Manage AI Tokens
                                </button>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Recent Quizzes Created</h4>
                                {selectedUser.quizzes?.length === 0 ? (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>No quizzes created yet</div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                                        {selectedUser.quizzes?.map(q => (
                                            <div key={q._id} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                                <span style={{ fontWeight: 600 }}>{q.title}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{q.questions?.length || 0} Qs</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage / Grant AI Tokens Modal */}
            {tokenModalUser && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setTokenModalUser(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="admin-modal-card animate-fade-in"
                        style={{ maxWidth: '520px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-primary)'
                                }}>
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Manage AI Tokens</h3>
                                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                                        For <strong>{tokenModalUser.name}</strong> ({tokenModalUser.email})
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setTokenModalUser(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Current Token Stats Banner */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                            background: 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: '0.85rem',
                            marginBottom: '1.25rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Available Tokens</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                                    {tokenModalUser.aiTokens !== undefined ? tokenModalUser.aiTokens : 50}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Questions Generated</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {tokenModalUser.aiTokensUsed || 0}
                                </div>
                            </div>
                        </div>

                        {/* Action Selector */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                Token Adjustment Mode
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setTokenActionType('add')}
                                    className="btn"
                                    style={{
                                        padding: '0.6rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        borderRadius: '0.6rem',
                                        background: tokenActionType === 'add' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                        color: tokenActionType === 'add' ? 'white' : 'var(--text-secondary)',
                                        border: `1.5px solid ${tokenActionType === 'add' ? 'var(--accent-primary)' : 'var(--border-color)'}`
                                    }}
                                >
                                    + Add Tokens
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTokenActionType('set')}
                                    className="btn"
                                    style={{
                                        padding: '0.6rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        borderRadius: '0.6rem',
                                        background: tokenActionType === 'set' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                        color: tokenActionType === 'set' ? 'white' : 'var(--text-secondary)',
                                        border: `1.5px solid ${tokenActionType === 'set' ? 'var(--accent-primary)' : 'var(--border-color)'}`
                                    }}
                                >
                                    = Set Exact Balance
                                </button>
                            </div>
                        </div>

                        {/* Preset Quick Buttons (if add mode) */}
                        {tokenActionType === 'add' && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                                    Quick Presets
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                                    {[25, 50, 100, 250].map(amt => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setTokenAmountInput(amt)}
                                            className="btn btn-secondary"
                                            style={{
                                                padding: '0.45rem',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                background: tokenAmountInput === amt ? 'rgba(99, 102, 241, 0.15)' : undefined,
                                                color: tokenAmountInput === amt ? 'var(--accent-primary)' : undefined,
                                                borderColor: tokenAmountInput === amt ? 'var(--accent-primary)' : undefined
                                            }}
                                        >
                                            +{amt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Amount Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                                {tokenActionType === 'add' ? 'Tokens to Add' : 'New Exact Token Balance'}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10000"
                                value={tokenAmountInput}
                                onChange={e => setTokenAmountInput(e.target.value)}
                                className="admin-filter-control"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    fontSize: '1.1rem',
                                    fontWeight: 700
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setTokenModalUser(null)}
                                className="btn btn-secondary"
                                style={{ padding: '0.65rem 1.25rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleGrantTokens}
                                disabled={isGrantingTokens}
                                className="btn btn-primary"
                                style={{
                                    padding: '0.65rem 1.5rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontWeight: 700
                                }}
                            >
                                <Zap size={16} />
                                {isGrantingTokens ? 'Updating...' : (tokenActionType === 'add' ? 'Add Tokens' : 'Set Balance')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Details Modal */}
            {selectedLog && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setSelectedLog(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="admin-modal-card animate-fade-in"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Audit Log Details</h3>
                            <button onClick={() => setSelectedLog(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{selectedLog.action}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '0.75rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</div>
                                    <div style={{ fontWeight: 600 }}>{selectedLog.userName || 'Unknown'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedLog.userEmail}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(selectedLog.timestamp).toLocaleString()}</div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Payload & Details</div>
                                <pre style={{
                                    background: 'var(--bg-secondary)',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    overflowX: 'auto',
                                    fontSize: '0.825rem',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    fontFamily: 'monospace',
                                    maxHeight: '220px'
                                }}>
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <div>IP Address: <strong>{selectedLog.ipAddress || 'N/A'}</strong></div>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedLog.userAgent}>
                                    User Agent: {selectedLog.userAgent || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
