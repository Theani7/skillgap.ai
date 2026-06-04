import React from 'react';

const Footer = () => {
    return (
        <footer className="footer" style={{ 
            padding: 'var(--space-12) 0',
            borderTop: '1px solid var(--color-neutral-100)',
            textAlign: 'center',
            color: 'var(--color-neutral-400)',
            fontSize: 'var(--font-size-sm)'
        }}>
            <p>&copy; 2026 SkillGap.ai — Focused on your career growth.</p>
        </footer>
    );
};

export default Footer;
