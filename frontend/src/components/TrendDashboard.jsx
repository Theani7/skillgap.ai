import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, MapPin, Monitor, Zap, BarChart3 } from 'lucide-react';

const ICON_BG = {
  indigo: { bg: 'var(--indigo-50)', fg: 'var(--color-primary)' },
  emerald: { bg: 'var(--emerald-50)', fg: 'var(--color-success)' },
  amber: { bg: '#FEF3C7', fg: '#D97706' },
  rose: { bg: '#FFF1F2', fg: '#E11D48' },
};

const ChartCard = ({ icon, iconColor = 'indigo', title, children, span = 1 }) => {
  const colors = ICON_BG[iconColor] || ICON_BG.indigo;
  return (
    <div style={{
      padding: '20px', borderRadius: 'var(--radius-lg)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      gridColumn: span > 1 ? `span ${span}` : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
          background: colors.bg, color: colors.fg,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const formatted = payload[0].dataKey === 'demand'
    ? `Demand Index: ${value}`
    : `$${Number(value).toLocaleString()}`;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
        {label}
      </p>
      <p style={{ margin: '2px 0 0', fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)' }}>
        {formatted}
      </p>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 16px', borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
      background: color.bg, color: color.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
        {value}
      </p>
      {subtext && (
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)' }}>
          {subtext}
        </p>
      )}
    </div>
  </div>
);

const TrendDashboard = ({ trends }) => {
  if (!trends || (!trends.growth && !trends.top_skills)) return null;

  const COLORS = ['#0a1628', '#ff6b35', '#1a2d4a', '#22c55e'];

  // Calculate summary stats
  const growthData = Array.isArray(trends.growth) ? trends.growth : [];
  const skillsData = Array.isArray(trends.top_skills) ? trends.top_skills : [];
  const remoteData = Array.isArray(trends.remote_vs_onsite) ? trends.remote_vs_onsite : [];
  const regionData = Array.isArray(trends.regional_distribution) ? trends.regional_distribution : [];

  const growthRate = growthData.length >= 2
    ? Math.round(((growthData[growthData.length - 1].demand - growthData[0].demand) / growthData[0].demand) * 100)
    : 0;

  const avgSalary = skillsData.length > 0
    ? Math.round(skillsData.reduce((sum, s) => sum + s.salary, 0) / skillsData.length)
    : 0;

  const topSkill = skillsData.length > 0 ? skillsData.reduce((a, b) => a.salary > b.salary ? a : b) : null;

  const hybridPct = remoteData.find(r => r.name === 'Hybrid')?.value || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Growth Rate"
          value={`+${growthRate}%`}
          subtext="5-year projection"
          color={ICON_BG.emerald}
        />
        <StatCard
          icon={<DollarSign size={18} />}
          label="Avg Salary"
          value={`$${(avgSalary / 1000).toFixed(0)}k`}
          subtext={`Top: ${topSkill?.skill || 'N/A'}`}
          color={ICON_BG.indigo}
        />
        <StatCard
          icon={<BarChart3 size={18} />}
          label="Top Skills"
          value={skillsData.length}
          subtext={`${topSkill?.skill} leads at $${topSkill ? (topSkill.salary / 1000).toFixed(0) : 0}k`}
          color={ICON_BG.amber}
        />
        <StatCard
          icon={<Monitor size={18} />}
          label="Hybrid Work"
          value={`${hybridPct}%`}
          subtext="Most common setup"
          color={ICON_BG.rose}
        />
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
      }}>
        {growthData.length > 0 && (
          <ChartCard
            icon={<TrendingUp size={18} />}
            iconColor="indigo"
            title="Job Demand Projection"
          >
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer>
                <AreaChart data={growthData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                  <defs>
                    <linearGradient id="trendDemandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a1628" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0a1628" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="year"
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--indigo-200)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    stroke="#0a1628"
                    fillOpacity={1}
                    fill="url(#trendDemandGrad)"
                    strokeWidth={2.5}
                    activeDot={{ r: 5, fill: '#ff6b35', stroke: 'white', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '0 4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {growthData[0]?.year}: {growthData[0]?.demand} index
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
                +{growthRate}% projected
              </span>
            </div>
          </ChartCard>
        )}

        {skillsData.length > 0 && (
          <ChartCard
            icon={<DollarSign size={18} />}
            iconColor="emerald"
            title="Highest Paying Skills"
          >
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer>
                <BarChart data={skillsData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="skill"
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'var(--color-bg)' }}
                  />
                  <Bar dataKey="salary" radius={[4, 4, 0, 0]} barSize={28}>
                    {skillsData.map((entry, index) => (
                      <Cell key={index} fill={index === 0 ? '#ff6b35' : '#0a1628'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {topSkill?.skill} commands the highest salary
              </span>
            </div>
          </ChartCard>
        )}

        {remoteData.length > 0 && (
          <ChartCard
            icon={<Monitor size={18} />}
            iconColor="indigo"
            title="Work Environment"
          >
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={remoteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                  >
                    {remoteData.map((_entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
              {remoteData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: COLORS[index % COLORS.length],
                  }} />
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {regionData.length > 0 && (
          <ChartCard
            icon={<MapPin size={18} />}
            iconColor="amber"
            title="Top Market Hubs"
          >
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer>
                <BarChart
                  data={regionData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <YAxis
                    dataKey="region"
                    type="category"
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text)', fontSize: 11, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'var(--color-bg)' }}
                  />
                  <Bar dataKey="salary" radius={[0, 4, 4, 0]} barSize={18}>
                    {regionData.map((entry, index) => (
                      <Cell key={index} fill={index === 0 ? '#ff6b35' : '#0a1628'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Metropolitan areas pay {regionData.length > 1 ? Math.round(((regionData[1]?.salary - regionData[0]?.salary) / regionData[0]?.salary) * 100) : 0}% above average
              </span>
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default TrendDashboard;
