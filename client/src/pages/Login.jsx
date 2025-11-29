import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (isSignup) {
            // Signup logic
            if (!formData.name || !formData.email || !formData.password) {
                setError('All fields are required');
                return;
            }

            // Store user data in localStorage (simple auth for MVP)
            const users = JSON.parse(localStorage.getItem('quiz_users') || '[]');

            // Check if email already exists
            if (users.find(u => u.email === formData.email)) {
                setError('Email already registered');
                return;
            }

            users.push({
                id: Date.now(),
                name: formData.name,
                email: formData.email,
                password: formData.password // In production, this should be hashed!
            });

            localStorage.setItem('quiz_users', JSON.stringify(users));
            localStorage.setItem('current_user', JSON.stringify({
                name: formData.name,
                email: formData.email
            }));

            navigate('/dashboard');
        } else {
            // Login logic
            if (!formData.email || !formData.password) {
                setError('Email and password are required');
                return;
            }

            const users = JSON.parse(localStorage.getItem('quiz_users') || '[]');
            const user = users.find(u => u.email === formData.email && u.password === formData.password);

            if (!user) {
                setError('Invalid email or password');
                return;
            }

            localStorage.setItem('current_user', JSON.stringify({
                name: user.name,
                email: user.email
            }));

            navigate('/dashboard');
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
                        {isSignup ? <UserPlus size={40} /> : <LogIn size={40} />}
                    </div>
                    <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {isSignup ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="subtitle">
                        {isSignup ? 'Sign up to create amazing quizzes' : 'Sign in to continue to your account'}
                    </p>
                </div>

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

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                        {isSignup ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                {/* Toggle */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setError('');
                                setFormData({ name: '', email: '', password: '' });
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
            </div>
        </div>
    );
}
