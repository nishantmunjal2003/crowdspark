import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Activity, Shield, UserX, UserCheck, ArrowLeft, Eye, TrendingUp } from 'lucide-react';

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

    useEffect(() => {
        // Check if user is logged in and is admin
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

        // Load admin data
        loadAdminData(userData._id);
    }, [navigate]);

    const loadAdminData = async (userId) => {
        try {
            console.log('Loading admin data for user:', userId);

            // Fetch stats
            console.log('Fetching stats...');
            const statsRes = await fetch(`/api/admin/stats?userId=${userId}`);
            console.log('Stats response status:', statsRes.status);
            const statsData = await statsRes.json();
            console.log('Stats data:', statsData);

            if (statsData.success) {
                setStats(statsData.stats);
                setLogs(statsData.recentActivities || []);
            } else {
                console.error('Stats fetch failed:', statsData.error);
                alert('Failed to load statistics: ' + (statsData.error || 'Unknown error'));
            }

            // Fetch users
            console.log('Fetching users...');
            const usersRes = await fetch(`/api/admin/users?userId=${userId}`);
            console.log('Users response status:', usersRes.status);
            const usersData = await usersRes.json();
            console.log('Users data:', usersData);

            if (usersData.success) {
                setUsers(usersData.users);
                console.log('Loaded users:', usersData.users.length);
            } else {
                console.error('Users fetch failed:', usersData.error);
                alert('Failed to load users: ' + (usersData.error || 'Unknown error'));
            }

            // Fetch quizzes
            console.log('Fetching quizzes...');
            const quizzesRes = await fetch(`/api/admin/quizzes?userId=${userId}`);
            console.log('Quizzes response status:', quizzesRes.status);
            const quizzesData = await quizzesRes.json();
            console.log('Quizzes data:', quizzesData);

            if (quizzesData.success) {
                setQuizzes(quizzesData.quizzes);
                console.log('Loaded quizzes:', quizzesData.quizzes.length);
            } else {
                console.error('Quizzes fetch failed:', quizzesData.error);
                alert('Failed to load quizzes: ' + (quizzesData.error || 'Unknown error'));
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Error loading admin data:', err);
            alert('Error loading admin data: ' + err.message);
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (targetUserId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
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
                // Reload users
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
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
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
                // Reload users
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

    const viewUserDetails = async (userId) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}?userId=${user._id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedUser(data);
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    if (!user || user.role !== 'admin') return null;
    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading admin dashboard...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '1400px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Shield size={32} color="var(--accent-primary)" />
                            <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0' }}>Admin Dashboard</h1>
                        </div>
                        <p className="subtitle" style={{ marginBottom: '0', fontSize: '0.95rem' }}>Manage users, quizzes, and monitor activity</p>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem' }}>
                                    <Users size={24} color="var(--accent-primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.users.total}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Users</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>
                                        {stats.users.active} active
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem' }}>
                                    <BookOpen size={24} color="var(--success)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.quizzes.total}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Quizzes</div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '1rem' }}>
                                    <Activity size={24} color="var(--accent-tertiary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.activities.total}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Activity Logs</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {['overview', 'users', 'quizzes', 'logs'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="btn"
                            style={{
                                background: activeTab === tab ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                                border: `1px solid ${activeTab === tab ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'users' && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>User Management</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Last Login</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem' }}>{u.name}</td>
                                            <td style={{ padding: '1rem' }}>{u.email}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.75rem',
                                                    background: u.role === 'admin' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                                    color: u.role === 'admin' ? 'var(--accent-tertiary)' : 'var(--accent-primary)'
                                                }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.75rem',
                                                    background: u.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    color: u.isActive ? 'var(--success)' : 'var(--error)'
                                                }}>
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => viewUserDetails(u._id)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                                            className="btn"
                                                            style={{
                                                                padding: '0.5rem',
                                                                fontSize: '0.75rem',
                                                                background: u.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                                color: u.isActive ? 'var(--error)' : 'var(--success)'
                                                            }}
                                                            title={u.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                                        </button>
                                                    )}
                                                    {u._id !== user._id && (
                                                        <button
                                                            onClick={() => handleRoleChange(u._id, u.role)}
                                                            className="btn"
                                                            style={{
                                                                padding: '0.5rem',
                                                                fontSize: '0.75rem',
                                                                background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                                color: u.role === 'admin' ? 'var(--error)' : 'var(--accent-primary)'
                                                            }}
                                                            title={u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                                        >
                                                            <Shield size={16} fill={u.role === 'admin' ? 'currentColor' : 'none'} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'quizzes' && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>All Quizzes</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {quizzes.map(quiz => (
                                <div key={quiz._id} className="card" style={{ padding: '1rem', background: 'var(--bg-secondary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{quiz.title}</h3>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                Created by: {quiz.creatorEmail} | {quiz.questions?.length || 0} questions | {new Date(quiz.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            background: quiz.type === 'poll' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                            color: quiz.type === 'poll' ? 'var(--success)' : 'var(--accent-primary)'
                                        }}>
                                            {quiz.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Activity Logs</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>User</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Action</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Details</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>{log.userName}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.75rem',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    color: 'var(--accent-primary)'
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {JSON.stringify(log.details)}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.4rem', fontSize: '0.75rem' }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && stats && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div className="card">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={24} color="var(--accent-primary)" />
                                System Overview
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '1rem' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active Users</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.users.active}</div>
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '1rem' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Inactive Users</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.users.inactive}</div>
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '1rem' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Admin Users</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.users.admins}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Log Details Modal */}
            {selectedLog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }} onClick={() => setSelectedLog(null)}>
                    <div
                        onClick={e => e.stopPropagation()}
                        className="card"
                        style={{
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Log Details</h3>
                            <button onClick={() => setSelectedLog(null)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>✕</button>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-primary)' }}>{selectedLog.action}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</div>
                                    <div>{selectedLog.userName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedLog.userEmail}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</div>
                                    <div>{new Date(selectedLog.timestamp).toLocaleString()}</div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Full Details</div>
                                <pre style={{
                                    background: 'var(--bg-secondary)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    overflowX: 'auto',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <div>IP: {selectedLog.ipAddress || 'N/A'}</div>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedLog.userAgent}>UA: {selectedLog.userAgent || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
