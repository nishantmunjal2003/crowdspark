import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, ArrowLeft, Zap, ShieldCheck, RefreshCw, CheckCircle, Edit3 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';

export default function Login() {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [signupStep, setSignupStep] = useState('form'); // 'form' | 'otp'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Resend cooldown timer
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Handle initial form submit (Login or Signup Step 1)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');

        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return;
        }

        if (isSignup && !formData.name.trim()) {
            setError('Full name is required');
            return;
        }

        if (isSignup && formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            if (isSignup) {
                // Step 1 of Signup: Send Email OTP
                const res = await fetch('/api/auth/send-signup-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        password: formData.password
                    })
                });
                const data = await res.json();

                if (res.ok) {
                    setSignupStep('otp');
                    setResendCooldown(60);
                    setInfoMessage(`We've sent a 6-digit verification code to ${formData.email.trim()}`);
                } else {
                    setError(data.error || 'Failed to send verification code');
                }
            } else {
                // Normal Login
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email.trim(),
                        password: formData.password
                    })
                });
                const data = await res.json();

                if (res.ok) {
                    if (data.token) {
                        localStorage.setItem('auth_token', data.token);
                    }
                    localStorage.setItem('current_user', JSON.stringify({ ...data.user, token: data.token }));
                    navigate('/dashboard');
                } else {
                    setError(data.error || 'Invalid email or password');
                }
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Signup Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');

        if (!otp.trim() || otp.trim().length !== 6) {
            setError('Please enter the complete 6-digit verification code');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-signup-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    otp: otp.trim()
                })
            });
            const data = await res.json();

            if (res.ok) {
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                localStorage.setItem('current_user', JSON.stringify({ ...data.user, token: data.token }));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Invalid or expired verification code');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0 || loading) return;

        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/send-signup-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password
                })
            });
            const data = await res.json();

            if (res.ok) {
                setResendCooldown(60);
                setInfoMessage('A new verification code has been sent to your email!');
            } else {
                setError(data.error || 'Failed to resend verification code');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Listen for Google OAuth callback from URL hash or popup message
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.replace('#', '?'));
            const accessToken = params.get('access_token');
            const errorParam = params.get('error');

            if (errorParam) {
                setError(`Google Sign-In Error: ${errorParam}`);
                window.history.replaceState(null, '', window.location.pathname);
                return;
            }

            if (accessToken) {
                window.history.replaceState(null, '', window.location.pathname);

                if (window.opener && window.opener !== window) {
                    window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS', accessToken }, window.location.origin);
                    window.close();
                    return;
                }

                authenticateWithAccessToken(accessToken);
            }
        }

        const handleMessage = (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
                authenticateWithAccessToken(event.data.accessToken);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Authenticate with backend using access token
    const authenticateWithAccessToken = async (accessToken) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken })
            });
            const data = await res.json();

            if (res.ok) {
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                localStorage.setItem('current_user', JSON.stringify({ ...data.user, token: data.token }));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Google login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Google Sign-In Click Trigger
    const handleGoogleOAuthClick = () => {
        setError('');
        const clientId = '12595231081-2qo4sal1hs1lbiv0i3mmtg59pun008pj.apps.googleusercontent.com';
        const redirectUri = window.location.origin + '/login';
        const scope = encodeURIComponent('openid profile email');
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}&prompt=select_account`;

        const width = 500;
        const height = 620;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        try {
            const popup = window.open(
                googleAuthUrl,
                'GoogleSignIn',
                `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
            );

            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                window.location.href = googleAuthUrl;
            }
        } catch (e) {
            window.location.href = googleAuthUrl;
        }
    };

    const switchMode = (signupMode) => {
        setIsSignup(signupMode);
        setSignupStep('form');
        setError('');
        setInfoMessage('');
        setOtp('');
        setFormData({ name: '', email: '', password: '' });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .login-nav { flex-wrap: wrap; gap: 0.75rem; }
                .login-card { padding: 2rem 1.75rem; }
                @media (max-width: 480px) {
                    .login-nav { padding: 1rem 1rem !important; }
                    .login-nav-home-btn { display: none !important; }
                    .login-card { padding: 1.5rem 1.1rem !important; }
                }
            `}</style>
            {/* Top Navigation Bar */}
            <nav className="login-nav" style={{
                padding: '1.25rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        padding: '0.4rem',
                        borderRadius: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)'
                    }}>
                        <Zap size={20} color="white" fill="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        CrowdSpark
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-secondary login-nav-home-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        <ArrowLeft size={16} /> Home
                    </button>
                    <ThemeToggle />
                </div>
            </nav>

            {/* Main Content Card */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem 1.5rem',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div className="card animate-fade-in login-card" style={{ maxWidth: '440px', width: '100%', borderRadius: '1.25rem' }}>
                    
                    {/* VIEW 1: OTP VERIFICATION VIEW */}
                    {isSignup && signupStep === 'otp' ? (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 0.75rem auto',
                                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)'
                                }}>
                                    <ShieldCheck size={28} color="white" />
                                </div>
                                <h1 className="title" style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>
                                    Verify Email
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                                    Enter the 6-digit code sent to<br />
                                    <strong style={{ color: 'var(--text-primary)' }}>{formData.email}</strong>
                                </p>
                            </div>

                            {infoMessage && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#10b981',
                                    fontSize: '0.875rem',
                                    marginBottom: '1.25rem',
                                    textAlign: 'center'
                                }}>
                                    {infoMessage}
                                </div>
                            )}

                            {error && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#ef4444',
                                    fontSize: '0.875rem',
                                    marginBottom: '1.25rem',
                                    textAlign: 'center'
                                }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.75rem',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        color: 'var(--text-secondary)',
                                        textAlign: 'center',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-large"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength={6}
                                        autoFocus
                                        style={{
                                            letterSpacing: '0.45em',
                                            fontSize: '1.75rem',
                                            textAlign: 'center',
                                            fontWeight: 800,
                                            padding: '1rem'
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        fontSize: '1.05rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    disabled={loading || otp.length !== 6}
                                >
                                    <CheckCircle size={20} />
                                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                                </button>
                            </form>

                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendCooldown > 0 || loading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-primary, #8b5cf6)',
                                        cursor: resendCooldown > 0 ? 'default' : 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem'
                                    }}
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSignupStep('form');
                                        setError('');
                                        setInfoMessage('');
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.35rem'
                                    }}
                                >
                                    <Edit3 size={14} /> Edit details or change email
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* VIEW 2: LOGIN / SIGNUP FORM */
                        <div>
                            {/* Header */}
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 0.75rem auto',
                                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)'
                                }}>
                                    {isSignup ? <UserPlus size={28} color="white" /> : <LogIn size={28} color="white" />}
                                </div>
                                <h1 className="title" style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>
                                    {isSignup ? 'Create Account' : 'Welcome Back'}
                                </h1>
                                <p className="subtitle" style={{ fontSize: '0.875rem', margin: 0 }}>
                                    {isSignup ? 'Sign up to create and host interactive quizzes' : 'Sign in to continue to your account'}
                                </p>
                            </div>

                            {/* Google Sign-In Button */}
                            <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                                <button
                                    type="button"
                                    onClick={handleGoogleOAuthClick}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1.25rem',
                                        borderRadius: '0.85rem',
                                        border: '1.5px solid var(--border-color)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow-sm)',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <svg width="19" height="19" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>OR CONTINUE WITH EMAIL</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                            </div>

                            {error && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#ef4444',
                                    fontSize: '0.875rem',
                                    marginBottom: '1.25rem',
                                    textAlign: 'center'
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {isSignup && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                            Full Name
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={20} style={{
                                                position: 'absolute',
                                                left: '1rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--text-secondary)'
                                            }} />
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                style={{ paddingLeft: '3rem' }}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={20} style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-secondary)'
                                        }} />
                                        <input
                                            className="input"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            style={{ paddingLeft: '3rem' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                        Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={20} style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-secondary)'
                                        }} />
                                        <input
                                            className="input"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            style={{ paddingLeft: '3rem' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : (isSignup ? 'Send Verification Code' : 'Sign In')}
                                </button>
                            </form>

                            {/* Switch Login / Signup */}
                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                                    <button
                                        type="button"
                                        onClick={() => switchMode(!isSignup)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent-primary, #8b5cf6)',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        {isSignup ? 'Sign In' : 'Sign Up'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
