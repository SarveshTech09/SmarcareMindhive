import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AgeGroupData {
  ageGroup: string;
  obese: number;
  overweight: number;
  normal: number;
}

interface ObesityByAgeChartProps {
  data: AgeGroupData[];
}

export default function ObesityByAgeChart({ data }: ObesityByAgeChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Obesity by Age Groups</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="ageGroup" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="obese" fill="#ef4444" name="Obese (BMI ≥ 30)" />
          <Bar dataKey="overweight" fill="#f59e0b" name="Overweight (BMI 25-30)" />
          <Bar dataKey="normal" fill="#10b981" name="Normal (BMI < 25)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
