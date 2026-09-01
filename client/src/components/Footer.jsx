import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, FileText, HelpCircle, Heart, ArrowUpRight, Sparkles } from 'lucide-react';

export default function Footer({ style }) {
    const navigate = useNavigate();

    return (
        <footer style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            padding: '3.5rem 2rem 2rem 2rem',
            width: '100%',
            boxSizing: 'border-box',
            marginTop: 'auto',
            position: 'relative',
            zIndex: 10,
            ...style
        }}>
            <div style={{
                maxWidth: '1300px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '2.5rem',
                marginBottom: '3rem'
            }}>
                {/* Col 1: Brand & Bio */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            navigate('/');
                        }}
                    >
                        <div style={{
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            padding: '0.45rem',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Zap size={20} color="white" fill="white" />
                        </div>
                        <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                            CrowdSpark
                        </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                        The next-generation live interactive quiz and audience engagement platform powered by AI. Designed for educators, trainers, and creators worldwide.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '2rem',
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                            All Systems Operational
                        </span>
                    </div>
                </div>

                {/* Col 2: Services */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                    }}>
                        <HelpCircle size={16} color="#818cf8" />
                        Services
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <li>
                            <span
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    navigate('/how-it-works');
                                }}
                                style={{ cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                How it Works
                            </span>
                        </li>
                        <li>
                            <span
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    navigate('/pricing');
                                }}
                                style={{ cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                Pricing & Plans
                            </span>
                        </li>
                        <li>
                            <span
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    navigate('/about');
                                }}
                                style={{ cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                About Us
                            </span>
                        </li>
                        <li>
                            <span
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    navigate('/join');
                                }}
                                style={{ cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                Join a Live Quiz
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Col 3: Terms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                    }}>
                        <Shield size={16} color="#10b981" />
                        Terms
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <li>
                            <span
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    navigate('/terms');
                                }}
                                style={{ cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                Terms of Service
                            </span>
                        </li>
                        <li>
                            <span
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    navigate('/privacy');
                                }}
                                style={{ cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                Privacy Policy
                            </span>
                        </li>
                        <li>
                            <span
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    navigate('/pricing');
                                }}
                                style={{ cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                AI Token Policy
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Col 4: Creator & Recognition */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                    }}>
                        <Sparkles size={16} color="#fbbf24" />
                        Designed & Built
                    </h4>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                        Crafted with high performance, real-time WebSockets, and modern full-stack web standards.
                    </p>
                    <a
                        href="https://www.nishantmunjal.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            width: 'fit-content'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = '#818cf8';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <span>Dr. Nishant Kumar</span>
                        <ArrowUpRight size={14} color="#818cf8" />
                    </a>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                maxWidth: '1300px',
                margin: '0 auto',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.85rem'
            }}>
                <div>
                    © {new Date().getFullYear()} <strong>CrowdSpark</strong>. All rights reserved.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Designed with <Heart size={14} color="#ef4444" fill="#ef4444" /> by{' '}
                    <a
                        href="https://www.nishantmunjal.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}
                    >
                        Dr. Nishant Kumar
                    </a>
                </div>
            </div>
        </footer>
    );
}
