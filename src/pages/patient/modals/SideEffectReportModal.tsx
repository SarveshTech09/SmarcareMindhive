import { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const SYMPTOMS = ['Nausea', 'Vomiting', 'Constipation', 'Diarrhea', 'Fatigue', 'Dizziness', 'Headache'];
const SYMPTOM_INFO: Record<string, string> = {
  'Nausea': 'Common in week 2. 65% of users report it. Usually subsides after first few weeks.',
  'Vomiting': 'Occurs in 15-20% of users. Typically mild and temporary. Stay hydrated.',
  'Constipation': 'Reported by 30% of users. Increase fiber intake and water consumption.',
  'Diarrhea': 'Affects 25% of users initially. Usually resolves within 2-3 weeks.',
  'Fatigue': 'Common during dose adjustment. Ensure adequate rest and nutrition.',
  'Dizziness': 'May occur with dose changes. Rise slowly from sitting/lying positions.',
  'Headache': 'Can occur during initial weeks. Stay hydrated and get adequate rest.',
};

interface SideEffectReportModalProps {
  onClose: () => void;
  patient: any;
}

export default function SideEffectReportModal({ onClose, patient }: SideEffectReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [sideEffects, setSideEffects] = useState<{ symptom: string; severity: string; notes: string }[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');

  const [adherenceData, setAdherenceData] = useState({
    appetite_change: 3,
    cravings_reduced: false,
  });

  const addSideEffect = (symptom: string, severity: string) => {
    setSideEffects([...sideEffects, { symptom, severity, notes: '' }]);
    setSelectedSymptom('');
    setCustomSymptom('');
  };

  const removeSideEffect = (index: number) => {
    setSideEffects(sideEffects.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const entryDate = new Date().toISOString().split('T')[0];

      if (sideEffects.length > 0) {
        const { error: sideEffectsError } = await supabase.from('side_effects').insert(
          sideEffects.map((effect) => ({
            patient_id: patient.id,
            entry_date: entryDate,
            symptom: effect.symptom,
            severity: effect.severity,
            notes: effect.notes,
          }))
        );

        if (sideEffectsError) throw sideEffectsError;

        if (sideEffects.some((e) => e.severity === 'severe')) {
          await supabase.from('alerts').insert({
            patient_id: patient.id,
            alert_type: 'severe_side_effects',
            severity: 'high',
            message: `Severe side effects reported: ${sideEffects.filter((e) => e.severity === 'severe').map((e) => e.symptom).join(', ')}`,
          });
        }
      }

      const { error: adherenceError } = await supabase
        .from('adherence_tracking')
        .insert({
          patient_id: patient.id,
          entry_date: entryDate,
          missed_dose: false,
          appetite_change: adherenceData.appetite_change,
          cravings_reduced: adherenceData.cravings_reduced,
        });

      if (adherenceError) throw adherenceError;

      const pointsAwarded = 5;
      await supabase.from('points_transactions').insert({
        patient_id: patient.id,
        points: pointsAwarded,
        reason: 'Side effect report logged',
        transaction_type: 'earned',
      });

      await supabase
        .from('patients')
        .update({ total_points: patient.total_points + pointsAwarded })
        .eq('id', patient.id);

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Side Effect Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Entry Submitted!</h3>
            <p className="text-gray-600">Your side effect report has been logged successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Add Side Effects</label>
              <div className="space-y-4">
                <select
                  value={selectedSymptom}
                  onChange={(e) => setSelectedSymptom(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select symptom</option>
                  {SYMPTOMS.map((symptom) => (
                    <option key={symptom} value={symptom}>
                      {symptom}
                    </option>
                  ))}
                  <option value="custom">Other (custom)</option>
                </select>

                {selectedSymptom === 'custom' && (
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    placeholder="Enter custom symptom"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                )}

                {selectedSymptom && selectedSymptom !== 'custom' && SYMPTOM_INFO[selectedSymptom] && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">{SYMPTOM_INFO[selectedSymptom]}</p>
                  </div>
                )}

                {(selectedSymptom && selectedSymptom !== 'custom') || (selectedSymptom === 'custom' && customSymptom) ? (
                  <div className="flex gap-2">
                    {['mild', 'moderate', 'severe'].map((severity) => (
                      <button
                        key={severity}
                        type="button"
                        onClick={() =>
                          addSideEffect(
                            selectedSymptom === 'custom' ? customSymptom : selectedSymptom,
                            severity
                          )
                        }
                        className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition ${
                          severity === 'mild'
                            ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                            : severity === 'moderate'
                            ? 'border-orange-300 text-orange-700 hover:bg-orange-50'
                            : 'border-red-300 text-red-700 hover:bg-red-50'
                        }`}
                      >
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {sideEffects.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Reported Side Effects</h3>
                <div className="space-y-2">
                  {sideEffects.map((effect, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{effect.symptom}</p>
                        <p className="text-sm text-gray-600 capitalize">{effect.severity}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSideEffect(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How has your appetite changed?
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Much Higher</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={adherenceData.appetite_change}
                    onChange={(e) =>
                      setAdherenceData({ ...adherenceData, appetite_change: parseInt(e.target.value) })
                    }
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-600">Much Lower</span>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Level: {adherenceData.appetite_change}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={adherenceData.cravings_reduced}
                    onChange={(e) =>
                      setAdherenceData({ ...adherenceData, cravings_reduced: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    My food cravings have reduced
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
