import { Users, AlertTriangle, Calendar, TrendingDown, Percent, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TodayOverviewProps {
  stats: {
    activePatients: number;
    highRiskAlerts: number;
    followupsToday: number;
    avgBMIReduction: number;
    adherenceRate: number;
  };
  actionRequired: Array<{
    id: string;
    patientName: string;
    issue: string;
    severity: 'severe' | 'warning' | 'info';
    time: string;
  }>;
  bmiTrendData: Array<{ date: string; avgBMI: number }>;
  sideEffectData: Array<{ effect: string; count: number }>;
  onPatientClick: (patientId: string) => void;
}

export default function TodayOverview({
  stats,
  actionRequired,
  bmiTrendData,
  sideEffectData,
  onPatientClick,
}: TodayOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.activePatients}</p>
          <p className="text-sm text-blue-100">Active Patients</p>
          <p className="text-xs text-blue-200 mt-1">Currently under treatment</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.highRiskAlerts}</p>
          <p className="text-sm text-red-100">High Risk Alerts</p>
          <p className="text-xs text-red-200 mt-1">Require immediate attention</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.followupsToday}</p>
          <p className="text-sm text-amber-100">Follow-ups Today</p>
          <p className="text-xs text-amber-200 mt-1">Scheduled consultations</p>
        </div>

        {/* <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.avgBMIReduction.toFixed(1)}%</p>
          <p className="text-sm text-emerald-100">Avg BMI Reduction</p>
          <p className="text-xs text-emerald-200 mt-1">Across all patients</p>
        </div> */}

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Percent className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.adherenceRate.toFixed(0)}%</p>
          <p className="text-sm text-cyan-100">Adherence Rate</p>
          <p className="text-xs text-cyan-200 mt-1">Medication compliance</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Action Required Today</h2>
            <p className="text-sm text-gray-600">Patients requiring immediate clinical attention</p>
          </div>
        </div>

        <div className="space-y-3">
          {actionRequired.map((item) => (
            <div
              key={item.id}
              onClick={() => onPatientClick(item.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition hover:shadow-md ${
                item.severity === 'severe'
                  ? 'bg-red-50 border-red-300 hover:border-red-400'
                  : item.severity === 'warning'
                  ? 'bg-amber-50 border-amber-300 hover:border-amber-400'
                  : 'bg-blue-50 border-blue-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.severity === 'severe'
                          ? 'bg-red-600 text-white'
                          : item.severity === 'warning'
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {item.severity === 'severe' ? 'URGENT' : item.severity === 'warning' ? 'WARNING' : 'INFO'}
                    </span>
                    <span className="font-bold text-gray-900">{item.patientName}</span>
                  </div>
                  <p className="text-gray-700 mb-1">{item.issue}</p>
                  <p className="text-sm text-gray-600">{item.time}</p>
                </div>
                <button className="ml-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium">
                  View Patient
                </button>
              </div>
            </div>
          ))}

          {actionRequired.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No urgent actions required at this time</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-blue-600" />
            BMI Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bmiTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="avgBMI" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Side Effect Frequency
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sideEffectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="effect" stroke="#6b7280" fontSize={11} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
