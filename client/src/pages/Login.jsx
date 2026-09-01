import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, ArrowLeft, Zap, ShieldCheck, RefreshCw, CheckCircle, Edit3 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import ThemeToggle from '../components/ThemeToggle';

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
                    localStorage.setItem('current_user', JSON.stringify(data.user));
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
                localStorage.setItem('current_user', JSON.stringify(data.user));
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

    // Google Sign-In
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('current_user', JSON.stringify(data.user));
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
            {/* Top Navigation Bar */}
            <nav style={{
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
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        <ArrowLeft size={16} /> Home
                    </button>
                    <ThemeToggle />
                </div>
            </nav>

            {/* Main Content Card */}
            <div className="grid-center" style={{ flex: 1, padding: '2rem' }}>
                <div className="card animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem 2rem' }}>
                    
                    {/* VIEW 1: OTP VERIFICATION VIEW */}
                    {isSignup && signupStep === 'otp' ? (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.25rem auto',
                                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                                }}>
                                    <ShieldCheck size={40} color="white" />
                                </div>
                                <h1 className="title" style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>
                                    Verify Email
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5, margin: 0 }}>
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
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem auto',
                                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
                                }}>
                                    {isSignup ? <UserPlus size={40} color="white" /> : <LogIn size={40} color="white" />}
                                </div>
                                <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                    {isSignup ? 'Create Account' : 'Welcome Back'}
                                </h1>
                                <p className="subtitle">
                                    {isSignup ? 'Sign up to create and host interactive quizzes' : 'Sign in to continue to your account'}
                                </p>
                            </div>

                            {/* Google Login Button */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Login Failed')}
                                    theme="filled_black"
                                    shape="pill"
                                    width="300"
                                />
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
        </div>
    );
}
