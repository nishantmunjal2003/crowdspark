import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Lock, Eye, Database, CheckCircle, ArrowRight, UserCheck, Key } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
            <SEO
                title="Privacy Policy - CrowdSpark"
                description="Read CrowdSpark's privacy policy. Learn about our data protection standards, encryption, and zero-selling data commitment."
                canonicalPath="/privacy"
            />
            <style>{`
                .privacy-header {
                    padding: 4rem 1.5rem 2.5rem 1.5rem;
                    text-align: center;
                    max-width: 900px;
                    margin: 0 auto;
                }
                .privacy-main {
                    max-width: 900px;
                    margin: 0 auto 4rem auto;
                    padding: 0 1.5rem;
                    width: 100%;
                    box-sizing: border-box;
                }
                .privacy-card {
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
                    .privacy-header {
                        padding: 2.5rem 1rem 1.75rem 1rem;
                    }
                    .privacy-main {
                        padding: 0 1rem;
                        margin-bottom: 3rem;
                    }
                    .privacy-card {
                        padding: 1.5rem 1.2rem;
                        border-radius: 1.25rem;
                        gap: 1.75rem;
                    }
                }
            `}</style>

            {/* Top Responsive Navigation */}
            <Navbar />

            {/* Content Header */}
            <header className="privacy-header">
                <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1rem' }}>
                    Privacy Policy
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', lineHeight: 1.6 }}>
                    Your privacy is our priority. We are committed to transparency in how we collect, handle, and secure your personal and quiz data.
                </p>
            </header>

            {/* Main Privacy Document Body */}
            <main className="privacy-main">
                <div className="privacy-card animate-fade-in">
                    {/* Section 1 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>1</span>
                            Information We Collect
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                            We collect information necessary to operate live interactive games:
                        </p>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong>Account Data (Hosts):</strong> When you log in with Google OAuth or email, we receive your name, email address, profile photo URL, and account identifier.</li>
                            <li><strong>Session & Participant Data:</strong> When participants enter a game, we record their chosen screen name, response selections, timestamps, and score calculations.</li>
                            <li><strong>Quiz Materials:</strong> Questions, answer choices, media attachments, and timer configurations created by the host.</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>2</span>
                            Participant Privacy (Zero Required PII)
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            Participants playing live sessions do NOT need to provide emails, phone numbers, or passwords. We treat live participants with strict privacy and do not sell, track, or commercialize participant session responses.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>3</span>
                            How We Use Information
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            We use collected data solely to:
                        </p>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <li>Authenticate hosts and store quiz libraries.</li>
                            <li>Facilitate low-latency WebSocket live game synchronization and leaderboards.</li>
                            <li>Generate Excel/CSV report exports for educators and event organizers.</li>
                            <li>Calculate AI token balances and monitor system stability.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>4</span>
                            Data Security & Encryption
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            All communication between your browser and CrowdSpark servers is encrypted in transit using industry-standard TLS/HTTPS and secure WebSockets (WSS). Passwords (for local auth) are hashed with strong bcrypt salts, and JWT session tokens are signed with cryptographic secrets.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>5</span>
                            Cookies & Local Storage
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            We use browser LocalStorage and essential session cookies strictly for authentication persistence and theme preferences (Light vs. Dark mode). We do not use third-party tracking or advertising cookies.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>6</span>
                            Contact & Data Requests
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            If you have questions about this Privacy Policy or wish to request data deletion, please contact us at <a href="mailto:nishant.eth2@gmail.com" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>nishant.eth2@gmail.com</a> or visit <a href="https://www.nishantmunjal.com" target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>nishantmunjal.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
