import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DoseEscalationTimelineProps {
  data: Array<{
    injection_date: string;
    dose_mg: number;
    weeks_on_therapy: number;
    medication: string;
  }>;
}

export default function DoseEscalationTimeline({ data }: DoseEscalationTimelineProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.injection_date).getTime() - new Date(b.injection_date).getTime())
    .map(entry => ({
      week: `Wk ${entry.weeks_on_therapy}`,
      dose: entry.dose_mg,
      date: new Date(entry.injection_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  const getBarColor = (value: number, index: number) => {
    const intensity = Math.min(100, (value / Math.max(...chartData.map(d => d.dose))) * 100);
    if (intensity < 33) return '#93c5fd';
    if (intensity < 66) return '#60a5fa';
    return '#3b82f6';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{payload[0].value} mg</p>
          <p className="text-xs text-gray-600">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Dose Escalation</h2>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              label={{ value: 'Dose (mg)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="dose" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.dose, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-600">
          No therapy data available
        </div>
      )}
    </div>
  );
}
