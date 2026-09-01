import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Heart } from 'lucide-react';

export default function Footer({ style }) {
    const navigate = useNavigate();

    return (
        <footer style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            padding: '1.25rem 2rem',
            width: '100%',
            boxSizing: 'border-box',
            marginTop: 'auto',
            position: 'relative',
            zIndex: 10,
            fontSize: '0.85rem',
            ...style
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                {/* Left: Brand + Copyright */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            navigate('/');
                        }}
                    >
                        <div style={{
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            padding: '0.3rem',
                            borderRadius: '0.5rem',
                            boxShadow: '0 2px 8px rgba(251, 191, 36, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Zap size={15} color="white" fill="white" />
                        </div>
                        <span style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                            CrowdSpark
                        </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span>© {new Date().getFullYear()} All rights reserved.</span>
                </div>

                {/* Center: Services & Terms Links */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    flexWrap: 'wrap'
                }}>
                    {/* Services */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Services:</span>
                        <span
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/how-it-works'); }}
                            style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            How it Works
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/pricing'); }}
                            style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            Pricing
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/about'); }}
                            style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            About
                        </span>
                    </div>

                    <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }} />

                    {/* Terms */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Terms:</span>
                        <span
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); }}
                            style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            Terms of Service
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/privacy'); }}
                            style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            Privacy Policy
                        </span>
                    </div>
                </div>

                {/* Right: Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Designed with</span>
                    <Heart size={13} color="#ef4444" fill="#ef4444" />
                    <span>by</span>
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
