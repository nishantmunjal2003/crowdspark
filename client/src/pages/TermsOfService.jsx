import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, FileText, CheckCircle, ArrowLeft, ArrowRight, Lock, AlertCircle, Scale, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
            <SEO
                title="Terms of Service - CrowdSpark"
                description="Review the terms and conditions for using the CrowdSpark interactive live quiz platform."
                canonicalPath="/terms"
            />
            <style>{`
                .terms-header {
                    padding: 4rem 1.5rem 2.5rem 1.5rem;
                    text-align: center;
                    max-width: 900px;
                    margin: 0 auto;
                }
                .terms-main {
                    max-width: 900px;
                    margin: 0 auto 4rem auto;
                    padding: 0 1.5rem;
                    width: 100%;
                    box-sizing: border-box;
                }
                .terms-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 1.5rem;
                    padding: 2.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 2.25rem;
                    box-sizing: border-box;
                }
                @media (max-width: 768px) {
                    .terms-header {
                        padding: 2.5rem 1rem 1.75rem 1rem;
                    }
                    .terms-main {
                        padding: 0 1rem;
                        margin-bottom: 3rem;
                    }
                    .terms-card {
                        padding: 1.5rem 1.2rem;
                        border-radius: 1.25rem;
                        gap: 1.75rem;
                    }
                }
            `}</style>

            {/* Top Responsive Navigation */}
            <Navbar />

            {/* Content Header */}
            <header className="terms-header">
                <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1rem' }}>
                    Terms of Service
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', lineHeight: 1.6 }}>
                    Last Updated: September 1, 2026. Please read these terms carefully before using the CrowdSpark interactive platform.
                </p>
            </header>

            {/* Main Terms Document Body */}
            <main className="terms-main">
                <div className="terms-card animate-fade-in">
                    {/* Section 1 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>1</span>
                            Acceptance of Terms
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            By accessing or using CrowdSpark (the "Service"), whether as a quiz host, educator, student, or live game participant, you agree to be bound by these Terms of Service. If you do not agree to these Terms, you may not access or use the Service.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>2</span>
                            Host Accounts & Security
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            To create, manage, and host quizzes, you must authenticate using a verified Google Account or registered email. You are responsible for maintaining the confidentiality of your credentials and all activities that occur under your account. You agree to notify CrowdSpark immediately of any unauthorized access.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>3</span>
                            Participant Access (No Account Required)
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            Participants may join live quiz and poll sessions without creating an account by submitting a valid 6-character Game PIN and a screen name. Participants must not use offensive, defamatory, or abusive screen names during live sessions. Hosts reserve the right to remove any participant violating community guidelines.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>4</span>
                            AI Generation & Token Usage
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            CrowdSpark provides AI-assisted quiz generation. AI features consume account tokens at a rate of 1 token per generated question. All users receive 50 complimentary tokens upon signup. Additional tokens may be requested through the platform. AI-generated questions are provided for assistance; hosts are responsible for reviewing and verifying accuracy before presenting content to live audiences.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>5</span>
                            Intellectual Property & User Content
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            You retain ownership of the quiz content, media, and question materials you create on CrowdSpark. By uploading content, you grant CrowdSpark a non-exclusive license to transmit, store, and display your quizzes solely for the purpose of operating the interactive live service.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>6</span>
                            Acceptable Use & Fair Play
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            You agree not to: (a) engage in automated scraping, bot attacks, or denial of service against the WebSocket live infrastructure; (b) distribute malware, malicious scripts, or unlawful materials; (c) attempt unauthorized privilege escalation or bypass security protections.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>7</span>
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
