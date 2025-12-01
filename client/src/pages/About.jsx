import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Presentation, Zap, BarChart2, Smartphone, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

import ThemeToggle from '../components/ThemeToggle';

export default function About() {
    const navigate = useNavigate();

    return (
        <div className="about-page" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Navigation Bar */}
            <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <Zap size={24} color="#fbbf24" fill="#fbbf24" />
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>CrowdSpark</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <span onClick={() => navigate('/pricing')} style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '500' }}>Pricing</span>
                    <ThemeToggle />
                    <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Host Login</button>
                    <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Join Session</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{ textAlign: 'center', padding: '6rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div className="blob blob-1" style={{ top: '10%', left: '20%', opacity: 0.15 }}></div>
                <div className="blob blob-2" style={{ bottom: '10%', right: '20%', opacity: 0.15 }}></div>

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
                        Spark Engagement in <br />
                        <span style={{ color: 'var(--accent)' }}>Real-Time</span>
                    </h1>
                    <p className="subtitle" style={{ fontSize: '1.25rem', lineHeight: '1.8' }}>
                        CrowdSpark is the ultimate platform for live interactive quizzes and polls.
                        Whether you're in a classroom, a conference, or a team meeting,
                        we make it easy to connect and get instant feedback.
                    </p>
                </div>
            </header>

            {/* Features / How it Works */}
            <section className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                    <FeatureCard
                        icon={<Presentation size={32} />}
                        title="Create & Host"
                        description="Hosts can create custom quizzes with multiple-choice questions. Launch a live session and control the flow from your dashboard."
                        color="var(--accent)"
                    />
                    <FeatureCard
                        icon={<Smartphone size={32} />}
                        title="Join Instantly"
                        description="Participants join via a simple 6-character code. No app download or registration required for participants."
                        color="var(--success)"
                    />
                    <FeatureCard
                        icon={<BarChart2 size={32} />}
                        title="Live Analytics"
                        description="Watch results pour in real-time. Visualize data with dynamic charts and identify knowledge gaps immediately."
                        color="#f472b6"
                    />
                </div>

                {/* Who is it for */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '2rem', padding: '4rem 2rem', border: '1px solid var(--border-color)', marginBottom: '6rem' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', fontWeight: '800' }}>Who is CrowdSpark for?</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        <div style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}><Presentation size={24} color="var(--accent)" /></span>
                                Educators & Speakers
                            </h3>
                            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '1.1rem', space: 'y-4' }}>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowRight size={16} color="var(--accent)" /> Check attendance and understanding</li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowRight size={16} color="var(--accent)" /> Gamify lectures to boost attention</li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowRight size={16} color="var(--accent)" /> Gather opinions instantly</li>
                            </ul>
                        </div>

                        <div style={{ padding: '2rem', borderLeft: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ background: 'rgba(52, 211, 153, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}><Users size={24} color="var(--success)" /></span>
                                Students & Teams
                            </h3>
                            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowRight size={16} color="var(--success)" /> Anonymous participation</li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowRight size={16} color="var(--success)" /> Compete on the leaderboard</li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowRight size={16} color="var(--success)" /> Fun and interactive learning</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Visual Showcase (CSS Mockups) */}
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', fontWeight: '800' }}>See it in Action</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>

                    {/* Mockup 1: Host View */}
                    <div className="mockup-window" style={{ background: '#1e293b', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <div style={{ background: '#0f172a', padding: '0.75rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div style={{ height: '20px', width: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                                <div style={{ height: '20px', width: '40px', background: 'var(--accent)', borderRadius: '4px' }}></div>
                            </div>
                            <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ flex: 1, height: '40%', background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.5 }}></div>
                                <div style={{ flex: 1, height: '80%', background: 'var(--accent)', borderRadius: '4px 4px 0 0' }}></div>
                                <div style={{ flex: 1, height: '30%', background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.3 }}></div>
                                <div style={{ flex: 1, height: '50%', background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.6 }}></div>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Live Results Dashboard</div>
                        </div>
                    </div>

                    {/* Mockup 2: Mobile View */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '280px', height: '500px', background: '#000', borderRadius: '2rem', padding: '0.75rem', border: '4px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                            <div style={{ width: '100%', height: '100%', background: '#0f172a', borderRadius: '1.5rem', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '1.5rem', background: 'var(--accent)', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></div>
                                </div>
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ height: '14px', width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', margin: '0 auto' }}></div>
                                    <div style={{ marginTop: 'auto', display: 'grid', gap: '0.75rem' }}>
                                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}></div>
                                        <div style={{ padding: '1rem', background: 'rgba(52, 211, 153, 0.2)', borderRadius: '0.5rem', border: '1px solid var(--success)' }}></div>
                                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}></div>
                                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA Footer */}
            <footer style={{ textAlign: 'center', marginTop: '4rem', padding: '4rem 1.5rem', background: 'linear-gradient(to top, rgba(99, 102, 241, 0.1), transparent)' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '800' }}>Ready to get started?</h2>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Create a Quiz</button>
                    <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Join a Session</button>
                </div>
            </footer>

            <Footer />
        </div>
    );
}

function FeatureCard({ icon, title, description, color }) {
    return (
        <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ color: color, marginBottom: '1.5rem', padding: '1rem', background: `color-mix(in srgb, ${color} 15%, transparent)`, borderRadius: '1rem' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{description}</p>
        </div>
    );
}
