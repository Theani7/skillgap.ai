import React from 'react';
import { AreaChart, Area, ComposedChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, MapPin, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ 
                background: 'var(--color-neutral-50)', 
                border: '1px solid var(--color-neutral-200)', 
                padding: 'var(--space-2) var(--space-3)', 
                borderRadius: 'var(--border-radius-md)', 
                boxShadow: 'var(--shadow-md)' 
            }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-neutral-900)', fontSize: 'var(--font-size-sm)' }}>{label}</p>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-primary-600)', fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>
                    {payload[0].dataKey === 'demand' ? `Demand: ${payload[0].value}` : `Salary: $${payload[0].value.toLocaleString()}`}
                </p>
            </div>
        );
    }
    return null;
};

const TrendDashboard = ({ trends, field }) => {
    if (!trends || (!trends.growth && !trends.top_skills)) return null;

    const COLORS = ['var(--color-primary-500)', 'var(--color-secondary-500)', 'var(--color-primary-300)', 'var(--color-secondary-300)'];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div style={{ marginTop: 'var(--space-12)', marginBottom: 'var(--space-12)', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}
            >
                <div style={{ 
                    display: 'inline-block', 
                    padding: '4px 12px', 
                    borderRadius: 'var(--border-radius-full)', 
                    border: '1px solid var(--color-primary-100)', 
                    background: 'var(--color-primary-50)', 
                    marginBottom: 'var(--space-4)' 
                }}>
                    <span style={{ color: 'var(--color-primary-700)', fontSize: 'var(--font-size-xs)', fontWeight: 600, letterSpacing: 'var(--letter-spacing-wide)', textTransform: 'uppercase' }}>Industry Analytics</span>
                </div>
                <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
                    <TrendingUp size={28} className="text-primary-600" />
                    Market Trends
                </h2>
                <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-base)' }}>Live market insights for <strong style={{ color: 'var(--color-neutral-900)' }}>{field}</strong>.</p>
            </motion.div>

            <motion.div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-6)' }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    variants={itemVariants}
                    style={{ 
                        padding: 'var(--space-6)', 
                        background: 'var(--color-neutral-50)',
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: 'var(--border-radius-lg)',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                            <TrendingUp size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>Job Demand Projection</h3>
                    </div>

                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                            <AreaChart data={trends.growth} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                                <defs>
                                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" vertical={false} />
                                <XAxis dataKey="year" stroke="var(--color-neutral-400)" tick={{ fill: 'var(--color-neutral-500)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--color-neutral-400)" tick={{ fill: 'var(--color-neutral-500)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-primary-200)', strokeWidth: 1 }} />
                                <Area type="monotone" dataKey="demand" stroke="var(--color-primary-500)" fillOpacity={1} fill="url(#colorDemand)" strokeWidth={2.5} activeDot={{ r: 5, fill: 'var(--color-primary-600)', stroke: 'white', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    style={{ 
                        padding: 'var(--space-6)', 
                        background: 'var(--color-neutral-50)',
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: 'var(--border-radius-lg)',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-success-50)', color: 'var(--color-success-600)' }}>
                            <DollarSign size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>Highest Paying Skills</h3>
                    </div>

                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                            <ComposedChart data={trends.top_skills} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" vertical={false} />
                                <XAxis dataKey="skill" stroke="var(--color-neutral-400)" tick={{ fill: 'var(--color-neutral-500)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--color-neutral-400)" tick={{ fill: 'var(--color-neutral-500)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-neutral-100)' }} />
                                <Bar dataKey="salary" fill="var(--color-secondary-500)" radius={[4, 4, 0, 0]} barSize={24} />
                                <Line type="monotone" dataKey="salary" stroke="var(--color-primary-500)" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {trends.remote_vs_onsite && trends.remote_vs_onsite.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        style={{ 
                            padding: 'var(--space-6)', 
                            background: 'var(--color-neutral-50)',
                            border: '1px solid var(--color-neutral-200)',
                            borderRadius: 'var(--border-radius-lg)',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                                <Monitor size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>Work Environment</h3>
                        </div>
                        <div style={{ width: '100%', height: 240 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={trends.remote_vs_onsite}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="var(--color-neutral-50)"
                                        strokeWidth={2}
                                    >
                                        {trends.remote_vs_onsite.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                            {trends.remote_vs_onsite.map((entry, index) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                                    <span style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>{entry.name} ({entry.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {trends.regional_distribution && trends.regional_distribution.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        style={{ 
                            padding: 'var(--space-6)', 
                            background: 'var(--color-neutral-50)',
                            border: '1px solid var(--color-neutral-200)',
                            borderRadius: 'var(--border-radius-lg)',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-warning-50)', color: 'var(--color-warning-600)' }}>
                                <MapPin size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>Top Market Hubs</h3>
                        </div>

                        <div style={{ width: '100%', height: 260 }}>
                            <ResponsiveContainer>
                                <BarChart data={trends.regional_distribution} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-neutral-200)" />
                                    <XAxis type="number" stroke="var(--color-neutral-400)" tick={{ fill: 'var(--color-neutral-500)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                    <YAxis dataKey="region" type="category" stroke="var(--color-neutral-400)" tick={{ fill: 'var(--color-neutral-900)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-neutral-100)' }} />
                                    <Bar dataKey="salary" fill="var(--color-primary-400)" radius={[0, 4, 4, 0]} barSize={20} />
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
