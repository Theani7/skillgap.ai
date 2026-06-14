import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, MapPin, Monitor } from 'lucide-react';

const ICON_BG = {
  indigo: { bg: 'var(--indigo-50)', fg: 'var(--color-primary)' },
  emerald: { bg: 'var(--emerald-50)', fg: 'var(--color-success)' },
  amber: { bg: '#FEF3C7', fg: '#D97706' },
};

const ChartCard = ({ icon, iconColor = 'indigo', title, children }) => {
  const colors = ICON_BG[iconColor] || ICON_BG.indigo;
  return (
    <div style={{
      padding: '20px', borderRadius: 'var(--radius-lg)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
          background: colors.bg, color: colors.fg,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
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
    ? `Demand: ${value}`
    : `$${Number(value).toLocaleString()}`;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>
        {label}
      </p>
      <p style={{ margin: '2px 0 0', fontSize: '11px', fontWeight: 'var(--font-semibold)', color: 'var(--color-primary)' }}>
        {formatted}
      </p>
    </div>
  );
};

const TrendDashboard = ({ trends }) => {
  if (!trends || (!trends.growth && !trends.top_skills)) return null;

  const COLORS = ['#0a1628', '#ff6b35', '#1a2d4a', '#22c55e'];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '16px',
    }}>
      {Array.isArray(trends.growth) && trends.growth.length > 0 && (
        <ChartCard
          icon={<TrendingUp size={18} />}
          iconColor="indigo"
          title="Job Demand Projection"
        >
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer>
              <AreaChart data={trends.growth} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
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
        </ChartCard>
      )}

      {Array.isArray(trends.top_skills) && trends.top_skills.length > 0 && (
        <ChartCard
          icon={<DollarSign size={18} />}
          iconColor="emerald"
          title="Highest Paying Skills"
        >
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer>
              <BarChart data={trends.top_skills} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
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
                <Bar dataKey="salary" fill="#0a1628" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {Array.isArray(trends.remote_vs_onsite) && trends.remote_vs_onsite.length > 0 && (
        <ChartCard
          icon={<Monitor size={18} />}
          iconColor="indigo"
          title="Work Environment"
        >
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={trends.remote_vs_onsite}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                >
                  {trends.remote_vs_onsite.map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            {trends.remote_vs_onsite.map((entry, index) => (
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

      {Array.isArray(trends.regional_distribution) && trends.regional_distribution.length > 0 && (
        <ChartCard
          icon={<MapPin size={18} />}
          iconColor="amber"
          title="Top Market Hubs"
        >
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer>
              <BarChart
                data={trends.regional_distribution}
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
                <Bar dataKey="salary" fill="#ff6b35" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default TrendDashboard;
