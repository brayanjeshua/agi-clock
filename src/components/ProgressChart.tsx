'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const historical = [
  { date: 'Jan 2023', actual: 31 },
  { date: 'Jun 2023', actual: 38 },
  { date: 'Jan 2024', actual: 51 },
  { date: 'Jun 2024', actual: 62 },
  { date: 'Jan 2025', actual: 71 },
  { date: 'Jun 2025', actual: 78 },
  { date: 'Jan 2026', actual: 82 },
  { date: 'Jun 2026', actual: 84.2, projected: 84.2 },
  { date: 'Jan 2027', projected: 89 },
  { date: 'Jun 2027', projected: 93 },
  { date: 'Jan 2028', projected: 97 },
  { date: 'Jun 2028', projected: 100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d0d1a] border border-[#1a1a3e] p-3 font-mono text-xs">
        <p className="text-[#4a4a8a] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.dataKey === 'actual' ? 'ACTUAL' : 'PROJECTED'}: {p.value?.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={historical} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#4a4a6a', fontSize: 10, fontFamily: 'Space Mono, monospace' }}
          axisLine={{ stroke: '#1a1a2e' }}
          tickLine={false}
          interval={1}
          angle={-35}
          textAnchor="end"
          height={50}
        />
        <YAxis
          domain={[0, 105]}
          tick={{ fill: '#4a4a6a', fontSize: 10, fontFamily: 'Space Mono, monospace' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={100}
          stroke="#ff4444"
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{
            value: 'AGI THRESHOLD',
            fill: '#ff4444',
            fontSize: 9,
            fontFamily: 'Space Mono, monospace',
            position: 'insideTopRight',
          }}
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#3b82f6' }}
          connectNulls={false}
          name="Actual"
        />
        <Line
          type="monotone"
          dataKey="projected"
          stroke="#ff6b35"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          dot={{ fill: '#ff6b35', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#ff6b35' }}
          connectNulls={false}
          name="Projected"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
