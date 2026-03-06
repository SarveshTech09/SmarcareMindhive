import { useState } from 'react';
import {
  ArrowLeft,
  User,
  Activity,
  TrendingDown,
  AlertTriangle,
  Calendar,
  FileText,
  Pill,
  Bell,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ReferenceLine,
} from 'recharts';

interface PatientDetailViewProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    bmiClass: string;
    medicineName: string;
    startDate: string;
    riskScore: number;
  };
  weightBMIData: Array<{
    date: string;
    weight: number;
    bmi: number;
    target: number;
    medicineChange?: string;
  }>;
  adherenceData: Array<{
    date: string;
    taken: boolean;
    missed: boolean;
    engagement: number;
  }>;
  sideEffectsData: Array<{
    effect: string;
    frequency: number;
    severity: 'mild' | 'moderate' | 'severe';
    timeline: string;
  }>;
  comorbidityData: {
    hba1c: Array<{ date: string; value: number }>;
    bp: Array<{ date: string; systolic: number; diastolic: number }>;
    lipids: Array<{ date: string; ldl: number; hdl: number }>;
  };
  aiInsights: {
    plateauRisk: number;
    suggestedDose?: string;
    relapseProb: number;
    cohortOutcome: string;
  };
  onBack: () => void;
  onAdjustDose: () => void;
  onAddNote: () => void;
  onScheduleFollowup: () => void;
  onFlagMonitoring: () => void;
  onSendNotification: () => void;
  onGenerateReport: () => void;
}

export default function PatientDetailView({
  patient,
  weightBMIData,
  adherenceData,
  sideEffectsData,
  comorbidityData,
  aiInsights,
  onBack,
  onAdjustDose,
  onAddNote,
  onScheduleFollowup,
  onFlagMonitoring,
  onSendNotification,
  onGenerateReport,
}: PatientDetailViewProps) {
  const [timelineZoom, setTimelineZoom] = useState('3m');

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const adherenceRate =
    adherenceData.length > 0
      ? (adherenceData.filter((d) => d.taken).length / adherenceData.length) * 100
      : 0;

  const engagementScore =
    adherenceData.length > 0
      ? adherenceData.reduce((sum, d) => sum + d.engagement, 0) / adherenceData.length
      : 0;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Patient List
      </button>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-4 rounded-lg">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{patient.name}</h1>
              <div className="flex items-center gap-4 text-blue-100">
                <span>{patient.age} years</span>
                <span>•</span>
                <span className="capitalize">{patient.gender}</span>
                <span>•</span>
                <span className="font-semibold">{patient.bmiClass}</span>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                  <Pill className="w-4 h-4 inline mr-1" />
                  {patient.medicineName}
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Started: {patient.startDate}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-block px-4 py-2 rounded-lg font-bold ${getRiskColor(patient.riskScore)}`}>
              {getRiskLabel(patient.riskScore)}
            </div>
            <div className="mt-2 text-4xl font-bold">{patient.riskScore}</div>
            <div className="text-sm text-blue-100">Risk Score</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-blue-600" />
            Weight & BMI Trend
          </h2>
          <div className="flex gap-2">
            {['1m', '3m', '6m', 'All'].map((period) => (
              <button
                key={period}
                onClick={() => setTimelineZoom(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  timelineZoom === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightBMIData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} label={{ value: 'BMI', angle: 90, position: 'insideRight' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Weight" />
            <Line yAxisId="right" type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="BMI" />
            <Line yAxisId="left" type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-3">
          {weightBMIData
            .filter((d) => d.medicineChange)
            .map((d, idx) => (
              <div key={idx} className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg text-sm">
                <span className="font-semibold text-amber-900">{d.date}:</span>
                <span className="text-amber-700 ml-1">{d.medicineChange}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            Adherence & Engagement
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Medication Adherence</span>
                <span className="text-2xl font-bold text-gray-900">{adherenceRate.toFixed(0)}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    adherenceRate >= 80 ? 'bg-emerald-500' : adherenceRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${adherenceRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">App Engagement Score</span>
                <span className="text-2xl font-bold text-gray-900">{engagementScore.toFixed(0)}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${engagementScore}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Medication Timeline (Last 14 Days)</h3>
              <div className="grid grid-cols-7 gap-2">
                {adherenceData.slice(-14).map((day, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        day.taken ? 'bg-emerald-500' : day.missed ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                  <span className="text-gray-600">Taken</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-600">Missed</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700">Lifestyle Compliance</span>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exercise</span>
                  <span className="text-sm font-semibold text-gray-900">72%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Diet Tracking</span>
                  <span className="text-sm font-semibold text-gray-900">85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Water Intake</span>
                  <span className="text-sm font-semibold text-gray-900">68%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            Side Effects
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sideEffectsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="effect" stroke="#6b7280" fontSize={11} angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="frequency" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {sideEffectsData.slice(0, 5).map((effect, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{effect.effect}</p>
                  <p className="text-sm text-gray-600">{effect.timeline}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    effect.severity === 'severe'
                      ? 'bg-red-100 text-red-700'
                      : effect.severity === 'moderate'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {effect.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-red-600" />
          Comorbidity Panel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">HbA1c Trend</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={comorbidityData.hba1c}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} domain={[4, 10]} />
                <Tooltip />
                <ReferenceLine y={7} stroke="#ef4444" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Blood Pressure</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={comorbidityData.bp}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} domain={[60, 160]} />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Lipid Profile</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={comorbidityData.lipids}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="ldl" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                <Line type="monotone" dataKey="hdl" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          AI Insights & Predictions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-violet-100 mb-1">Plateau Risk</p>
            <p className="text-3xl font-bold">{aiInsights.plateauRisk}%</p>
            <p className="text-xs text-violet-200 mt-2">
              {aiInsights.plateauRisk > 60 ? 'High risk detected' : 'Low risk'}
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-violet-100 mb-1">Suggested Dose</p>
            <p className="text-2xl font-bold">{aiInsights.suggestedDose || 'Current OK'}</p>
            <p className="text-xs text-violet-200 mt-2">Based on progress</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-violet-100 mb-1">Relapse Probability</p>
            <p className="text-3xl font-bold">{aiInsights.relapseProb}%</p>
            <p className="text-xs text-violet-200 mt-2">Within 6 months</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-violet-100 mb-1">Cohort Outcome</p>
            <p className="text-lg font-bold">{aiInsights.cohortOutcome}</p>
            <p className="text-xs text-violet-200 mt-2">Similar patients</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={onAdjustDose}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition border-2 border-blue-200"
          >
            <Pill className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Adjust Dose</span>
          </button>
          <button
            onClick={onAddNote}
            className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border-2 border-emerald-200"
          >
            <FileText className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-medium text-gray-900">Add Note</span>
          </button>
          <button
            onClick={onScheduleFollowup}
            className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition border-2 border-amber-200"
          >
            <Calendar className="w-6 h-6 text-amber-600" />
            <span className="text-sm font-medium text-gray-900">Schedule Follow-up</span>
          </button>
          <button
            onClick={onFlagMonitoring}
            className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition border-2 border-red-200"
          >
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <span className="text-sm font-medium text-gray-900">Flag Monitoring</span>
          </button>
          <button
            onClick={onSendNotification}
            className="flex flex-col items-center gap-2 p-4 bg-violet-50 hover:bg-violet-100 rounded-lg transition border-2 border-violet-200"
          >
            <Bell className="w-6 h-6 text-violet-600" />
            <span className="text-sm font-medium text-gray-900">Send Notification</span>
          </button>
          <button
            onClick={onGenerateReport}
            className="flex flex-col items-center gap-2 p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition text-white"
          >
            <Download className="w-6 h-6" />
            <span className="text-sm font-medium">Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
