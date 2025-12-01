import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, KeyRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        otp: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.email) {
            setError('Email is required');
            setLoading(false);
            return;
        }

        if (isSignup && (!formData.name || !formData.password)) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();

            if (res.ok) {
                setStep(2);
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.otp) {
            setError('OTP is required');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    name: formData.name // Send name for new signups
                })
            });
            const data = await res.json();

            if (res.ok) {
                // Success!
                localStorage.setItem('current_user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
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

    return (
        <div className="grid-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="card animate-fade-in" style={{ maxWidth: '450px', width: '100%' }}>
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
                        {step === 2 ? <KeyRound size={40} /> : (isSignup ? <UserPlus size={40} /> : <LogIn size={40} />)}
                    </div>
                    <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {step === 2 ? 'Verify OTP' : (isSignup ? 'Create Account' : 'Welcome Back')}
                    </h1>
                    <p className="subtitle">
                        {step === 2 ? `Enter the code sent to ${formData.email}` : (isSignup ? 'Sign up to create amazing quizzes' : 'Sign in to continue to your account')}
                    </p>
                </div>

                {/* Google Login Button */}
                {step === 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_black"
                            shape="pill"
                            width="300"
                        />
                    </div>
                )}

                {step === 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>OR CONTINUE WITH EMAIL</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {step === 1 && (
                        <>
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
                                    />
                                </div>
                            </div>

                            {isSignup && (
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
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                One-Time Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <KeyRound size={20} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)'
                                }} />
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="123456"
                                    value={formData.otp}
                                    onChange={e => setFormData({ ...formData, otp: e.target.value })}
                                    style={{ paddingLeft: '3rem', letterSpacing: '0.5em', fontSize: '1.2rem', textAlign: 'center' }}
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.5rem',
                            color: '#ef4444',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (step === 1 ? 'Send OTP' : 'Verify & Login')}
                    </button>

                    {step === 2 && (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Back to details
                        </button>
                    )}
                </form>

                {/* Toggle */}
                {step === 1 && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setError('');
                                    setFormData({ name: '', email: '', password: '', otp: '' });
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    textDecoration: 'underline'
                                }}
                            >
                                {isSignup ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
