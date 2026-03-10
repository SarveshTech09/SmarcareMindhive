import { useState, useEffect } from 'react';
import { Users, Activity, AlertCircle, TrendingUp, Award, Percent, MapPin, Calendar, Target, Pill, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import IndiaMap from './components/IndiaMap';
import ObesityByAgeChart from './components/ObesityByAgeChart';
import SideEffectAnalysis from './components/SideEffectAnalysis';
import AdherenceFunnel from './components/AdherenceFunnel';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalEntries: 0,
    activeAlerts: 0,
    activePatients: 0,
    avgBMIReduction: 0,
    avgAdherence: 0,
    severeSideEffects: 0,
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [mapData, setMapData] = useState<any[]>([]);
  const [obesityData, setObesityData] = useState<any[]>([]);
  const [sideEffectData, setSideEffectData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [highRiskStates, setHighRiskStates] = useState<any[]>([]);
  const [medicationDistribution, setMedicationDistribution] = useState<any[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [genderDistribution, setGenderDistribution] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [
        patientsData,
        doctorsData,
        entriesData,
        alertsData,
        weightEntriesData,
        sideEffectsData,
        medicineIntakeData,
      ] = await Promise.all([
        supabase.from('patients').select('*').order('created_at', { ascending: false }),
        supabase.from('doctors').select('*'),
        supabase.from('weekly_entries').select('*'),
        supabase.from('alerts').select('*, patients(name)').eq('resolved', false).order('created_at', { ascending: false }),
        supabase.from('weight_entries').select('*'),
        supabase.from('side_effects_user').select('*'),
        supabase.from('medicine_intake').select('*'),
      ]);

      const patients = patientsData.data || [];
      const entries = entriesData.data || [];
      const weightEntries = weightEntriesData.data || [];
      const sideEffects = sideEffectsData.data || [];
      const medicineIntakes = medicineIntakeData.data || [];

      const activePatients = patients.filter(p => {
        const lastEntry = entries.filter(e => e.patient_id === p.user_id).sort((a, b) =>
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
        )[0];
        if (!lastEntry) return false;
        const daysSinceLastEntry = (Date.now() - new Date(lastEntry.entry_date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastEntry <= 14;
      }).length;

      const bmiReductions = patients.map(p => {
        const patientWeights = weightEntries.filter(w => w.user_id === p.user_id);
        if (patientWeights.length < 2) return 0;
        const sortedWeights = patientWeights.sort((a, b) =>
          new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
        );
        const firstWeight = sortedWeights[0].weight;
        const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
        const height = p.height || 170;
        const firstBMI = firstWeight / ((height / 100) ** 2);
        const lastBMI = lastWeight / ((height / 100) ** 2);
        return ((firstBMI - lastBMI) / firstBMI) * 100;
      }).filter(r => r > 0);

      const avgBMIReduction = bmiReductions.length > 0
        ? bmiReductions.reduce((a, b) => a + b, 0) / bmiReductions.length
        : 0;

      const adherenceRates = patients.map(p => {
        const patientIntakes = medicineIntakes.filter(m => m.user_id === p.user_id);
        if (patientIntakes.length === 0) return 0;
        return (patientIntakes.length / Math.max(1, Math.floor((Date.now() - new Date(p.start_date || p.created_at).getTime()) / (1000 * 60 * 60 * 24)))) * 100;
      }).filter(r => r > 0);

      const avgAdherence = adherenceRates.length > 0
        ? adherenceRates.reduce((a, b) => a + b, 0) / adherenceRates.length
        : 0;

      const severeSideEffectsCount = sideEffects.filter(s => s.severity === 'Severe').length;
      const severeSideEffectsPercent = sideEffects.length > 0
        ? (severeSideEffectsCount / sideEffects.length) * 100
        : 0;

      setStats({
        totalPatients: patients.length,
        totalDoctors: doctorsData.data?.length || 0,
        totalEntries: entries.length,
        activeAlerts: alertsData.data?.length || 0,
        activePatients,
        avgBMIReduction,
        avgAdherence,
        severeSideEffects: severeSideEffectsPercent,
      });

      setPatients(patients);
      setAlerts(alertsData.data || []);

      const statePatientCounts: Record<string, number> = {};
      const stateDoctorCounts: Record<string, number> = {};

      patients.forEach(p => {
        if (p.state) {
          statePatientCounts[p.state] = (statePatientCounts[p.state] || 0) + 1;
        }
      });

      (doctorsData.data || []).forEach((d: any) => {
        const doctorPatients = patients.filter(p => p.doctor_id === d.doctor_id);
        if (doctorPatients.length > 0 && doctorPatients[0].state) {
          const state = doctorPatients[0].state;
          stateDoctorCounts[state] = (stateDoctorCounts[state] || 0) + 1;
        }
      });

      const patientMapData = Object.entries(statePatientCounts).map(([state, count]) => ({
        state,
        count,
        type: 'patient' as const,
      }));

      const doctorMapData = Object.entries(stateDoctorCounts).map(([state, count]) => ({
        state,
        count,
        type: 'doctor' as const,
      }));

      const mapDataArray = [...patientMapData, ...doctorMapData];
      setMapData(mapDataArray);

      const ageGroups = {
        '25-35': { obese: 0, overweight: 0, normal: 0 },
        '36-45': { obese: 0, overweight: 0, normal: 0 },
        '46-55': { obese: 0, overweight: 0, normal: 0 },
        '56+': { obese: 0, overweight: 0, normal: 0 },
      };

      patients.forEach(p => {
        const age = p.age;
        const weight = p.starting_weight;
        const height = p.height || 170;
        const bmi = weight / ((height / 100) ** 2);

        let group: keyof typeof ageGroups;
        if (age <= 35) group = '25-35';
        else if (age <= 45) group = '36-45';
        else if (age <= 55) group = '46-55';
        else group = '56+';

        if (bmi >= 30) ageGroups[group].obese++;
        else if (bmi >= 25) ageGroups[group].overweight++;
        else ageGroups[group].normal++;
      });

      setObesityData(
        Object.entries(ageGroups).map(([ageGroup, counts]) => ({
          ageGroup,
          ...counts,
        }))
      );

      const sideEffectCounts: Record<string, { count: number; severity: string }> = {};
      sideEffects.forEach(s => {
        const effectName = s.side_effect || 'Unknown';
        if (!sideEffectCounts[effectName]) {
          sideEffectCounts[effectName] = { count: 0, severity: s.severity };
        }
        sideEffectCounts[effectName].count++;
      });

      setSideEffectData(
        Object.entries(sideEffectCounts)
          .map(([effect, data]) => ({
            effect,
            count: data.count,
            severity: data.severity as 'mild' | 'moderate' | 'severe',
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      );

      const totalStarted = patients.length;
      const active = activePatients;
      const regularUsers = patients.filter(p => {
        const patientEntries = entries.filter(e => e.patient_id === p.user_id);
        return patientEntries.length >= 4;
      }).length;
      const completing = patients.filter(p => {
        const startDate = new Date(p.start_date);
        const monthsSince = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsSince >= 3;
      }).length;

      setFunnelData([
        { stage: 'Started Treatment', count: totalStarted, percentage: 100 },
        { stage: 'Active (Last 2 Weeks)', count: active, percentage: (active / totalStarted) * 100 },
        { stage: 'Regular Users (4+ Entries)', count: regularUsers, percentage: (regularUsers / totalStarted) * 100 },
        { stage: 'Completing (3+ Months)', count: completing, percentage: (completing / totalStarted) * 100 },
      ]);

      const stateRiskScores: Record<string, { count: number; alerts: number }> = {};
      patients.forEach(p => {
        if (p.state) {
          if (!stateRiskScores[p.state]) {
            stateRiskScores[p.state] = { count: 0, alerts: 0 };
          }
          stateRiskScores[p.state].count++;
        }
      });

      (alertsData.data || []).forEach((alert: any) => {
        const patient = patients.find(p => p.user_id === alert.patient_id);
        if (patient?.state && stateRiskScores[patient.state]) {
          stateRiskScores[patient.state].alerts++;
        }
      });

      setHighRiskStates(
        Object.entries(stateRiskScores)
          .map(([state, data]) => ({
            state,
            riskScore: data.count > 0 ? (data.alerts / data.count) * 100 : 0,
            alerts: data.alerts,
            patients: data.count,
          }))
          .sort((a, b) => b.riskScore - a.riskScore)
          .slice(0, 5)
      );

      const medicationCounts: Record<string, number> = {};
      patients.forEach(p => {
        const med = p.medication || 'Not Set';
        medicationCounts[med] = (medicationCounts[med] || 0) + 1;
      });

      setMedicationDistribution(
        Object.entries(medicationCounts).map(([name, value]) => ({
          name,
          value,
          percentage: ((value / patients.length) * 100).toFixed(1)
        }))
      );

      const weeklyData = [];
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekEntries = weightEntries.filter(w => {
          const entryDate = new Date(w.entry_date);
          return entryDate >= weekStart && entryDate < weekEnd;
        });

        const avgWeightLoss = weekEntries.length > 0
          ? weekEntries.reduce((sum, entry) => sum + (entry.weight || 0), 0) / weekEntries.length
          : 0;

        const weekIntakes = medicineIntakes.filter(m => {
          const intakeDate = new Date(m.taken_at);
          return intakeDate >= weekStart && intakeDate < weekEnd;
        });

        weeklyData.push({
          week: `Week ${12 - i}`,
          patients: weekEntries.length,
          adherence: weekIntakes.length,
          avgWeight: avgWeightLoss.toFixed(1)
        });
      }

      setWeeklyProgress(weeklyData);

      const genderCounts: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
      patients.forEach(p => {
        const gender = p.gender || 'Other';
        if (gender in genderCounts) {
          genderCounts[gender as keyof typeof genderCounts]++;
        }
      });

      setGenderDistribution(
        Object.entries(genderCounts).map(([name, value]) => ({ name, value }))
      );

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await supabase
        .from('alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      setAlerts(alerts.filter(alert => alert.id !== alertId));
      setStats({ ...stats, activeAlerts: stats.activeAlerts - 1 });
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Executive Dashboard</h1>
            <p className="text-slate-600">Comprehensive analytics and real-time monitoring</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter('7')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === '7'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeFilter('30')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === '30'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeFilter('90')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === '90'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.totalPatients}</p>
            <p className="text-sm text-blue-100">Total Patients</p>
            <p className="text-xs text-blue-200 mt-1">All registered patients</p>
          </div>

          {/* <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.avgBMIReduction.toFixed(1)}%</p>
            <p className="text-sm text-emerald-100">Avg BMI Reduction</p>
            <p className="text-xs text-emerald-200 mt-1">Across all patients</p>
          </div> */}

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Percent className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.avgAdherence.toFixed(1)}%</p>
            <p className="text-sm text-amber-100">Avg Adherence Rate</p>
            <p className="text-xs text-amber-200 mt-1">Medication compliance</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.severeSideEffects.toFixed(1)}%</p>
            <p className="text-sm text-red-100">Severe Side Effects</p>
            <p className="text-xs text-red-200 mt-1">Requires attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPatients}</p>
            <p className="text-sm text-gray-600">Total Patients</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDoctors}</p>
            <p className="text-sm text-gray-600">Total Doctors</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalEntries}</p>
            <p className="text-sm text-gray-600">Total Entries</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeAlerts}</p>
            <p className="text-sm text-gray-600">Active Alerts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Geographic Distribution</h3>
            </div>
            <IndiaMap data={mapData} />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 High Risk States</h3>
            <div className="space-y-3">
              {highRiskStates.map((state, index) => (
                <div key={state.state} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{state.state}</span>
                      <span className="text-sm font-semibold text-red-600">
                        {state.riskScore.toFixed(1)}% risk
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {state.alerts} alerts • {state.patients} patients
                    </div>
                    <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500"
                        style={{ width: `${Math.min(state.riskScore, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ObesityByAgeChart data={obesityData} />
          <SideEffectAnalysis data={sideEffectData} />
        </div>

        <div className="mb-8">
          <AdherenceFunnel data={funnelData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Pill className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Medication Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={medicationDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {medicationDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {medicationDistribution.map((med, index) => (
                <div key={med.name} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{med.name}</p>
                    <p className="text-xs text-slate-600">{med.value} patients ({med.percentage}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-6 h-6 text-pink-600" />
              <h3 className="text-xl font-bold text-slate-900">Gender Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {genderDistribution.map((gender, index) => (
                <div key={gender.name} className="text-center p-3 bg-slate-50 rounded-lg">
                  <div
                    className="w-8 h-8 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <p className="text-sm font-bold text-slate-900">{gender.name}</p>
                  <p className="text-lg font-bold text-slate-700">{gender.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-900">12-Week Progress Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" />
              <YAxis yAxisId="left" stroke="#64748b" />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="patients"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Active Patients"
                dot={{ fill: '#3b82f6', r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="adherence"
                stroke="#10b981"
                strokeWidth={3}
                name="Medicine Intake"
                dot={{ fill: '#10b981', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-bold text-slate-900">Performance Metrics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-slate-900">Patient Retention</h4>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {stats.totalPatients > 0 ? ((stats.activePatients / stats.totalPatients) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-slate-600">
                {stats.activePatients} of {stats.totalPatients} patients active
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-5 border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-slate-900">Treatment Success</h4>
              </div>
              <p className="text-3xl font-bold text-emerald-600 mb-1">
                {stats.avgBMIReduction.toFixed(1)}%
              </p>
              <p className="text-sm text-slate-600">Average BMI reduction across cohort</p>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-5 border-2 border-violet-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-violet-600 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-slate-900">Program Engagement</h4>
              </div>
              <p className="text-3xl font-bold text-violet-600 mb-1">
                {stats.avgAdherence.toFixed(1)}%
              </p>
              <p className="text-sm text-slate-600">Average medication adherence rate</p>
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              Active Alerts
              <span className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                {alerts.length}
              </span>
            </h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 ${
                    alert.severity === 'high'
                      ? 'bg-red-50 border-red-200'
                      : alert.severity === 'medium'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            alert.severity === 'high'
                              ? 'bg-red-100 text-red-800'
                              : alert.severity === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-600">{alert.alert_type}</span>
                      </div>
                      <p className="text-gray-900 mb-1">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        Patient: {alert.patients?.name} • {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="ml-4 px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 hover:border-gray-400 transition text-sm font-medium shadow-sm"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Recent Patients
            <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
              {patients.length} Total
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Name</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Age</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Gender</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Medication</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Starting Weight</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Goal Weight</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Points</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Diabetes</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">State</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 20).map((patient, index) => (
                  <tr
                    key={patient.id}
                    className={`border-b border-slate-100 hover:bg-blue-50 transition ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="py-4 px-4 text-sm font-bold text-slate-900">{patient.name}</td>
                    <td className="py-4 px-4 text-sm text-slate-700">{patient.age}</td>
                    <td className="py-4 px-4 text-sm text-slate-700 capitalize">{patient.gender}</td>
                    <td className="py-4 px-4 text-sm">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                        {patient.medication || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700 font-medium">{patient.starting_weight?.toFixed(1) || 'N/A'} kg</td>
                    <td className="py-4 px-4 text-sm text-slate-700 font-medium">
                      {patient.goal_weight ? `${patient.goal_weight.toFixed(1)} kg` : '-'}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">
                        {patient.total_points || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        patient.has_diabetes
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {patient.has_diabetes ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">{patient.state || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
