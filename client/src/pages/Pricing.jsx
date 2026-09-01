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
    MessageCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';

export default function Pricing() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, annual
    const [openFaq, setOpenFaq] = useState(0);

    const faqs = [
        {
            q: "Is CrowdSpark really free to start?",
            a: "Yes! Our Community plan is 100% free with unlimited quiz creation, live sessions, and participant reports. No credit card required."
        },
        {
            q: "How many participants can join a live quiz?",
            a: "The free Community plan supports up to 50 simultaneous participants. If you need more capacity, our Pro and Enterprise plans scale up to thousands of players."
        },
        {
            q: "Can I export player results and reports?",
            a: "Yes! You can download full CSV reports containing player names, timestamps, individual scores, and per-question answer breakdowns directly from your Dashboard."
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
            <main style={{ flex: 1, padding: '3rem 1.5rem 5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
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
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.35rem 0.95rem',
                            borderRadius: '2rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            color: 'var(--accent-primary)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            marginBottom: '1.25rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <Sparkles size={15} /> Simple & Transparent Pricing
                        </div>

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
                            margin: '0 auto 2rem auto',
                            lineHeight: 1.6
                        }}>
                            Host live interactive quizzes, polls, and assessments with real-time participation analytics and instant reporting.
                        </p>

                        {/* Billing Cycle Switch */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: 'var(--bg-secondary)',
                            padding: '0.35rem',
                            borderRadius: '2rem',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '1.5rem',
                                    border: 'none',
                                    background: billingCycle === 'monthly' ? 'var(--bg-card)' : 'transparent',
                                    color: billingCycle === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    fontWeight: billingCycle === 'monthly' ? '700' : '500',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Monthly Billing
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '1.5rem',
                                    border: 'none',
                                    background: billingCycle === 'annual' ? 'var(--bg-card)' : 'transparent',
                                    color: billingCycle === 'annual' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    fontWeight: billingCycle === 'annual' ? '700' : '500',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    boxShadow: billingCycle === 'annual' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                Annual Billing
                                <span style={{
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '1rem',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: 'var(--success)',
                                    fontSize: '0.725rem',
                                    fontWeight: 800
                                }}>
                                    SAVE 20%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Cards Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        alignItems: 'stretch',
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
                                    Everything you need to create, host, and analyze interactive quizzes with your classroom or team.
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

                        {/* 2. Pro Plan (Highlighted) */}
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
                            {/* Featured Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '-14px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                color: 'white',
                                padding: '0.35rem 1rem',
                                borderRadius: '1rem',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                            }}>
                                <Crown size={14} /> MOST POPULAR
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Pro Educator</h3>
                                    <span style={{
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        color: 'var(--accent-primary)'
                                    }}>
                                        POWER USERS
                                    </span>
                                </div>

                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                                    Ideal for schools, instructors, team leads, and live event hosts who need high capacity and deeper analytics.
                                </p>

                                <div style={{ marginBottom: '2rem' }}>
                                    <span style={{ fontSize: '3.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                                        {billingCycle === 'monthly' ? '$12' : '$9'}
                                    </span>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontWeight: 500 }}>
                                        / month {billingCycle === 'annual' ? '(billed yearly)' : ''}
                                    </span>
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
                                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
                                    }}
                                >
                                    Start 14-Day Free Trial
                                </button>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.75rem', display: 'grid', gap: '0.85rem' }}>
                                    <FeatureItem text="Up to 500 Live Players per session" highlighted />
                                    <FeatureItem text="Unlimited AI Quiz Generations" highlighted />
                                    <FeatureItem text="Custom Branding & Themes" highlighted />
                                    <FeatureItem text="Full Per-Question Player Breakdown" highlighted />
                                    <FeatureItem text="Detailed Excel & CSV Export" highlighted />
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
