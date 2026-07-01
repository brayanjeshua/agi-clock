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
} from 'recharts';

interface HistoryPoint {
  date: string;
  index: number;
}

interface Props {
  history: HistoryPoint[];
}

// Build chart data: actual + projected (overlap at last actual point)
function buildChartData(history: HistoryPoint[]) {
  if (!history.length) return [];

  const actual = history.map((h) => ({ date: h.date, actual: h.index }));

  // Simple linear extrapolation from last 4 points.
  const recent = history.slice(-4);
  const n = recent.length;
  if (n < 2) return actual;

  const xs = recent.map((_, i) => i);
  const ys = recent.map((h) => h.index);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  const b =
    xs.reduce((acc, x, i) => acc + (x - xMean) * (ys[i] - yMean), 0) /
    xs.reduce((acc, x) => acc + Math.pow(x - xMean, 2), 0);
  const a = yMean - b * xMean;

  // Project only after the v2 formula has enough fresh history.
  const futureLabels = ['Jan 2027', 'Jun 2027', 'Jan 2028', 'Jun 2028', 'Jan 2029'];
  const projected = futureLabels.map((date, i) => ({
    date,
    projected: Math.min(Math.round((a + b * (n - 1 + i + 1)) * 10) / 10, 100),
  }));

  // Overlap point: last actual also gets projected value
  const last = actual[actual.length - 1];
  const overlap = { date: last.date, actual: last.actual, projected: last.actual };

  return [
    ...actual.slice(0, -1),
    overlap,
    ...projected,
  ];
}

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

export default function ProgressChart({ history }: Props) {
  const data = buildChartData(history);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            value: 'READINESS TARGET',
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
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
