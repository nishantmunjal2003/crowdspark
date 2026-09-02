import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Heart } from 'lucide-react';

export default function Footer({ style }) {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
                .footer-root {
                    background: var(--bg-secondary);
                    border-top: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    padding: 1.2rem 1.25rem;
                    width: 100%;
                    box-sizing: border-box;
                    margin-top: auto;
                    position: relative;
                    z-index: 10;
                    font-size: 0.85rem;
                }
                .footer-inner {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.85rem;
                    text-align: center;
                }
                .footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .footer-brand-logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                .footer-links {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .footer-links-group {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .footer-divider-v {
                    width: 1px;
                    height: 14px;
                    background: var(--border-color);
                    flex-shrink: 0;
                }
                .footer-link {
                    cursor: pointer;
                    transition: color 0.15s ease;
                    white-space: nowrap;
                }
                .footer-link:hover {
                    color: var(--text-primary);
                }
                .footer-author {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .footer-label {
                    font-weight: 700;
                    color: var(--text-primary);
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    white-space: nowrap;
                }
                /* Desktop: single compact row */
                @media (min-width: 768px) {
                    .footer-inner {
                        flex-direction: row;
                        justify-content: space-between;
                        text-align: left;
                    }
                    .footer-brand { justify-content: flex-start; }
                    .footer-links { justify-content: center; gap: 1.1rem; }
                    .footer-links-group { gap: 0.75rem; }
                    .footer-author { justify-content: flex-end; }
                }
            `}</style>
            <footer className="footer-root" style={style}>
                <div className="footer-inner">

                    {/* Brand + Copyright */}
                    <div className="footer-brand">
                        <div
                            className="footer-brand-logo"
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}
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

                    {/* Navigation Links */}
                    <div className="footer-links">
                        {/* Services */}
                        <div className="footer-links-group">
                            <span className="footer-label">Services:</span>
                            <span className="footer-link" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/how-it-works'); }}>How it Works</span>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <span className="footer-link" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/pricing'); }}>Pricing</span>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <span className="footer-link" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/about'); }}>About</span>
                        </div>

                        <div className="footer-divider-v" />

                        {/* Terms */}
                        <div className="footer-links-group">
                            <span className="footer-label">Terms:</span>
                            <span className="footer-link" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); }}>Terms of Service</span>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <span className="footer-link" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/privacy'); }}>Privacy Policy</span>
                        </div>
                    </div>

                    {/* Author */}
                    <div className="footer-author">
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
        </>
    );
}
