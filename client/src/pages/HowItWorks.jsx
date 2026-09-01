import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    Sparkles,
    Play,
    QrCode,
    Trophy,
    FileSpreadsheet,
    Users,
    Clock,
    CheckCircle,
    ArrowRight,
    Flame,
    BarChart3,
    Layers,
    Share2,
    Palette
} from 'lucide-react';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';

export default function HowItWorks() {
    const navigate = useNavigate();

    const steps = [
        {
            number: "01",
            title: "Create or AI-Generate Quizzes in Seconds",
            badge: "Creation & AI",
            badgeColor: "#818cf8",
            description: "Build custom interactive quizzes and polls with rich media (images, YouTube videos, background music) or let our AI Question Generator craft a 10-question quiz in under 5 seconds from any topic.",
            bullets: [
                "AI Auto-generation with token credits",
                "Multiple choice, single choice, true/false, and opinion polls",
                "Question timers (10s to 120s) and custom speed-scoring multipliers",
                "Organize quizzes into Folders and Groups"
            ],
            icon: Sparkles,
            gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.05))",
            iconColor: "#818cf8"
        },
        {
            number: "02",
            title: "Launch Live & Share PIN or QR Code",
            badge: "Host & Join",
            badgeColor: "#10b981",
            description: "Hit 'Host' from your dashboard to launch a live room. A 6-character Game PIN and scannable QR Code will instantly appear on your presentation screen or projector.",
            bullets: [
                "Zero App Installation required for participants",
                "Players scan QR or enter PIN at crowdspark.com/join",
                "Real-time interactive waiting room with live avatar lobby",
                "Host starts the game when everyone is ready"
            ],
            icon: QrCode,
            gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))",
            iconColor: "#10b981"
        },
        {
            number: "03",
            title: "Engage Audiences with Real-Time Leaderboards",
            badge: "Live Game Play",
            badgeColor: "#f59e0b",
            description: "Questions appear synchronously across all participant devices with countdown timers, speed scoring points, answer streaks, and instant statistical answer distribution charts.",
            bullets: [
                "Real-time WebSocket synchronization across all devices",
                "Dynamic live top-player leaderboards after every round",
                "Streak bonuses for consecutive correct answers",
                "Final 3D podium reveal for 1st, 2nd, and 3rd place champions"
            ],
            icon: Trophy,
            gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))",
            iconColor: "#f59e0b"
        },
        {
            number: "04",
            title: "Analyze Insights & Download Excel Reports",
            badge: "Analytics & Export",
            badgeColor: "#ec4899",
            description: "After the session ends, access comprehensive player score breakdowns, per-question accuracy statistics, and export one-click Excel (.xlsx) / CSV spreadsheets for grading or auditing.",
            bullets: [
                "Detailed participant performance summary",
                "Toughest question analysis and class averages",
                "One-click Excel/CSV report downloads from dashboard",
                "Permanent session archive in host account"
            ],
            icon: FileSpreadsheet,
            gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.05))",
            iconColor: "#ec4899"
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
                            onClick={() => navigate('/about')}
                            style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            About
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

            {/* Hero Section */}
            <header style={{
                padding: '4.5rem 2rem 3rem 2rem',
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
                    <Layers size={15} />
                    STEP-BY-STEP PLATFORM GUIDE
                </div>
                <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.25rem' }}>
                    How <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CrowdSpark</span> Works
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.6, maxWidth: '750px', margin: '0 auto' }}>
                    From automated AI question generation to real-time synchronized live sessions and detailed analytics — host thrilling quizzes in 4 simple steps.
                </p>
            </header>

            {/* Steps Container */}
            <main style={{ maxWidth: '1100px', margin: '0 auto 5rem auto', padding: '0 2rem', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.number}
                                className="card animate-fade-in"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '1.75rem',
                                    padding: '2.5rem',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '2.5rem',
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <span style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 900,
                                            color: step.badgeColor,
                                            opacity: 0.8
                                        }}>
                                            {step.number}
                                        </span>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            background: `${step.badgeColor}18`,
                                            color: step.badgeColor,
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em'
                                        }}>
                                            {step.badge}
                                        </span>
                                    </div>

                                    <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '1rem' }}>
                                        {step.title}
                                    </h2>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                        {step.description}
                                    </p>

                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                        {step.bullets.map((b, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                <CheckCircle size={16} color={step.badgeColor} />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Visual Graphic Card */}
                                <div style={{
                                    background: step.gradient,
                                    borderRadius: '1.25rem',
                                    border: `1px solid ${step.badgeColor}33`,
                                    padding: '2.5rem 2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    minHeight: '220px'
                                }}>
                                    <div style={{
                                        width: '72px',
                                        height: '72px',
                                        borderRadius: '1.25rem',
                                        background: 'var(--bg-card)',
                                        border: `1px solid ${step.badgeColor}44`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1rem',
                                        boxShadow: `0 8px 20px ${step.badgeColor}22`
                                    }}>
                                        <Icon size={36} color={step.iconColor} />
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                                        Step {step.number}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        {step.badge}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Call to Action Bar */}
                <div style={{
                    marginTop: '4rem',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(236, 72, 153, 0.12))',
                    border: '1.5px solid rgba(129, 140, 248, 0.3)',
                    borderRadius: '2rem',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Ready to Ignite Your Audience?
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: 0, fontSize: '1rem', lineHeight: 1.6 }}>
                        Join thousands of educators and event hosts who use CrowdSpark to make learning and presentations unforgettable.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary"
                            style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', borderRadius: '1rem' }}
                        >
                            Create a Free Quiz Now
                        </button>
                        <button
                            onClick={() => navigate('/join')}
                            className="btn btn-secondary"
                            style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', borderRadius: '1rem' }}
                        >
                            Join a Live Game
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
