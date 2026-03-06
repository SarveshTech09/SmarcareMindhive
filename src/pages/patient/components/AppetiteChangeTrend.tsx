import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface AppetiteChangeTrendProps {
  data: Array<{
    entry_date: string;
    appetite_change: number;
    cravings_reduced: boolean;
  }>;
}

export default function AppetiteChangeTrend({ data }: AppetiteChangeTrendProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
    .map(entry => ({
      date: new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      appetite: entry.appetite_change,
      hasCravingsReduced: entry.cravings_reduced
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const level = payload[0].value;
      const labels = ['No change', 'Slightly reduced', 'Moderately reduced', 'Significantly reduced', 'Greatly reduced', 'Extremely reduced'];
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{labels[level] || 'Unknown'}</p>
          <p className="text-xs text-gray-600 mt-1">{payload[0].payload.date}</p>
          {payload[0].payload.hasCravingsReduced && (
            <p className="text-xs text-emerald-600 mt-1">Cravings reduced</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={payload.hasCravingsReduced ? 6 : 4}
        fill={payload.hasCravingsReduced ? '#10b981' : '#8b5cf6'}
        stroke={payload.hasCravingsReduced ? '#059669' : '#7c3aed'}
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Appetite Change Trend</h2>
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={3}
                stroke="#d1d5db"
                strokeDasharray="3 3"
                label={{ value: 'Moderate', position: 'right', fill: '#9ca3af', fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="appetite"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span className="text-gray-600">Appetite level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-700"></div>
              <span className="text-gray-600">Cravings reduced</span>
            </div>
          </div>
        </>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-600">
          No appetite data available
        </div>
      )}
    </div>
  );
}
