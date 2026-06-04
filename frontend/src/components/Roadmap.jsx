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
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
                position: 'relative',
                marginBottom: isLast ? 0 : 'var(--space-6)',
                paddingLeft: 'var(--space-8)'
            }}
        >
            <div 
                className="bg-primary"
                style={{
                    position: 'absolute',
                    left: '-5px',
                    top: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    cursor: 'pointer',
                    width: '12px',
                    height: '12px',
                    border: completedTasks.size > 0 && step.action_items && completedTasks.size === step.action_items.length 
                        ? '2px solid var(--color-success-500)' 
                        : '2px solid var(--color-primary-500)'
                }} onClick={() => setIsExpanded(!isExpanded)} />

            <div
                className="bg-primary"
                style={{
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: 'var(--space-4)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600, textTransform: 'uppercase' }}>
                                Phase {step.step}
                            </span>
                            {step.action_items && (
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>
                                    {completedTasks.size} / {step.action_items.length} Tasks
                                </span>
                            )}
                        </div>
                        <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 'var(--space-1) 0 0 0', color: 'var(--color-neutral-900)' }}>
                            {step.title}
                        </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', background: 'var(--color-neutral-50)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--border-radius-md)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {step.duration}
                        </span>
                        {isExpanded ? (
                            <ChevronUp size={18} color="var(--color-neutral-400)" />
                        ) : (
                            <ChevronDown size={18} color="var(--color-neutral-400)" />
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-neutral-100)', paddingTop: 'var(--space-4)' }}>
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <h5 style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', fontWeight: 600 }}>
                                        Target Skills
                                    </h5>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                        {step.skills && step.skills.map((skill, i) => (
                                            <span key={i} style={{ 
                                                fontSize: 'var(--text-xs)', 
                                                background: 'var(--color-neutral-100)', 
                                                color: 'var(--color-neutral-700)', 
                                                padding: 'var(--space-1) var(--space-2)', 
                                                borderRadius: 'var(--border-radius-md)',
                                                fontWeight: 500
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {step.action_items && step.action_items.length > 0 && (
                                    <div>
                                        <h5 style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Action Items
                                        </h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                            {step.action_items.map((action, i) => {
                                                const isDone = completedTasks.has(i);
                                                return (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: 'var(--space-2)',
                                                            background: isDone ? 'var(--color-success-50)' : 'var(--color-neutral-50)',
                                                            padding: 'var(--space-2) var(--space-3)',
                                                            borderRadius: 'var(--border-radius-md)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            border: isDone ? '1px solid var(--color-success-100)' : '1px solid var(--color-neutral-100)'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTask(i);
                                                        }}
                                                    >
                                                        <div style={{ marginTop: '2px' }}>
                                                            {isDone ? (
                                                                <CheckSquare size={16} color="var(--color-success-600)" />
                                                            ) : (
                                                                <Square size={16} color="var(--color-neutral-300)" />
                                                            )}
                                                        </div>
                                                        <span style={{
                                                            fontSize: 'var(--text-sm)',
                                                            color: isDone ? 'var(--color-neutral-400)' : 'var(--color-neutral-700)',
                                                            textDecoration: isDone ? 'line-through' : 'none',
                                                            lineHeight: '1.4'
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
            </div>
        </motion.div>
    );
};

const Roadmap = ({ path }) => {
    if (!path || path.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary"
            style={{ 
                marginTop: 'var(--space-8)', 
                marginBottom: 'var(--space-8)', 
                padding: 'var(--space-6)',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--border-radius-lg)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ color: 'var(--color-primary-500)' }}>
                    <FastForward size={22} />
                </div>
                <div>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-neutral-900)', margin: 0 }}>AI Career Roadmap</h3>
                    <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>Personalized learning path</p>
                </div>
            </div>

            <p style={{ color: 'var(--color-neutral-600)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>
                This is a dynamically generated, personalized learning path created based on your resume and target role. Complete the action items to build missing skills.
            </p>

            <div style={{ position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '12px',
                    bottom: '12px',
                    width: '2px',
                    background: 'var(--color-neutral-100)',
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
