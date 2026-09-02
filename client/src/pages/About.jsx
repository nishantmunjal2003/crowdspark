import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    Users,
    Sparkles,
    BarChart3,
    Smartphone,
    ArrowRight,
    Shield,
    GraduationCap,
    Building2,
    Trophy,
    CheckCircle2,
    FileSpreadsheet,
    Layers,
    Cpu,
    Radio
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
            {/* Top Responsive Navigation */}
            <Navbar />

            {/* Hero Section */}
            <header style={{ textAlign: 'center', padding: '4.5rem 1.5rem 3rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div className="blob blob-1" style={{ top: '5%', left: '15%', opacity: 0.12 }}></div>
                <div className="blob blob-2" style={{ bottom: '10%', right: '15%', opacity: 0.12 }}></div>

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        padding: '0.45rem 1.15rem',
                        borderRadius: '2rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--accent-primary)',
                        marginBottom: '1.75rem'
                    }}>
                        <Sparkles size={16} /> The Next-Gen Interactive Audience Platform
                    </div>

                    <h1 className="title" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.15 }}>
                        Spark Engagement in Real-Time
                    </h1>

                    <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', lineHeight: '1.8', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
                        CrowdSpark empowers educators, presenters, and teams to turn passive listeners into active participants with instant AI quiz generation, live gamified leaderboards, and zero-friction mobile play.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary"
                            style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', fontWeight: 700 }}
                        >
                            Start Hosting for Free &rarr;
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-secondary"
                            style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', fontWeight: 600 }}
                        >
                            Join a Live Session
                        </button>
                    </div>
                </div>
            </header>

            {/* Highlight Metric Pills */}
            <div style={{ maxWidth: '1100px', margin: '0 auto 4.5rem auto', padding: '0 1.5rem', width: '100%' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.25rem',
                    background: 'var(--bg-secondary)',
                    padding: '1.5rem',
                    borderRadius: '1.5rem',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ textAlign: 'center', padding: '0.75rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', lineHeight: 1.1 }}>⚡ &lt; 100ms</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>WebSocket Live Latency</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.75rem', borderLeft: '1px solid var(--border-color)' }} className="metric-divider">
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)', lineHeight: 1.1 }}>500+</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>Simultaneous Players / Room</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.75rem', borderLeft: '1px solid var(--border-color)' }} className="metric-divider">
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ec4899', lineHeight: 1.1 }}>50 Tokens</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>Free AI Questions on Signup</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.75rem', borderLeft: '1px solid var(--border-color)' }} className="metric-divider">
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1.1 }}>1 Year Free</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>Special Launch Pro Access</div>
                    </div>
                </div>
            </div>

            {/* 6 Key Capabilities Section */}
            <section style={{ maxWidth: '1200px', margin: '0 auto 6rem auto', padding: '0 1.5rem', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>
                        Engineered for High-Energy Interaction
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
                        Everything you need to create, deliver, and analyze live audience interactions seamlessly.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {/* Feature 1 */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '1rem',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.25rem'
                        }}>
                            <Cpu size={26} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.6rem 0', color: 'var(--text-primary)' }}>
                            Instant AI Quiz Studio
                        </h3>
                        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Type any subject or topic, choose your question count, and let our AI engine generate well-crafted multiple choice questions complete with accurate answers and distractors in seconds.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '1rem',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.25rem'
                        }}>
                            <Smartphone size={26} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.6rem 0', color: 'var(--text-primary)' }}>
                            Zero Friction Joining
                        </h3>
                        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Participants simply type the 6-character game PIN or scan your live QR code on their phone or laptop. No app downloads, no registrations, and no barrier to entry.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '1rem',
                            background: 'rgba(236, 72, 153, 0.15)',
                            color: '#ec4899',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.25rem'
                        }}>
                            <Radio size={26} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.6rem 0', color: 'var(--text-primary)' }}>
                            Live Synchronized Engine
                        </h3>
                        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Powered by low-latency WebSockets. The host controls question timers, launches questions simultaneously, and watches responses stream into live dynamic bar charts in real time.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '1rem',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.25rem'
                        }}>
                            <Trophy size={26} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.6rem 0', color: 'var(--text-primary)' }}>
                            Competitive Leaderboards
                        </h3>
                        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Boost crowd adrenaline with dynamic scoring based on speed and accuracy. Animate podium finishes with celebration confetti to recognize top performers.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '1rem',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: 'var(--info)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.25rem'
                        }}>
                            <FileSpreadsheet size={26} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.6rem 0', color: 'var(--text-primary)' }}>
                            Detailed CSV Reports
                        </h3>
                        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Export comprehensive post-game score sheets. Inspect individual player answers, completion timestamps, and class-wide accuracy distributions with one click.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '1rem',
                            background: 'rgba(139, 92, 246, 0.15)',
                            color: 'var(--accent-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.25rem'
                        }}>
                            <Shield size={26} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.6rem 0', color: 'var(--text-primary)' }}>
                            Robust Host Security
                        </h3>
                        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Sign in securely via Google Single Sign-On or verified email OTP authentication. Full activity audit logs ensure data integrity and host accountability.
                        </p>
                    </div>
                </div>
            </section>

            {/* Who is CrowdSpark For Section */}
            <section style={{ maxWidth: '1200px', margin: '0 auto 6rem auto', padding: '0 1.5rem', width: '100%' }}>
                <div className="card" style={{ padding: '3.5rem 2.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>
                            Built for Leaders, Educators & Organizers
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                            See how different creators leverage CrowdSpark to elevate their audience experience.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        {/* Column 1 */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ padding: '0.6rem', borderRadius: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                                    <GraduationCap size={22} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Educators & Schools</h3>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.85rem' }}>
                                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <CheckCircle2 size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Formative check-ins to test student understanding</span>
                                </li>
                                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <CheckCircle2 size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Gamify classroom lectures to eliminate screen distractions</span>
                                </li>
                                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <CheckCircle2 size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Download student grades and attendance CSVs</span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ padding: '0.6rem', borderRadius: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                                    <Building2 size={22} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Corporate & HR Teams</h3>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.85rem' }}>
                                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Engaging town hall surveys and instant pulse polls</span>
                                </li>
                                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Interactive employee onboarding & compliance quizzes</span>
                                </li>
                                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Fun team bonding and competitive trivia sessions</span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ padding: '0.6rem', borderRadius: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                    <Layers size={22} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Events & Conferences</h3>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.85rem' }}>
                                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <CheckCircle2 size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Live keynote polls that show crowd opinions on big screens</span>
                                </li>
                                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <CheckCircle2 size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Instant QR code scanning on stage for 500+ participants</span>
                                </li>
                                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <CheckCircle2 size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Sponsor trivia competitions with prizes & awards</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visual Showcase (Live Host & Player UI Preview) */}
            <section style={{ maxWidth: '1200px', margin: '0 auto 6rem auto', padding: '0 1.5rem', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>
                        See the Magic in Action
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        A dual-screen experience built for effortless presenting on desktop and fast intuitive answering on mobile.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                    {/* Mockup 1: Host Command Screen */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}>
                        {/* Window Header */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', gap: '0.45rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                Host Dashboard • PIN: 849-210
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                                👥 48 Players
                            </div>
                        </div>

                        {/* Window Body */}
                        <div style={{ padding: '1.75rem', background: 'var(--bg-card)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Question 3 of 10</span>
                                <span style={{ padding: '0.25rem 0.65rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 800 }}>
                                    ⏱ 12s Remaining
                                </span>
                            </div>

                            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.5rem 0', lineHeight: 1.4 }}>
                                Which planet in our solar system is known as the Red Planet?
                            </h4>

                            {/* Bar Chart Bars */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', height: '120px', alignItems: 'flex-end', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                    <div style={{ height: '30%', background: '#ef4444', borderRadius: '6px 6px 0 0', margin: '0 auto', width: '100%' }} />
                                    <div style={{ fontSize: '0.7rem', marginTop: '4px', color: 'var(--text-muted)' }}>A: Venus (4)</div>
                                </div>
                                <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                    <div style={{ height: '90%', background: '#10b981', borderRadius: '6px 6px 0 0', margin: '0 auto', width: '100%', boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)' }} />
                                    <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 700, color: 'var(--success)' }}>B: Mars (38) ✓</div>
                                </div>
                                <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                    <div style={{ height: '15%', background: '#3b82f6', borderRadius: '6px 6px 0 0', margin: '0 auto', width: '100%' }} />
                                    <div style={{ fontSize: '0.7rem', marginTop: '4px', color: 'var(--text-muted)' }}>C: Jupiter (2)</div>
                                </div>
                                <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                    <div style={{ height: '25%', background: '#f59e0b', borderRadius: '6px 6px 0 0', margin: '0 auto', width: '100%' }} />
                                    <div style={{ fontSize: '0.7rem', marginTop: '4px', color: 'var(--text-muted)' }}>D: Saturn (4)</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
                                Live Bar Chart Visualization updates on every player tap
                            </div>
                        </div>
                    </div>

                    {/* Mockup 2: Mobile Player Screen */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            width: '290px',
                            background: '#0a0e1a',
                            borderRadius: '2.25rem',
                            padding: '0.75rem',
                            border: '4px solid rgba(255, 255, 255, 0.15)',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
                        }}>
                            <div style={{ background: '#151b2e', borderRadius: '1.75rem', overflow: 'hidden', padding: '1.5rem 1.25rem' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Playing as <strong>Alex J.</strong></div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>⚡ 2,450 pts</div>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '0.85rem', padding: '0.85rem', marginBottom: '1.25rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tap your answer fast!</div>
                                </div>

                                {/* 4 Answer Buttons */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                                    <div style={{ background: '#ef4444', color: 'white', fontWeight: 800, padding: '1.25rem 0.5rem', borderRadius: '0.85rem', textAlign: 'center', fontSize: '0.9rem' }}>
                                        ▲ Red
                                    </div>
                                    <div style={{ background: '#10b981', color: 'white', fontWeight: 800, padding: '1.25rem 0.5rem', borderRadius: '0.85rem', textAlign: 'center', fontSize: '0.9rem', boxShadow: '0 0 14px rgba(16, 185, 129, 0.5)' }}>
                                        ◆ Green
                                    </div>
                                    <div style={{ background: '#3b82f6', color: 'white', fontWeight: 800, padding: '1.25rem 0.5rem', borderRadius: '0.85rem', textAlign: 'center', fontSize: '0.9rem' }}>
                                        ● Blue
                                    </div>
                                    <div style={{ background: '#f59e0b', color: 'white', fontWeight: 800, padding: '1.25rem 0.5rem', borderRadius: '0.85rem', textAlign: 'center', fontSize: '0.9rem' }}>
                                        ■ Yellow
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ready to Get Started CTA Banner */}
            <section style={{ maxWidth: '1100px', margin: '0 auto 5rem auto', padding: '0 1.5rem', width: '100%' }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(236, 72, 153, 0.15))',
                    border: '1.5px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: '2rem',
                    padding: '3.5rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 20px 50px rgba(99, 102, 241, 0.2)'
                }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
                        Ready to Spark Your First Session?
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
                        Join thousands of hosts boosting audience attention and engagement with CrowdSpark today. 100% free with no credit card required.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary"
                            style={{ padding: '0.9rem 2.25rem', fontSize: '1.05rem', fontWeight: 800 }}
                        >
                            Create Your Free Account &rarr;
                        </button>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="btn btn-secondary"
                            style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem' }}
                        >
                            View All Features & Pricing
                        </button>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Responsive Media Query Fixes */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                    .metric-divider {
                        border-left: none !important;
                        border-top: 1px solid var(--border-color) !important;
                    }
                }
            `}</style>
        </div>
    );
}
