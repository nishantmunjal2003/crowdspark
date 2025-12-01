import React from 'react';

export default function Footer({ style }) {
    return (
        <footer style={{
            textAlign: 'center',
            padding: '1rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            width: '100%',
            ...style
        }}>
            <p>
                Designed by <a href="https://www.nishantmunjal.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Nishant Munjal</a>
            </p>
        </footer>
    );
}
