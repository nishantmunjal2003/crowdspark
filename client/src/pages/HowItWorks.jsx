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
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
                "Scan with phone camera or type PIN on any web browser",
                "Custom nicknames, animated avatar selection & live lobby",
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
                "Real-time websocket synchronization",
                "Live podium and dynamic ranking changes",
                "Sound effects, countdown urgency, and suspenseful reveals",
                "Emoji reactions sent live from participant phones"
            ],
            icon: Flame,
            gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))",
            iconColor: "#f59e0b"
        },
        {
            number: "04",
            title: "Deep Analytics & Excel Export",
            badge: "Reports & Insights",
            badgeColor: "#ec4899",
            description: "After the finale, dive deep into per-question accuracy breakdowns, difficult question insights, participant scorecards, and export everything into formatted Excel sheets.",
            bullets: [
                "Identify knowledge gaps and tough questions",
                "Export complete Excel (.xlsx) reports in one click",
                "Historical session logs saved to your dashboard",
                "Shareable podium highlights for winners"
            ],
            icon: BarChart3,
            gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.05))",
            iconColor: "#ec4899"
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .hiw-header {
                    padding: 4rem 1.5rem 2.5rem 1.5rem;
                    text-align: center;
                    max-width: 900px;
                    margin: 0 auto;
                }
                .hiw-main {
                    max-width: 1100px;
                    margin: 0 auto 5rem auto;
                    padding: 0 1.5rem;
                    width: 100%;
                    box-sizing: border-box;
                }
                .hiw-step-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 1.75rem;
                    padding: 2.5rem;
                    display: grid;
                    grid-template-columns: 1.3fr 1fr;
                    gap: 2.5rem;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    box-sizing: border-box;
                }
                .hiw-step-graphic {
                    border-radius: 1.25rem;
                    padding: 2.5rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    min-height: 220px;
                    box-sizing: border-box;
                }
                .hiw-cta-box {
                    margin-top: 4rem;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(236, 72, 153, 0.12));
                    border: 1.5px solid rgba(129, 140, 248, 0.3);
                    border-radius: 2rem;
                    padding: 3rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }
                @media (max-width: 768px) {
                    .hiw-header {
                        padding: 2.5rem 1rem 1.75rem 1rem;
                    }
                    .hiw-main {
                        padding: 0 1rem;
                        margin-bottom: 3.5rem;
                    }
                    .hiw-step-card {
                        grid-template-columns: 1fr;
                        padding: 1.5rem 1.25rem;
                        gap: 1.5rem;
                        border-radius: 1.25rem;
                    }
                    .hiw-step-graphic {
                        padding: 1.75rem 1rem;
                        min-height: auto;
                    }
                    .hiw-cta-box {
                        padding: 2rem 1.25rem;
                        border-radius: 1.25rem;
                        margin-top: 2.5rem;
                    }
                }
            `}</style>

            {/* Top Responsive Navigation */}
            <Navbar />

            {/* Hero Section */}
            <header className="hiw-header">
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
                <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 3.25rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.25rem' }}>
                    How <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CrowdSpark</span> Works
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', lineHeight: 1.6, maxWidth: '750px', margin: '0 auto' }}>
                    From automated AI question generation to real-time synchronized live sessions and detailed analytics — host thrilling quizzes in 4 simple steps.
                </p>
            </header>

            {/* Steps Container */}
            <main className="hiw-main">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.number}
                                className="hiw-step-card animate-fade-in"
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

                                    <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.65rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '1rem' }}>
                                        {step.title}
                                    </h2>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                        {step.description}
                                    </p>

                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                        {step.bullets.map((b, i) => (
                                             <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                <CheckCircle size={16} color={step.badgeColor} style={{ flexShrink: 0, marginTop: '3px' }} />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Visual Graphic Card */}
                                <div className="hiw-step-graphic" style={{
                                    background: step.gradient,
                                    border: `1px solid ${step.badgeColor}33`,
                                }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '1.15rem',
                                        background: 'var(--bg-card)',
                                        border: `1px solid ${step.badgeColor}44`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '0.85rem',
                                        boxShadow: `0 8px 20px ${step.badgeColor}22`
                                    }}>
                                        <Icon size={32} color={step.iconColor} />
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                        Step {step.number}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                        {step.badge}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Call to Action Bar */}
                <div className="hiw-cta-box">
                    <h3 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.85rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Ready to Ignite Your Audience?
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                        Join thousands of educators and event hosts who use CrowdSpark to make learning and presentations unforgettable.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                        <button
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); }}
                            className="btn btn-primary"
                            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', borderRadius: '0.85rem' }}
                        >
                            Create a Free Quiz Now
                        </button>
                        <button
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}
                            className="btn btn-secondary"
                            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', borderRadius: '0.85rem' }}
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
