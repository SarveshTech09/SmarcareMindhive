import { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const MEDICATIONS = ['Semaglutide', 'Liraglutide', 'Dulaglutide', 'Tirzepatide'];

interface MedicineIntakeModalProps {
  onClose: () => void;
  patient: any;
}

export default function MedicineIntakeModal({ onClose, patient }: MedicineIntakeModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [therapyData, setTherapyData] = useState({
    medication: '',
    dose_mg: '',
    injection_date: new Date().toISOString().split('T')[0],
    weeks_on_therapy: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: therapyError } = await supabase
        .from('therapy_entries')
        .insert({
          patient_id: patient.id,
          ...therapyData,
          dose_mg: parseFloat(therapyData.dose_mg),
          weeks_on_therapy: parseInt(therapyData.weeks_on_therapy),
        });

      if (therapyError) throw therapyError;

      const { error: adherenceError } = await supabase
        .from('adherence_tracking')
        .insert({
          patient_id: patient.id,
          entry_date: new Date().toISOString().split('T')[0],
          missed_dose: false,
          appetite_change: 3,
          cravings_reduced: false,
        });

      if (adherenceError) throw adherenceError;

      const pointsAwarded = 5;
      await supabase.from('points_transactions').insert({
        patient_id: patient.id,
        points: pointsAwarded,
        reason: 'Medicine intake logged',
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

  const canSubmit = () => {
    return (
      therapyData.medication &&
      therapyData.dose_mg &&
      therapyData.injection_date &&
      therapyData.weeks_on_therapy
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Medicine Intake</h2>
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
            <p className="text-gray-600">Your medicine intake has been logged successfully.</p>
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Medication <span className="text-red-500">*</span>
              </label>
              <select
                value={therapyData.medication}
                onChange={(e) => setTherapyData({ ...therapyData, medication: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Select medication</option>
                {MEDICATIONS.map((med) => (
                  <option key={med} value={med}>
                    {med}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Dose (mg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={therapyData.dose_mg}
                  onChange={(e) => setTherapyData({ ...therapyData, dose_mg: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="1.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Injection Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={therapyData.injection_date}
                  onChange={(e) => setTherapyData({ ...therapyData, injection_date: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Weeks on Therapy <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={therapyData.weeks_on_therapy}
                onChange={(e) => setTherapyData({ ...therapyData, weeks_on_therapy: e.target.value })}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="4"
              />
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
                disabled={loading || !canSubmit()}
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
