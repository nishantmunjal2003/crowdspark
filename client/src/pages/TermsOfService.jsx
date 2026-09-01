import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, FileText, CheckCircle, ArrowLeft, ArrowRight, Lock, AlertCircle, Scale, Globe } from 'lucide-react';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';

export default function TermsOfService() {
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
                    background: 'rgba(129, 140, 248, 0.1)',
                    border: '1px solid rgba(129, 140, 248, 0.25)',
                    color: '#818cf8',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '1.25rem'
                }}>
                    <Scale size={15} />
                    LEGAL AGREEMENT & TERMS
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1rem' }}>
                    Terms of Service
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                    Last Updated: September 1, 2026. Please read these terms carefully before using the CrowdSpark interactive platform.
                </p>
            </header>

            {/* Main Terms Document Body */}
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
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>1</span>
                            Acceptance of Terms
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            By accessing or using CrowdSpark (the "Service"), whether as a quiz host, educator, student, or live game participant, you agree to be bound by these Terms of Service. If you do not agree to these Terms, you may not access or use the Service.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>2</span>
                            Host Accounts & Security
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            To create, manage, and host quizzes, you must authenticate using a verified Google Account or registered email. You are responsible for maintaining the confidentiality of your credentials and all activities that occur under your account. You agree to notify CrowdSpark immediately of any unauthorized access.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>3</span>
                            Participant Access (No Account Required)
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            Participants may join live quiz and poll sessions without creating an account by submitting a valid 6-character Game PIN and a screen name. Participants must not use offensive, defamatory, or abusive screen names during live sessions. Hosts reserve the right to remove any participant violating community guidelines.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>4</span>
                            AI Generation & Token Usage
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            CrowdSpark provides AI-assisted quiz generation. AI features consume account tokens at a rate of 1 token per generated question. All users receive 50 complimentary tokens upon signup. Additional tokens may be requested through the platform. AI-generated questions are provided for assistance; hosts are responsible for reviewing and verifying accuracy before presenting content to live audiences.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>5</span>
                            Intellectual Property & User Content
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            You retain ownership of the quiz content, media, and question materials you create on CrowdSpark. By uploading content, you grant CrowdSpark a non-exclusive license to transmit, store, and display your quizzes solely for the purpose of operating the interactive live service.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>6</span>
                            Acceptable Use & Fair Play
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            You agree not to: (a) engage in automated scraping, bot attacks, or denial of service against the WebSocket live infrastructure; (b) distribute malware, malicious scripts, or unlawful materials; (c) attempt unauthorized privilege escalation or bypass security protections.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>7</span>
                            Limitation of Liability & Disclaimer
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            CrowdSpark is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 99.9% uptime, we do not warrant that real-time live sessions will be uninterrupted or error-free during local network disconnects or ISP failures.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
