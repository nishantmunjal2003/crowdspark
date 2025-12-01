import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Check, CreditCard, Menu, X } from 'lucide-react';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';

export default function Pricing() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="pricing-page" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Navigation Bar */}
            <nav style={{
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(15, 23, 42, 0.8)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <Zap size={24} color="#fbbf24" fill="#fbbf24" />
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>CrowdSpark</span>
                </div>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <span onClick={() => navigate('/about')} style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '500' }}>About</span>
                    <ThemeToggle />
                    <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Host Login</button>
                    <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Join Session</button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="mobile-menu-dropdown" style={{
                    position: 'fixed',
                    top: '60px',
                    left: 0,
                    right: 0,
                    background: 'rgba(15, 23, 42, 0.98)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '1.5rem',
                    zIndex: 99,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <span onClick={() => { navigate('/about'); setMobileMenuOpen(false); }} style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '500', padding: '0.5rem' }}>About</span>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem' }}>
                        <ThemeToggle />
                    </div>
                    <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', width: '100%' }}>Host Login</button>
                    <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="btn btn-primary" style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', width: '100%' }}>Join Session</button>
                </div>
            )}

            {/* Hero Section */}
            <header className="pricing-hero" style={{ textAlign: 'center', padding: '4rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div className="blob blob-1" style={{ top: '10%', left: '20%', opacity: 0.15 }}></div>
                <div className="blob blob-2" style={{ bottom: '10%', right: '20%', opacity: 0.15 }}></div>

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="title pricing-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
                        Simple, Transparent <br className="hide-mobile" />
                        <span style={{ color: 'var(--accent)' }}>Pricing</span>
                    </h1>
                    <p className="subtitle pricing-subtitle" style={{ fontSize: '1.25rem', lineHeight: '1.8' }}>
                        Start for free, upgrade when you scale.
                    </p>
                </div>
            </header>

            {/* Pricing Cards */}
            <section className="container pricing-cards" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '6rem', padding: '0 1rem' }}>

                {/* Free Tier */}
                <div className="card pricing-card" style={{ padding: '3rem 2rem', width: '100%', maxWidth: '400px', border: '2px solid var(--accent)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', padding: '0.25rem 1rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>
                        MOST POPULAR
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Community</h3>
                    <div className="pricing-amount" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        $0 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '400', marginLeft: '0.5rem' }}>/ forever</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        It is free until it can, we will charge only when we need more processing.
                    </p>

                    <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginBottom: '2rem' }}>
                        Get Started Free
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <FeatureItem text="Unlimited Quizzes" />
                        <FeatureItem text="Up to 50 Participants" />
                        <FeatureItem text="Basic Analytics" />
                        <FeatureItem text="Real-time Leaderboard" />
                    </div>
                </div>

                {/* Pro Tier (Placeholder) */}
                <div className="card pricing-card" style={{ padding: '3rem 2rem', width: '100%', maxWidth: '400px', opacity: 0.7 }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Enterprise</h3>
                    <div className="pricing-amount" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline' }}>
                        Custom
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        For large organizations requiring dedicated processing power and advanced features.
                    </p>

                    <button className="btn btn-secondary" style={{ width: '100%', padding: '1rem', marginBottom: '2rem' }} disabled>
                        Coming Soon
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <FeatureItem text="Unlimited Participants" />
                        <FeatureItem text="Advanced Analytics & Export" />
                        <FeatureItem text="Custom Branding" />
                        <FeatureItem text="Priority Support" />
                    </div>
                </div>

            </section>

            <Footer />

            {/* Mobile Responsive Styles */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                    .pricing-hero {
                        padding: 3rem 1rem !important;
                    }
                    .pricing-title {
                        font-size: 2rem !important;
                    }
                    .pricing-subtitle {
                        font-size: 1rem !important;
                    }
                    .pricing-cards {
                        padding: 0 1rem !important;
                    }
                    .pricing-card {
                        padding: 2rem 1.5rem !important;
                    }
                    .pricing-amount {
                        font-size: 2.5rem !important;
                    }
                }
                @media (max-width: 480px) {
                    .pricing-title {
                        font-size: 1.75rem !important;
                    }
                    .pricing-amount {
                        font-size: 2rem !important;
                    }
                    .hide-mobile {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}

function FeatureItem({ text }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '0.25rem', borderRadius: '50%', display: 'flex' }}>
                <Check size={14} color="var(--success)" />
            </div>
            {text}
        </div>
    );
}
