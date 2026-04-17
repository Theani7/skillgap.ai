import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FastForward, CheckCircle2, CircleDashed, ChevronDown, ChevronUp, CheckSquare, Square, Target, Clock } from 'lucide-react';

const RoadmapStep = ({ step, index, isLast }) => {
    const [isExpanded, setIsExpanded] = useState(index === 0);
    const [completedTasks, setCompletedTasks] = useState(new Set());

    const toggleTask = (taskIndex) => {
        const newCompleted = new Set(completedTasks);
        if (newCompleted.has(taskIndex)) {
            newCompleted.delete(taskIndex);
        } else {
            newCompleted.add(taskIndex);
        }
        setCompletedTasks(newCompleted);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            style={{
                position: 'relative',
                marginBottom: isLast ? 0 : 'var(--spacing-xl)',
                paddingLeft: 'var(--spacing-xl)'
            }}
        >
            <div style={{
                position: 'absolute',
                left: '-12px',
                top: '4px',
                background: 'var(--clay-cardBg)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                cursor: 'pointer',
                width: '32px',
                height: '32px'
            }} onClick={() => setIsExpanded(!isExpanded)}>
                {completedTasks.size > 0 && step.action_items && completedTasks.size === step.action_items.length ? (
                    <CheckCircle2 size={24} color="var(--clay-success)" fill="rgba(16, 185, 129, 0.15)" />
                ) : index === 0 ? (
                    <Target size={22} color="var(--clay-accent)" fill="rgba(124, 58, 237, 0.1)" />
                ) : (
                    <CircleDashed size={22} color="var(--clay-muted)" />
                )}
            </div>

            <motion.div
                style={{
                    background: isExpanded ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(10px)',
                    border: isExpanded ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid rgba(124, 58, 237, 0.08)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--spacing-lg)',
                    transition: 'all 0.3s ease',
                    boxShadow: isExpanded ? '0 8px 24px rgba(124, 58, 237, 0.12)' : '0 4px 12px rgba(160, 150, 180, 0.15)',
                    cursor: 'pointer'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.01 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--clay-accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Phase {step.step}
                            </span>
                            {step.action_items && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--clay-muted)' }}>
                                    {completedTasks.size} / {step.action_items.length} Tasks
                                </span>
                            )}
                        </div>
                        <h4 style={{ fontSize: '1.15rem', margin: 'var(--spacing-xs) 0 0 0', color: 'var(--clay-foreground)' }}>
                            {step.title}
                        </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--clay-muted)', background: 'rgba(124, 58, 237, 0.08)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} />
                            {step.duration}
                        </span>
                        {isExpanded ? (
                            <ChevronUp size={20} color="var(--clay-muted)" />
                        ) : (
                            <ChevronDown size={20} color="var(--clay-muted)" />
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ marginTop: 'var(--spacing-lg)', borderTop: '1px solid rgba(124, 58, 237, 0.1)', paddingTop: 'var(--spacing-lg)' }}>
                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <h5 style={{ fontSize: '0.85rem', color: 'var(--clay-muted)', marginBottom: 'var(--spacing-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                        Target Skills
                                    </h5>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                        {step.skills && step.skills.map((skill, i) => (
                                            <span key={i} className="clay-badge clay-badge-primary" style={{ fontSize: '0.85rem' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {step.action_items && step.action_items.length > 0 && (
                                    <div>
                                        <h5 style={{ fontSize: '0.85rem', color: 'var(--clay-muted)', marginBottom: 'var(--spacing-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                            Action Items
                                        </h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                            {step.action_items.map((action, i) => {
                                                const isDone = completedTasks.has(i);
                                                return (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: 'var(--spacing-sm)',
                                                            background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(124, 58, 237, 0.04)',
                                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                                            borderRadius: 'var(--radius-md)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            border: isDone ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTask(i);
                                                        }}
                                                    >
                                                        <div style={{ marginTop: '2px' }}>
                                                            {isDone ? (
                                                                <CheckSquare size={18} color="var(--clay-success)" />
                                                            ) : (
                                                                <Square size={18} color="var(--clay-muted)" />
                                                            )}
                                                        </div>
                                                        <span style={{
                                                            fontSize: '0.95rem',
                                                            color: isDone ? 'var(--clay-muted)' : 'var(--clay-foreground)',
                                                            textDecoration: isDone ? 'line-through' : 'none',
                                                            lineHeight: '1.5'
                                                        }}>
                                                            {action}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

const Roadmap = ({ path }) => {
    if (!path || path.length === 0) return null;

    return (
        <motion.div
            className="clay-card shadow-clay-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-xl)' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                <div className="clay-icon clay-icon-purple" style={{ width: '48px', height: '48px' }}>
                    <FastForward size={22} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.4rem', margin: 0 }}>AI Career Roadmap</h3>
                    <p style={{ margin: 0, color: 'var(--clay-muted)', fontSize: '0.9rem' }}>Personalized learning path</p>
                </div>
            </div>

            <p style={{ color: 'var(--clay-muted)', marginBottom: 'var(--spacing-xl)', lineHeight: '1.7' }}>
                This is a <strong>dynamically generated, personalized learning path</strong> created by Gemini based on your resume and target role. Complete the action items to build missing skills.
            </p>

            <div style={{ position: 'relative', paddingLeft: 'var(--spacing-lg)' }}>
                <div style={{
                    position: 'absolute',
                    left: '3px',
                    top: '24px',
                    bottom: '24px',
                    width: '3px',
                    background: 'linear-gradient(to bottom, var(--clay-accent), var(--clay-accent-light))',
                    borderRadius: '3px',
                    zIndex: 1
                }} />

                {path.map((step, index) => (
                    <RoadmapStep key={index} step={step} index={index} isLast={index === path.length - 1} />
                ))}
            </div>
        </motion.div>
    );
};

export default Roadmap;
