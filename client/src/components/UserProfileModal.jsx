import React, { useState } from 'react';
import {
    User,
    Mail,
    Shield,
    Lock,
    Save,
    LogOut,
    X,
    Check,
    Calendar,
    Zap,
    BookOpen,
    Users,
    Edit3
} from 'lucide-react';

export default function UserProfileModal({
    user,
    userTokens,
    totalQuizzes = 0,
    totalParticipants = 0,
    onClose,
    onUpdateUser,
    onLogout
}) {
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMsg('Name cannot be empty');
            return;
        }

        setIsSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const token = localStorage.getItem('auth_token') || user?.token || '';
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const res = await fetch(`/api/users/${user._id}/profile`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ name: name.trim() })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSuccessMsg('Profile name updated successfully!');
                const updated = { ...user, name: data.user.name };
                localStorage.setItem('current_user', JSON.stringify(updated));
                if (onUpdateUser) onUpdateUser(updated);
                setTimeout(() => setSuccessMsg(''), 3500);
            } else {
                setErrorMsg(data.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setErrorMsg('Network error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (fullName) => {
        if (!fullName) return 'U';
        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return fullName.slice(0, 2).toUpperCase();
    };

    const formattedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Member';

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
                zIndex: 1200,
                padding: '1.25rem'
            }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="card animate-fade-in"
                style={{
                    background: 'var(--bg-card)',
                    padding: '2.25rem',
                    borderRadius: '1.5rem',
                    maxWidth: '540px',
                    width: '100%',
                    border: '1.5px solid var(--border-color)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                {/* Modal Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(99, 102, 241, 0.2))',
                            border: '1px solid rgba(129, 140, 248, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#818cf8'
                        }}>
                            <User size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                User Profile
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Account details & credentials
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.65rem' }}
                        title="Close profile"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Profile Avatar Card */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem',
                    borderRadius: '1.25rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '1.5rem'
                }}>
                    {user?.picture ? (
                        <img
                            src={user.picture}
                            alt={user.name}
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #818cf8',
                                boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                            letterSpacing: '0.05em'
                        }}>
                            {getInitials(user?.name)}
                        </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name}
                            </h4>
                            {/* Role Badge */}
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '1rem',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: user?.role === 'admin' ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))' : 'rgba(52, 211, 153, 0.15)',
                                color: user?.role === 'admin' ? '#ec4899' : '#34d399',
                                border: user?.role === 'admin' ? '1px solid rgba(236, 72, 153, 0.35)' : '1px solid rgba(52, 211, 153, 0.3)'
                            }}>
                                <Shield size={11} />
                                {user?.role === 'admin' ? 'Administrator' : 'Host / Member'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={13} />
                            Joined {formattedDate}
                        </p>
                    </div>
                </div>

                {/* Feedback Alerts */}
                {successMsg && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: 'var(--success)',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '1.25rem'
                    }}>
                        <Check size={16} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '1.25rem'
                    }}>
                        <X size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Profile Details Form */}
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Full Name Field (Editable) */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <User size={15} color="#818cf8" />
                                Full Name
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 500 }}>Editable</span>
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSaving || !name.trim() || name.trim() === user?.name}
                                className="btn btn-primary"
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Save size={15} />
                                {isSaving ? 'Saving...' : 'Save Name'}
                            </button>
                        </div>
                    </div>

                    {/* Email Field (Locked / Readonly) */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Mail size={15} color="#818cf8" />
                                Email Address
                            </span>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.725rem',
                                color: 'var(--text-secondary)',
                                background: 'var(--bg-secondary)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-color)'
                            }}>
                                <Lock size={10} /> Locked
                            </span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                className="input"
                                value={user?.email || ''}
                                readOnly
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                    fontSize: '0.95rem',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'not-allowed',
                                    border: '1px dashed var(--border-color)'
                                }}
                            />
                            <Lock
                                size={15}
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)'
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
                            🔒 Email address cannot be changed for account security and verification.
                        </p>
                    </div>

                    {/* Role & Privileges */}
                    <div style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Account Role
                            </span>
                            <span style={{
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                color: user?.role === 'admin' ? '#ec4899' : '#818cf8',
                                textTransform: 'capitalize'
                            }}>
                                {user?.role || 'User'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                            {user?.role === 'admin'
                                ? 'You have full administrator privileges to manage users, approve token requests, view system logs, and inspect platform analytics.'
                                : 'You can create, customize, and host interactive live quizzes and polls with synchronized participant sessions.'}
                        </p>
                    </div>

                    {/* Account Activity Summary */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '0.75rem'
                    }}>
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '0.85rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#818cf8' }}>
                                {userTokens?.aiTokens !== undefined ? userTokens.aiTokens : (user?.aiTokens || 50)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                AI Tokens
                            </div>
                        </div>

                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '0.85rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {totalQuizzes}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                Quizzes
                            </div>
                        </div>

                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '0.85rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--success)' }}>
                                {totalParticipants}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                Players
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-color)'
                    }}>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="btn"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                padding: '0.65rem 1.1rem',
                                borderRadius: '0.75rem',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem'
                            }}
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            style={{ padding: '0.65rem 1.4rem' }}
                        >
                            Done
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
