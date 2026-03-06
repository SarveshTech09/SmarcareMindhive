import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Calendar, Activity, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [therapyHistory, setTherapyHistory] = useState<any[]>([]);
  const [sideEffectsHistory, setSideEffectsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (patientData) {
        setPatient(patientData);

        const { data: weight } = await supabase
          .from('weight_vitals')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('entry_date', { ascending: false });

        setWeightHistory(weight || []);

        const { data: therapy } = await supabase
          .from('therapy_entries')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('injection_date', { ascending: false });

        setTherapyHistory(therapy || []);

        const { data: sideEffects } = await supabase
          .from('side_effects')
          .select('*')
          .eq('patient_id', patientData.id)
          .order('entry_date', { ascending: false });

        setSideEffectsHistory(sideEffects || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your History</h1>
          <p className="text-gray-600">View your complete therapy journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Weight Entries</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{weightHistory.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Therapy Entries</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{therapyHistory.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Side Effects</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{sideEffectsHistory.length}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-blue-600" />
              Weight History
            </h2>
            {weightHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Weight (kg)</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">BMI</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Weight Loss %</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Blood Glucose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightHistory.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {entry.current_weight.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {entry.bmi ? entry.bmi.toFixed(1) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-emerald-600">
                          {entry.weight_loss_percentage ? `-${entry.weight_loss_percentage.toFixed(1)}%` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {entry.blood_glucose ? `${entry.blood_glucose} mg/dL` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">No weight entries yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-600" />
              Therapy History
            </h2>
            {therapyHistory.length > 0 ? (
              <div className="space-y-4">
                {therapyHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{entry.medication}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.injection_date).toLocaleDateString()} • Week {entry.weeks_on_therapy}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{entry.dose_mg} mg</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">No therapy entries yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Side Effects History
            </h2>
            {sideEffectsHistory.length > 0 ? (
              <div className="space-y-4">
                {sideEffectsHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{entry.symptom}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </p>
                      {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          entry.severity === 'mild'
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.severity === 'moderate'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {entry.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">No side effects reported</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
