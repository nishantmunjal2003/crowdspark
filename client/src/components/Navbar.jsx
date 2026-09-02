import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ transparent = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'How it Works', path: '/how-it-works' },
        { name: 'About', path: '/about' },
        { name: 'Pricing', path: '/pricing' }
    ];

    const handleNavigate = (path) => {
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(path);
    };

    return (
        <>
            <style>{`
                .cs-navbar {
                    position: ${transparent ? 'absolute' : 'sticky'};
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: ${transparent ? 'transparent' : 'var(--bg-card)'};
                    backdrop-filter: ${transparent ? 'none' : 'blur(16px)'};
                    -webkit-backdrop-filter: ${transparent ? 'none' : 'blur(16px)'};
                    border-bottom: ${transparent ? 'none' : '1px solid var(--border-color)'};
                    padding: 0.85rem 1.5rem;
                    transition: all 0.3s ease;
                }
                .cs-nav-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .cs-nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    cursor: pointer;
                    user-select: none;
                    transition: transform 0.2s ease;
                }
                .cs-nav-brand:hover {
                    transform: scale(1.02);
                }
                .cs-desktop-links {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                .cs-nav-link {
                    cursor: pointer;
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-size: 0.92rem;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }
                .cs-nav-link:hover {
                    color: var(--text-primary);
                    transform: translateY(-1px);
                }
                .cs-nav-link.active {
                    color: var(--accent-primary);
                    font-weight: 700;
                }
                .cs-mobile-actions {
                    display: none;
                    align-items: center;
                    gap: 0.5rem;
                }
                .cs-mobile-toggle-btn {
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    cursor: pointer;
                    padding: 0.4rem;
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .cs-mobile-drawer {
                    position: fixed;
                    top: 65px;
                    left: 0;
                    right: 0;
                    background: var(--bg-card);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border-bottom: 1px solid var(--border-color);
                    padding: 1.25rem 1.5rem 1.75rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    z-index: 999;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
                    animation: csNavSlideDown 0.25s ease-out;
                }
                @keyframes csNavSlideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .cs-mobile-link {
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    color: var(--text-primary);
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background 0.15s ease;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .cs-mobile-link:hover, .cs-mobile-link.active {
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--accent-primary);
                }
                @media (max-width: 820px) {
                    .cs-navbar {
                        padding: 0.75rem 1rem;
                    }
                    .cs-desktop-links {
                        display: none;
                    }
                    .cs-mobile-actions {
                        display: flex;
                    }
                }
            `}</style>
            <nav className="cs-navbar">
                <div className="cs-nav-container">
                    {/* Brand Logo */}
                    <div className="cs-nav-brand" onClick={() => handleNavigate('/')}>
                        <div style={{
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            padding: '0.4rem',
                            borderRadius: '0.65rem',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Zap size={20} color="white" fill="white" />
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                            CrowdSpark
                        </span>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="cs-desktop-links">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <span
                                    key={link.path}
                                    className={`cs-nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => handleNavigate(link.path)}
                                >
                                    {link.name}
                                </span>
                            );
                        })}
                        <ThemeToggle />
                        <button
                            onClick={() => handleNavigate('/login')}
                            className="btn btn-secondary"
                            style={{ padding: '0.45rem 1rem', fontSize: '0.88rem', borderRadius: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                            <LogIn size={15} /> Host Login
                        </button>
                        <button
                            onClick={() => handleNavigate('/')}
                            className="btn btn-primary"
                            style={{ padding: '0.45rem 1.15rem', fontSize: '0.88rem', borderRadius: '0.65rem' }}
                        >
                            Join Session
                        </button>
                    </div>

                    {/* Mobile Navigation Actions */}
                    <div className="cs-mobile-actions">
                        <ThemeToggle />
                        <button
                            className="cs-mobile-toggle-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer Dropdown */}
            {mobileMenuOpen && (
                <div className="cs-mobile-drawer">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <div
                                key={link.path}
                                className={`cs-mobile-link ${isActive ? 'active' : ''}`}
                                onClick={() => handleNavigate(link.path)}
                            >
                                <span>{link.name}</span>
                                <ArrowRight size={16} opacity={isActive ? 1 : 0.4} />
                            </div>
                        );
                    })}
                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.35rem 0' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <button
                            onClick={() => handleNavigate('/login')}
                            className="btn btn-secondary"
                            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                            <LogIn size={16} /> Host Login
                        </button>
                        <button
                            onClick={() => handleNavigate('/')}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', borderRadius: '0.75rem' }}
                        >
                            Join Session
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
