import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedScore = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const numericScore = typeof score === 'number' ? score : parseInt(score, 10) || 0;

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const increment = numericScore / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= numericScore) {
                setDisplayScore(numericScore);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [numericScore]);

    const size = 160;
    const strokeWidth = 10;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (numericScore / 100) * circumference;

    let strokeColor = 'var(--clay-accent)';
    let gradientId = 'scoreGradient';
    if (numericScore >= 75) {
        strokeColor = 'var(--clay-success)';
        gradientId = 'scoreGradientSuccess';
    } else if (numericScore >= 50) {
        strokeColor = 'var(--clay-warning)';
        gradientId = 'scoreGradientWarning';
    }

    return (
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
                <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--clay-accent-light)" />
                        <stop offset="100%" stopColor="var(--clay-accent)" />
                    </linearGradient>
                    <linearGradient id="scoreGradientSuccess" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6EE7B7" />
                        <stop offset="100%" stopColor="var(--clay-success)" />
                    </linearGradient>
                    <linearGradient id="scoreGradientWarning" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FCD34D" />
                        <stop offset="100%" stopColor="var(--clay-warning)" />
                    </linearGradient>
                </defs>

                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="rgba(255,255,255,0.8)"
                    stroke="rgba(124, 58, 237, 0.1)"
                    strokeWidth={strokeWidth}
                />

                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                        filter: `drop-shadow(0 0 8px ${strokeColor})`
                    }}
                />
            </svg>

            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
            }}>
                <span style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: 'var(--clay-foreground)',
                    lineHeight: 1,
                    fontFamily: 'var(--font-display)',
                    textShadow: `0 2px 4px rgba(0,0,0,0.05)`
                }}>
                    {displayScore}
                </span>
                <span style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.12em',
                    color: 'var(--clay-muted)',
                    marginTop: '4px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                }}>
                    Out of 100
                </span>
            </div>

            <div style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${strokeColor}08 0%, transparent 70%)`,
                zIndex: 0,
                animation: 'clay-breathe 3s ease-in-out infinite'
            }} />
        </div>
    );
};

export default AnimatedScore;
