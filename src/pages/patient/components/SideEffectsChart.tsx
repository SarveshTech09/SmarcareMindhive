import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SideEffectsChartProps {
  data: Array<{
    symptom: string;
    severity: string;
    entry_date: string;
  }>;
}

export default function SideEffectsChart({ data }: SideEffectsChartProps) {
  const severityToNumber = (severity: string): number => {
    switch (severity) {
      case 'mild': return 1;
      case 'moderate': return 2;
      case 'severe': return 3;
      default: return 1;
    }
  };

  const symptomTimeline = data.reduce((acc, entry) => {
    const date = new Date(entry.entry_date);
    const daysFromStart = Math.floor((date.getTime() - new Date(data[0]?.entry_date || date).getTime()) / (1000 * 60 * 60 * 24));

    if (!acc[entry.symptom]) {
      acc[entry.symptom] = {};
    }

    acc[entry.symptom][daysFromStart] = severityToNumber(entry.severity);
    return acc;
  }, {} as Record<string, Record<number, number>>);

  const allDays = new Set<number>();
  Object.values(symptomTimeline).forEach(timeline => {
    Object.keys(timeline).forEach(day => allDays.add(Number(day)));
  });

  const sortedDays = Array.from(allDays).sort((a, b) => a - b);

  const chartData = sortedDays.map(day => {
    const dataPoint: any = { day };
    Object.entries(symptomTimeline).forEach(([symptom, timeline]) => {
      dataPoint[symptom] = timeline[day] || null;
    });
    return dataPoint;
  });

  const symptoms = Object.keys(symptomTimeline);
  const colors = ['#3b82f6', '#f97316', '#22c55e', '#ef4444', '#a855f7'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-2">Day {label}</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry: any, index: number) => {
              if (entry.value !== null) {
                const severityLabel = entry.value === 3 ? 'High' : entry.value === 2 ? 'Moderate' : 'Mild';
                return (
                  <p key={index} style={{ color: entry.color }}>
                    {entry.name}: {severityLabel}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Side Effects Severity (Monthly)</h2>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#e5e7eb"
              label={{ value: 'Days of Month', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#6b7280' } }}
            />
            <YAxis
              domain={[0, 3.5]}
              ticks={[1, 2, 3]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#e5e7eb"
              label={{ value: 'Severity level', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
              tickFormatter={(value) => {
                if (value === 1) return 'Mild';
                if (value === 2) return 'Moderate';
                if (value === 3) return 'High';
                return '';
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            {symptoms.map((symptom, index) => (
              <Line
                key={symptom}
                type="monotone"
                dataKey={symptom}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4, fill: colors[index % colors.length] }}
                connectNulls={false}
                name={symptom.charAt(0).toUpperCase() + symptom.slice(1)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-600">
          No side effects reported
        </div>
      )}
    </div>
  );
}
