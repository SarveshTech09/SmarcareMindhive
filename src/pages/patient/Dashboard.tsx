import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  TrendingDown,
  Calendar,
  Award,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import WeightTrendChart from './components/WeightTrendChart';
import BMIChart from './components/BMIChart';
import SideEffectsChart from './components/SideEffectsChart';
import AppetiteChangeTrend from './components/AppetiteChangeTrend';
import AdherenceCalendar from './components/AdherenceCalendar';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [latestEntry, setLatestEntry] = useState<any>(null);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [therapyData, setTherapyData] = useState<any[]>([]);
  const [sideEffects, setSideEffects] = useState<any[]>([]);
  const [adherenceData, setAdherenceData] = useState<any[]>([]);
  const [pointsTransactions, setPointsTransactions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (patientData) {
        setPatient(patientData);

        const { data: weightEntries } = await supabase
          .from('weight_vitals')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('entry_date', { ascending: false });

        setWeightData(weightEntries || []);

        const { data: therapyEntries } = await supabase
          .from('therapy_entries')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('created_at', { ascending: false });

        setTherapyData(therapyEntries || []);
        setLatestEntry(therapyEntries?.[0]);

        const { data: sideEffectsData } = await supabase
          .from('side_effects')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('entry_date', { ascending: false });

        setSideEffects(sideEffectsData || []);

        const { data: adherenceEntries } = await supabase
          .from('adherence_tracking')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('entry_date', { ascending: false });

        setAdherenceData(adherenceEntries || []);

        const { data: transactionsData } = await supabase
          .from('points_transactions')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('created_at', { ascending: false });

        setPointsTransactions(transactionsData || []);

        const { data: alertsData } = await supabase
          .from('alerts')
          .select('*')
          .eq('patient_id', patientData.id)
          .eq('resolved', false)
          .order('created_at', { ascending: false });

        setAlerts(alertsData || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysSinceLastEntry = () => {
    if (!latestEntry) return null;
    const lastDate = new Date(latestEntry.injection_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const currentWeight = weightData.length > 0 ? weightData[0].current_weight : patient?.starting_weight;
  const weightLoss = patient?.starting_weight && currentWeight
    ? ((patient.starting_weight - currentWeight) / patient.starting_weight * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center border border-slate-200">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
          <p className="text-slate-600 mb-6">Please complete your patient profile to access the dashboard.</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-medium shadow-md"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {patient.name}
          </h1>
          <p className="text-slate-600">Track your therapy progress and stay on schedule</p>
        </div>

        {/* {alerts.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Important Alerts</h3>
                <ul className="space-y-2">
                  {alerts.map((alert) => (
                    <li key={alert.id} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{alert.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )} */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform transition hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {latestEntry?.dose_mg || 0} mg
            </p>
            <p className="text-sm text-blue-100 font-medium">Current Dose</p>
            <p className="text-xs text-blue-200 mt-2">
              {latestEntry?.medication || 'No medication set'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white transform transition hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {weightLoss}%
            </p>
            <p className="text-sm text-emerald-100 font-medium">Weight Loss Progress</p>
            <p className="text-xs text-emerald-200 mt-2">
              Current: {currentWeight?.toFixed(1)} kg
            </p>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform transition hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {daysSinceLastEntry() || '-'} days
            </p>
            <p className="text-sm text-violet-100 font-medium">Last Entry</p>
            <p className="text-xs text-violet-200 mt-2">
              {latestEntry ? new Date(latestEntry.injection_date).toLocaleDateString() : 'No entries yet'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform transition hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {patient.total_points}
            </p>
            <p className="text-sm text-amber-100 font-medium">Reward Points</p>
            <p className="text-xs text-amber-200 mt-2">Keep tracking to earn more</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <WeightTrendChart data={weightData} goalWeight={patient.goal_weight} />
          <BMIChart data={weightData} height={patient.height || 170} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <SideEffectsChart data={sideEffects} />
          <AppetiteChangeTrend data={adherenceData} />
        </div>

        <div className="mb-5">
          <AdherenceCalendar adherenceData={adherenceData} therapyData={therapyData} />
        </div>
      </div>
    </div>
  );
}
