import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    Check,
    ArrowRight,
    Sparkles,
    Shield,
    Users,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    FileSpreadsheet,
    Crown,
    CheckCircle2,
    Menu,
    X,
    MessageCircle,
    Gift
} from 'lucide-react';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';

export default function Pricing() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);

    const faqs = [
        {
            q: "How does the 1 Year Free Pro Educator plan work?",
            a: "During our launch celebration, everyone who signs up gets full access to the Pro Educator plan 100% free for an entire year. No credit card is required to claim this offer."
        },
        {
            q: "Is the Community plan permanently free?",
            a: "Yes! The Community plan is and always will be 100% free with unlimited quiz creation, live sessions, and participant reports."
        },
        {
            q: "How many participants can join a live quiz?",
            a: "With the 1-Year Free Pro Educator plan, you can host up to 500 simultaneous participants with live leaderboards and instant response tracking."
        },
        {
            q: "Can I download and export participant scores?",
            a: "Yes! You can download full Excel/CSV reports containing player names, timestamps, individual scores, and per-question answer breakdowns directly from your Dashboard."
        },
        {
            q: "Do participants need to create an account to play?",
            a: "No. Participants simply enter the 6-character game PIN and their name on their phone or laptop to join immediately without signing up."
        }
    ];

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

                    {/* Desktop Navigation */}
                    <div className="desktop-menu" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                        <span
                            onClick={() => navigate('/')}
                            style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            Home
                        </span>
                        <span
                            onClick={() => navigate('/about')}
                            style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            About
                        </span>
                        <span
                            style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.95rem' }}
                        >
                            Pricing
                        </span>
                        <ThemeToggle />
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1.15rem', fontSize: '0.9rem', borderRadius: '0.75rem' }}
                        >
                            Host Login
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '0.75rem' }}
                        >
                            Join Session
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Dropdown */}
            {mobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: '70px',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '1.5rem',
                    zIndex: 99,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                    <span onClick={() => { navigate('/'); setMobileMenuOpen(false); }} style={{ fontWeight: '600', padding: '0.5rem 0' }}>Home</span>
                    <span onClick={() => { navigate('/about'); setMobileMenuOpen(false); }} style={{ fontWeight: '600', padding: '0.5rem 0' }}>About</span>
                    <span onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent-primary)', fontWeight: '700', padding: '0.5rem 0' }}>Pricing</span>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem' }}>
                        <ThemeToggle />
                    </div>
                    <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>Host Login</button>
                    <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Join Session</button>
                </div>
            )}

            {/* Main Content */}
            <main style={{ flex: 1, padding: '3.5rem 1.5rem 5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                {/* Background Ambient Glows */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(236, 72, 153, 0.05) 50%, transparent 80%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}></div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    {/* Hero Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <h1 style={{
                            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                            fontWeight: 900,
                            lineHeight: 1.15,
                            margin: '0 0 1.25rem 0',
                            letterSpacing: '-0.03em',
                            color: 'var(--text-primary)'
                        }}>
                            Start for free, upgrade when you scale.
                        </h1>

                        <p style={{
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                            color: 'var(--text-secondary)',
                            maxWidth: '650px',
                            margin: '0 auto',
                            lineHeight: 1.6
                        }}>
                            Host live interactive quizzes, polls, and assessments with real-time participation analytics and instant reporting.
                        </p>
                    </div>

                    {/* Pricing Cards Grid with Top Clearance */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2.5rem 2rem',
                        alignItems: 'stretch',
                        paddingTop: '1.5rem',
                        marginBottom: '5rem'
                    }}>
                        {/* 1. Community Plan */}
                        <div
                            className="card animate-fade-in"
                            style={{
                                padding: '2.5rem 2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                background: 'var(--bg-card)',
                                border: '1.5px solid var(--border-color)',
                                borderRadius: '1.5rem',
                                position: 'relative',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Community</h3>
                                    <span style={{
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: 'rgba(16, 185, 129, 0.12)',
                                        color: 'var(--success)'
                                    }}>
                                        FREE FOREVER
                                    </span>
                                </div>

                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                                    Everything you need to create, host, and analyze interactive quizzes with your classroom or small group.
                                </p>

                                <div style={{ marginBottom: '2rem' }}>
                                    <span style={{ fontSize: '3.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>$0</span>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontWeight: 500 }}>/ forever</span>
                                </div>

                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700, borderRadius: '0.85rem', marginBottom: '2rem' }}
                                >
                                    Get Started Free
                                </button>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.75rem', display: 'grid', gap: '0.85rem' }}>
                                    <FeatureItem text="Unlimited Quizzes & Polls" />
                                    <FeatureItem text="Up to 50 Live Players per session" />
                                    <FeatureItem text="AI Quiz Generator included" />
                                    <FeatureItem text="Real-time Live Leaderboards" />
                                    <FeatureItem text="CSV Report & History Downloads" />
                                    <FeatureItem text="No participant login required" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Pro Educator Plan (1 YEAR FREE SPECIAL) */}
                        <div
                            className="card animate-fade-in"
                            style={{
                                padding: '2.75rem 2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                background: 'var(--bg-card)',
                                border: '2px solid var(--accent-primary)',
                                borderRadius: '1.5rem',
                                position: 'relative',
                                boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.25)',
                                transform: 'scale(1.02)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.04) translateY(-6px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1.02) translateY(0)';
                            }}
                        >
                            {/* Featured Badge - Positioned with proper z-index and spacing */}
                            <div style={{
                                position: 'absolute',
                                top: '-15px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                padding: '0.4rem 1.25rem',
                                borderRadius: '2rem',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                                whiteSpace: 'nowrap',
                                zIndex: 10
                            }}>
                                <Crown size={15} /> 1 YEAR 100% FREE
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Pro Educator</h3>
                                    <span style={{
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: 'var(--success)'
                                    }}>
                                        FREE FOR 1 YEAR
                                    </span>
                                </div>

                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                    All premium features unlocked for schools, instructors, team leads, and live hosts during our launch.
                                </p>

                                <div style={{ marginBottom: '1.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '3.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>$0</span>
                                        <span style={{ fontSize: '1.1rem', color: 'var(--success)', fontWeight: 700 }}>
                                            Free for 1 Year
                                        </span>
                                        <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                            $144/yr
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.4rem', fontWeight: '600' }}>
                                        ✨ Special Launch Access • No credit card required
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '0.9rem',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        borderRadius: '0.85rem',
                                        marginBottom: '2rem',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
                                    }}
                                >
                                    Claim 1 Year Free Access
                                </button>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.75rem', display: 'grid', gap: '0.85rem' }}>
                                    <FeatureItem text="Up to 500 Live Players per session" highlighted />
                                    <FeatureItem text="Unlimited AI Quiz Generations" highlighted />
                                    <FeatureItem text="Custom Branding & Background Themes" highlighted />
                                    <FeatureItem text="Full Per-Question Player Breakdown" highlighted />
                                    <FeatureItem text="Detailed Excel & CSV Audit Export" highlighted />
                                    <FeatureItem text="Priority Email & Chat Support" />
                                </div>
                            </div>
                        </div>

                        {/* 3. Enterprise Plan */}
                        <div
                            className="card animate-fade-in"
                            style={{
                                padding: '2.5rem 2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                background: 'var(--bg-card)',
                                border: '1.5px solid var(--border-color)',
                                borderRadius: '1.5rem',
                                position: 'relative',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Enterprise</h3>
                                    <span style={{
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: 'rgba(236, 72, 153, 0.12)',
                                        color: 'var(--accent-tertiary)'
                                    }}>
                                        CUSTOM
                                    </span>
                                </div>

                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                                    For universities, enterprises, and large conferences requiring dedicated capacity and security.
                                </p>

                                <div style={{ marginBottom: '2rem' }}>
                                    <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>Custom</span>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontWeight: 500 }}>pricing</span>
                                </div>

                                <a
                                    href="mailto:nishant@gkv.ac.in?subject=CrowdSpark%20Enterprise%20Inquiry"
                                    className="btn btn-secondary"
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        width: '100%',
                                        padding: '0.85rem',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        borderRadius: '0.85rem',
                                        marginBottom: '2rem',
                                        textDecoration: 'none'
                                    }}
                                >
                                    Contact Sales
                                </a>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.75rem', display: 'grid', gap: '0.85rem' }}>
                                    <FeatureItem text="Unlimited Concurrent Players" />
                                    <FeatureItem text="Dedicated High-Speed Node" />
                                    <FeatureItem text="Single Sign-On (SSO / SAML)" />
                                    <FeatureItem text="Custom Subdomain & White-label" />
                                    <FeatureItem text="99.9% Uptime SLA Guarantee" />
                                    <FeatureItem text="Dedicated Account Representative" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                                Frequently Asked Questions
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
                                Everything you need to know about CrowdSpark plans and limits.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {faqs.map((faq, idx) => {
                                const isOpen = openFaq === idx;
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            border: `1.5px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                            borderRadius: '1rem',
                                            background: 'var(--bg-card)',
                                            overflow: 'hidden',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div
                                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                                            style={{
                                                padding: '1.25rem 1.5rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                fontWeight: 700,
                                                fontSize: '1.05rem',
                                                color: 'var(--text-primary)',
                                                background: isOpen ? 'var(--bg-secondary)' : 'transparent'
                                            }}
                                        >
                                            <span>{faq.q}</span>
                                            {isOpen ? <ChevronUp size={20} color="var(--accent-primary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                                        </div>
                                        {isOpen && (
                                            <div style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', borderTop: '1px solid var(--border-color)' }}>
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Responsive Media Queries */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}

function FeatureItem({ text, highlighted }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            <div style={{
                background: highlighted ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                padding: '0.25rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <Check size={14} color={highlighted ? 'var(--accent-primary)' : 'var(--success)'} strokeWidth={3} />
            </div>
            <span style={{ fontWeight: highlighted ? '600' : '400', color: 'var(--text-primary)' }}>{text}</span>
        </div>
    );
}
