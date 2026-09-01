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
    KeyRound
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

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

    useEffect(() => {
        const currentUser = localStorage.getItem('current_user');
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(currentUser);
        setUser(userData);

        if (userData.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            navigate('/dashboard');
            return;
        }

        loadAdminData(userData._id);
    }, [navigate]);

    const loadAdminData = async (userId) => {
        try {
            // Fetch stats
            const statsRes = await fetch(`/api/admin/stats?userId=${userId}`);
            const statsData = await statsRes.json();
            if (statsData.success) {
                setStats(statsData.stats);
            }

            // Fetch users
            const usersRes = await fetch(`/api/admin/users?userId=${userId}`);
            const usersData = await usersRes.json();
            if (usersData.success) {
                setUsers(usersData.users);
            }

            // Fetch quizzes
            const quizzesRes = await fetch(`/api/admin/quizzes?userId=${userId}`);
            const quizzesData = await quizzesRes.json();
            if (quizzesData.success) {
                setQuizzes(quizzesData.quizzes);
            }

            // Fetch logs (full list)
            const logsRes = await fetch(`/api/admin/logs?userId=${userId}&limit=250`);
            const logsData = await logsRes.json();
            if (logsData.success) {
                setLogs(logsData.logs || []);
            } else if (statsData.recentActivities) {
                setLogs(statsData.recentActivities || []);
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

    if (!user || user.role !== 'admin') return null;
    if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading admin dashboard...</div>;

    const hasUserFilters = userSearch || userRoleFilter !== 'all' || userStatusFilter !== 'all' || userAuthFilter !== 'all' || userSort !== 'newest';
    const hasQuizFilters = quizSearch || quizTypeFilter !== 'all' || quizLengthFilter !== 'all' || quizSort !== 'newest';
    const hasLogFilters = logSearch || logActionFilter !== 'all' || logTimeFilter !== 'all' || logSort !== 'newest';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1.5rem' }}>
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.75rem' }} title="Back to Dashboard">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Shield size={32} color="var(--accent-primary)" />
                                <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0' }}>Admin Dashboard</h1>
                            </div>
                            <p className="subtitle" style={{ marginBottom: '0', fontSize: '0.95rem' }}>Manage users, authentication methods, quizzes, and monitor activity</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.9rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem' }}>
                                    <Users size={26} color="var(--accent-primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1 }}>{stats.users.total}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Users</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.2rem', fontWeight: '600' }}>
                                        {stats.users.active} active • {stats.users.admins} admin
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.9rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem' }}>
                                    <BookOpen size={26} color="var(--success)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1 }}>{stats.quizzes.total}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Quizzes</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        Interactive & Live
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.9rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '1rem' }}>
                                    <Activity size={26} color="var(--accent-tertiary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1 }}>{stats.activities.total}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Activity Logs</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
                                        Audit History
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'users', label: `Users (${users.length})`, icon: Users },
                        { id: 'quizzes', label: `Quizzes (${quizzes.length})`, icon: BookOpen },
                        { id: 'logs', label: `Logs (${logs.length})`, icon: Activity }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.65rem 1.25rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    borderRadius: '0.75rem',
                                    background: isActive ? 'var(--accent-primary)' : 'var(--bg-card)',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    border: `1.5px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    transition: 'all 0.2s'
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
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '0.85rem',
                            marginBottom: '1.5rem',
                            background: 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: '1rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Search by name or email..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem', paddingRight: userSearch ? '2rem' : '1rem', height: '42px', fontSize: '0.875rem' }}
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
                                    className="input"
                                    value={userAuthFilter}
                                    onChange={e => setUserAuthFilter(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
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
                                    className="input"
                                    value={userRoleFilter}
                                    onChange={e => setUserRoleFilter(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
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
                                    className="input"
                                    value={userStatusFilter}
                                    onChange={e => setUserStatusFilter(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
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
                                    className="input"
                                    value={userSort}
                                    onChange={e => setUserSort(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
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
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <th style={{ padding: '0.85rem 1rem' }}>User</th>
                                            <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                                            <th style={{ padding: '0.85rem 1rem' }}>Login Method</th>
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
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            background: 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: '1rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Search by title or creator..."
                                    value={quizSearch}
                                    onChange={e => setQuizSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem', paddingRight: quizSearch ? '2rem' : '1rem', height: '42px', fontSize: '0.875rem' }}
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
                                    className="input"
                                    value={quizTypeFilter}
                                    onChange={e => setQuizTypeFilter(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
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
                                    className="input"
                                    value={quizLengthFilter}
                                    onChange={e => setQuizLengthFilter(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
                                >
                                    <option value="all">Any Question Count</option>
                                    <option value="short">Short (1 - 5 Questions)</option>
                                    <option value="medium">Medium (6 - 15 Questions)</option>
                                    <option value="long">Long (16+ Questions)</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowUpDown size={16} color="var(--text-secondary)" />
                                <select
                                    className="input"
                                    value={quizSort}
                                    onChange={e => setQuizSort(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
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
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            background: 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: '1rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Search user, action, IP, details..."
                                    value={logSearch}
                                    onChange={e => setLogSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem', paddingRight: logSearch ? '2rem' : '1rem', height: '42px', fontSize: '0.875rem' }}
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
                                    className="input"
                                    value={logActionFilter}
                                    onChange={e => setLogActionFilter(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
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
                                    className="input"
                                    value={logTimeFilter}
                                    onChange={e => setLogTimeFilter(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
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
                                    className="input"
                                    value={logSort}
                                    onChange={e => setLogSort(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.875rem', flex: 1 }}
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
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
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
                        )}
                    </div>
                )}

                {/* TAB 4: OVERVIEW */}
                {activeTab === 'overview' && stats && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
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
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1.5rem'
                    }}
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="card animate-fade-in"
                        style={{
                            width: '100%',
                            maxWidth: '650px',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            padding: '2rem'
                        }}
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Login Method</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem', color: (selectedUser.user?.authMethod === 'google' || !!selectedUser.user?.googleId) ? '#ea4335' : 'var(--accent-primary)' }}>
                                        {(selectedUser.user?.authMethod === 'google' || !!selectedUser.user?.googleId) ? 'Google Sign-In' : 'Email & Password'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem', color: selectedUser.user?.role === 'admin' ? 'var(--accent-tertiary)' : 'var(--accent-primary)' }}>
                                        {selectedUser.user?.role?.toUpperCase()}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem', color: selectedUser.user?.isActive ? 'var(--success)' : 'var(--error)' }}>
                                        {selectedUser.user?.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                    Created Quizzes ({selectedUser.quizzes?.count || 0})
                                </h4>
                                {selectedUser.quizzes?.items?.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                                        {selectedUser.quizzes.items.map(q => (
                                            <div key={q._id} style={{ padding: '0.6rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{q.title}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>{q.questions?.length || 0} Qs</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No quizzes created yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Details Modal */}
            {selectedLog && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1.5rem'
                    }}
                    onClick={() => setSelectedLog(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="card animate-fade-in"
                        style={{
                            width: '100%',
                            maxWidth: '650px',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            padding: '2rem'
                        }}
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '0.75rem' }}>
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
