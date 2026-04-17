import React from 'react';
import { motion } from 'framer-motion';

const shimmer = {
    animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
    },
};

export const SkeletonCard = ({ height = '200px', width = '100%' }) => (
    <div
        style={{
            height,
            width,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 25%, rgba(124, 58, 237, 0.15) 50%, rgba(124, 58, 237, 0.08) 75%)',
            backgroundSize: '200% 100%',
            ...shimmer,
        }}
    />
);

export const SkeletonText = ({ width = '100%', height = '16px', lines = 1 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[...Array(lines)].map((_, i) => (
            <div
                key={i}
                style={{
                    height,
                    width: i === lines - 1 && width !== '100%' ? width : '100%',
                    borderRadius: '4px',
                    background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 25%, rgba(124, 58, 237, 0.15) 50%, rgba(124, 58, 237, 0.08) 75%)',
                    backgroundSize: '200% 100%',
                    ...shimmer,
                }}
            />
        ))}
    </div>
);

export const SkeletonAvatar = ({ size = '64px' }) => (
    <div
        style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 25%, rgba(124, 58, 237, 0.15) 50%, rgba(124, 58, 237, 0.08) 75%)',
            backgroundSize: '200% 100%',
            ...shimmer,
        }}
    />
);

export const SkeletonButton = ({ width = '120px', height = '48px' }) => (
    <div
        style={{
            width,
            height,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 25%, rgba(124, 58, 237, 0.15) 50%, rgba(124, 58, 237, 0.08) 75%)',
            backgroundSize: '200% 100%',
            ...shimmer,
        }}
    />
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px' }}>
            {[...Array(cols)].map((_, i) => (
                <SkeletonText key={i} width="80%" height="14px" />
            ))}
        </div>
        {[...Array(rows)].map((_, rowIdx) => (
            <div key={rowIdx} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px' }}>
                {[...Array(cols)].map((_, colIdx) => (
                    <SkeletonText key={colIdx} height="20px" />
                ))}
            </div>
        ))}
    </div>
);

export const SkeletonChart = ({ height = '300px' }) => (
    <div
        style={{
            height,
            width: '100%',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 25%, rgba(124, 58, 237, 0.15) 50%, rgba(124, 58, 237, 0.08) 75%)',
            backgroundSize: '200% 100%',
            ...shimmer,
        }}
    />
);

export const PageLoader = () => (
    <div
        className="clay-loader"
        style={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-md)'
        }}
    >
        <div className="clay-spinner" style={{ width: '48px', height: '48px' }} />
        <p style={{
            color: 'var(--clay-accent)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '0.9rem'
        }}>
            Loading...
        </p>
    </div>
);