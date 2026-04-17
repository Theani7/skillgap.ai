import React from 'react';
import { AreaChart, Area, ComposedChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, MapPin, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const TrendDashboard = ({ trends, field }) => {
    if (!trends || (!trends.growth && !trends.top_skills)) return null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'var(--clay-cardBgSolid)', border: '1px solid rgba(124, 58, 237, 0.15)', padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--clay-foreground)', fontSize: '0.9rem' }}>{label}</p>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--clay-accent)', fontSize: '0.85rem' }}>
                        {payload[0].dataKey === 'demand' ? `Demand: ${payload[0].value}` : `Salary: $${payload[0].value.toLocaleString()}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    const COLORS = ['var(--clay-accent)', 'var(--clay-accent-alt)', 'var(--clay-accent-tertiary)'];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div style={{ marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-2xl)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}
            >
                <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(124, 58, 237, 0.15)', background: 'rgba(124, 58, 237, 0.05)', marginBottom: 'var(--spacing-md)' }}>
                    <span style={{ color: 'var(--clay-accent)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Industry Analytics</span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
                    <div className="clay-icon clay-icon-blue" style={{ width: '44px', height: '44px' }}>
                        <TrendingUp size={20} />
                    </div>
                    Market Trends
                </h2>
                <p style={{ color: 'var(--clay-muted)' }}>Live data insights for <strong>{field}</strong>.</p>
            </motion.div>

            <motion.div
                style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 'var(--spacing-xl)' }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.div
                    variants={itemVariants}
                    className="clay-card shadow-clay-card"
                    style={{ padding: 'var(--spacing-xl)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                        <div className="clay-icon clay-icon-purple" style={{ width: '44px', height: '44px' }}>
                            <TrendingUp size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Job Demand Projection</h3>
                    </div>

                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <AreaChart data={trends.growth} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                                <defs>
                                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--clay-accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--clay-accent)" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" vertical={false} />
                                <XAxis dataKey="year" stroke="var(--clay-muted)" tick={{ fill: 'var(--clay-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--clay-muted)" tick={{ fill: 'var(--clay-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124, 58, 237, 0.2)' }} />
                                <Area type="monotone" dataKey="demand" stroke="var(--clay-accent)" fillOpacity={1} fill="url(#colorDemand)" strokeWidth={3} activeDot={{ r: 6, fill: 'var(--clay-accent)', stroke: 'white', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="clay-card shadow-clay-card"
                    style={{ padding: 'var(--spacing-xl)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                        <div className="clay-icon clay-icon-green" style={{ width: '44px', height: '44px' }}>
                            <DollarSign size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Highest Paying Skills</h3>
                    </div>

                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <ComposedChart data={trends.top_skills} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" vertical={false} />
                                <XAxis dataKey="skill" stroke="var(--clay-muted)" tick={{ fill: 'var(--clay-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--clay-muted)" tick={{ fill: 'var(--clay-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} />
                                <Bar dataKey="salary" fill="var(--clay-accent)" radius={[6, 6, 0, 0]} barSize={28} />
                                <Line type="monotone" dataKey="salary" stroke="var(--clay-success)" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {trends.remote_vs_onsite && trends.remote_vs_onsite.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="clay-card shadow-clay-card"
                        style={{ padding: 'var(--spacing-xl)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <div className="clay-icon clay-icon-blue" style={{ width: '44px', height: '44px' }}>
                                <Monitor size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Workplace Environment</h3>
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={trends.remote_vs_onsite}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {trends.remote_vs_onsite.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                            {trends.remote_vs_onsite.map((entry, index) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                                    <span style={{ color: 'var(--clay-muted)', fontSize: '0.85rem' }}>{entry.name} ({entry.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {trends.regional_distribution && trends.regional_distribution.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="clay-card shadow-clay-card"
                        style={{ padding: 'var(--spacing-xl)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <div className="clay-icon clay-icon-pink" style={{ width: '44px', height: '44px' }}>
                                <MapPin size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Top Competitive Hubs</h3>
                        </div>

                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer>
                                <BarChart data={trends.regional_distribution} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(124, 58, 237, 0.1)" />
                                    <XAxis type="number" stroke="var(--clay-muted)" tick={{ fill: 'var(--clay-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                    <YAxis dataKey="region" type="category" stroke="var(--clay-muted)" tick={{ fill: 'var(--clay-foreground)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={90} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} />
                                    <Bar dataKey="salary" fill="var(--clay-accent-alt)" radius={[0, 4, 4, 0]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default TrendDashboard;
