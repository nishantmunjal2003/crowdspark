import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Lock, Eye, Database, CheckCircle, ArrowRight, UserCheck, Key } from 'lucide-react';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
            {/* Navigation Bar */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'var(--bg-card)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-color)',
                padding: '1rem 2rem'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        <div style={{
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            padding: '0.5rem',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Zap size={22} color="white" fill="white" />
                        </div>
                        <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                            CrowdSpark
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <span
                            onClick={() => navigate('/')}
                            style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            Home
                        </span>
                        <span
                            onClick={() => navigate('/how-it-works')}
                            style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            How it Works
                        </span>
                        <span
                            onClick={() => navigate('/pricing')}
                            style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            Pricing
                        </span>
                        <ThemeToggle />
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '0.75rem' }}
                        >
                            Host / Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content Header */}
            <header style={{
                padding: '4rem 2rem 2.5rem 2rem',
                textAlign: 'center',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 1rem',
                    borderRadius: '2rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10b981',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '1.25rem'
                }}>
                    <Lock size={15} />
                    DATA PRIVACY & PROTECTION
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1rem' }}>
                    Privacy Policy
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                    Your privacy is our priority. We are committed to transparency in how we collect, handle, and secure your personal and quiz data.
                </p>
            </header>

            {/* Main Privacy Document Body */}
            <main style={{ maxWidth: '900px', margin: '0 auto 4rem auto', padding: '0 2rem', width: '100%', boxSizing: 'border-box' }}>
                <div className="card" style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '1.5rem',
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2.5rem'
                }}>
                    {/* Section 1 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>1</span>
                            Information We Collect
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                            We collect information necessary to operate live interactive games:
                        </p>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong>Account Data (Hosts):</strong> When you log in with Google OAuth or email, we receive your name, email address, profile photo URL, and account identifier.</li>
                            <li><strong>Session & Participant Data:</strong> When participants enter a game, we record their chosen screen name, response selections, timestamps, and score calculations.</li>
                            <li><strong>Quiz Materials:</strong> Questions, answer choices, media attachments, and timer configurations created by the host.</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>2</span>
                            Participant Privacy (Zero Required PII)
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            Participants playing live sessions do NOT need to provide emails, phone numbers, or passwords. We treat live participants with strict privacy and do not sell, track, or commercialize participant session responses.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>3</span>
                            How We Use Information
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            We use collected data solely to:
                        </p>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <li>Authenticate hosts and store quiz libraries.</li>
                            <li>Facilitate low-latency WebSocket live game synchronization and leaderboards.</li>
                            <li>Generate Excel/CSV report exports for educators and event organizers.</li>
                            <li>Calculate AI token balances and monitor system stability.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>4</span>
                            Data Security & Encryption
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            All communication between your browser and CrowdSpark servers is encrypted in transit using industry-standard TLS/HTTPS and secure WebSockets (WSS). Passwords (for local auth) are hashed with strong bcrypt salts, and JWT session tokens are signed with cryptographic secrets.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>5</span>
                            Cookies & Local Storage
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            We use browser LocalStorage and essential session cookies strictly for authentication persistence and theme preferences (Light vs. Dark mode). We do not use third-party tracking or advertising cookies.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>6</span>
                            Contact & Data Requests
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            If you have questions about this Privacy Policy or wish to request data deletion, please contact us at <a href="mailto:support@crowdspark.com" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>support@crowdspark.com</a> or visit <a href="https://www.nishantmunjal.com" target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>nishantmunjal.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
