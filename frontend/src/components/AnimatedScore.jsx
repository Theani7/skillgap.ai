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
    const strokeWidth = 2;
    const center = size / 2;
    const radius = center - 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (numericScore / 100) * circumference;

    let strokeColor = 'var(--color-primary-500)';
    if (numericScore >= 75) {
        strokeColor = 'var(--color-success-500)';
    } else if (numericScore >= 50) {
        strokeColor = 'var(--color-warning-500)';
    }

    return (
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="var(--color-neutral-100)"
                    strokeWidth={strokeWidth}
                />

                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
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
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    color: 'var(--color-neutral-900)',
                    lineHeight: 1,
                    fontFamily: "'Inter', sans-serif",
                }}>
                    {displayScore}
                </span>
                <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-neutral-500)',
                    marginTop: '4px',
                    fontWeight: 500,
                }}>
                    / 100
                </span>
            </div>
        </div>
    );
};

export default AnimatedScore;
