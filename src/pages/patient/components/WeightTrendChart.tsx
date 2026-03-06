import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp, Target } from 'lucide-react';

interface WeightTrendChartProps {
  data: Array<{
    entry_date: string;
    current_weight: number;
  }>;
  goalWeight?: number;
}

export default function WeightTrendChart({ data, goalWeight }: WeightTrendChartProps) {
  const sortedData = [...data].sort((a, b) =>
    new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  const chartData = sortedData.map(entry => ({
    date: new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: new Date(entry.entry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    weight: parseFloat(entry.current_weight.toString())
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {dataPoint.dataKey === 'weight' ? 'Weight' : dataPoint.dataKey === 'firstWeight' ? 'First Weight' : 'Target'}: {dataPoint.value.toFixed(1)} kg
          </p>
          <p className="text-xs text-gray-600">{dataPoint.payload.fullDate}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weight Gain/Loss Trend</h2>
        <div className="h-[300px] flex items-center justify-center text-gray-600">
          No weight data available
        </div>
      </div>
    );
  }

  const firstWeight = chartData[0].weight;
  const currentWeight = chartData[chartData.length - 1].weight;
  const weightChange = currentWeight - firstWeight;
  const weightChangePercent = ((weightChange / firstWeight) * 100).toFixed(1);

  const chartDataWithLines = chartData.map(point => ({
    ...point,
    firstWeight: firstWeight,
    targetWeight: goalWeight || null
  }));

  const allWeights = chartData.map(d => d.weight);
  const minWeight = Math.min(...allWeights, goalWeight || Infinity);
  const maxWeight = Math.max(...allWeights, goalWeight || -Infinity);
  const padding = (maxWeight - minWeight) * 0.15;

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 h-full border border-gray-200">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Weight Gain/Loss Trend</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartDataWithLines} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} horizontal={true} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#d1d5db"
            tickLine={false}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#d1d5db"
            tickLine={false}
            axisLine={{ stroke: '#d1d5db' }}
            domain={[minWeight - padding, maxWeight + padding]}
            label={{
              value: 'Weight (kg)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="firstWeight"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="First Weight"
          />

          {goalWeight && (
            <Line
              type="monotone"
              dataKey="targetWeight"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Target Weight"
            />
          )}

          <Line
            type="monotone"
            dataKey="weight"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7 }}
            name="Current Weight"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">First Weight</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">{firstWeight.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">kg</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Current Weight</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">{currentWeight.toFixed(1)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">kg</span>
            {weightChange !== 0 && (
              <span className={`flex items-center gap-1 text-xs font-medium ${weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {weightChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {Math.abs(weightChange).toFixed(1)} kg ({weightChangePercent}%)
              </span>
            )}
          </div>
        </div>

        {goalWeight ? (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Target Weight</p>
            </div>
            <p className="text-xl font-semibold text-gray-900">{goalWeight.toFixed(1)}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500">kg</span>
              <span className={`text-xs font-medium ${currentWeight <= goalWeight ? 'text-green-600' : 'text-orange-600'}`}>
                {currentWeight <= goalWeight ? '✓ Goal Reached' : `${(currentWeight - goalWeight).toFixed(1)} kg to go`}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3 h-3 text-gray-400" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Target Weight</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">No target set</p>
          </div>
        )}
      </div>
    </div>
  );
}
