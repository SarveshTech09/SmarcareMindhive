import { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface WeightEntryModalProps {
  onClose: () => void;
  patient: any;
}

export default function WeightEntryModal({ onClose, patient }: WeightEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [weightData, setWeightData] = useState({
    current_weight: '',
    blood_glucose: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    hba1c: '',
  });

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const calculateWeightLoss = (currentWeight: number, startingWeight: number) => {
    return ((startingWeight - currentWeight) / startingWeight) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const entryDate = new Date().toISOString().split('T')[0];
      const bmi = calculateBMI(parseFloat(weightData.current_weight), patient.height);
      const weightLossPercentage = calculateWeightLoss(
        parseFloat(weightData.current_weight),
        patient.starting_weight
      );

      const { error: weightError } = await supabase
        .from('weight_vitals')
        .insert({
          patient_id: patient.id,
          entry_date: entryDate,
          current_weight: parseFloat(weightData.current_weight),
          blood_glucose: weightData.blood_glucose ? parseFloat(weightData.blood_glucose) : null,
          blood_pressure_systolic: weightData.blood_pressure_systolic
            ? parseInt(weightData.blood_pressure_systolic)
            : null,
          blood_pressure_diastolic: weightData.blood_pressure_diastolic
            ? parseInt(weightData.blood_pressure_diastolic)
            : null,
          hba1c: weightData.hba1c ? parseFloat(weightData.hba1c) : null,
          bmi,
          weight_loss_percentage: weightLossPercentage,
        });

      if (weightError) throw weightError;

      const pointsAwarded = 5;
      await supabase.from('points_transactions').insert({
        patient_id: patient.id,
        points: pointsAwarded,
        reason: 'Weight entry logged',
        transaction_type: 'earned',
      });

      await supabase
        .from('patients')
        .update({ total_points: patient.total_points + pointsAwarded })
        .eq('id', patient.id);

      if (weightLossPercentage >= 5) {
        await supabase.from('points_transactions').insert({
          patient_id: patient.id,
          points: 50,
          reason: 'Achieved 5% weight loss milestone',
          transaction_type: 'earned',
        });

        await supabase
          .from('patients')
          .update({ total_points: patient.total_points + pointsAwarded + 50 })
          .eq('id', patient.id);
      }

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
    return weightData.current_weight;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Weight Entry</h2>
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
            <p className="text-gray-600">Your weight has been logged successfully.</p>
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
                Current Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weightData.current_weight}
                onChange={(e) => setWeightData({ ...weightData, current_weight: e.target.value })}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="75.5"
              />
              {patient && weightData.current_weight && (
                <p className="text-sm text-gray-600 mt-2">
                  Weight change: {(patient.starting_weight - parseFloat(weightData.current_weight)).toFixed(1)} kg (
                  {calculateWeightLoss(parseFloat(weightData.current_weight), patient.starting_weight).toFixed(1)}%)
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Optional Vitals</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Blood Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightData.blood_glucose}
                    onChange={(e) => setWeightData({ ...weightData, blood_glucose: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Systolic BP
                    </label>
                    <input
                      type="number"
                      value={weightData.blood_pressure_systolic}
                      onChange={(e) =>
                        setWeightData({ ...weightData, blood_pressure_systolic: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Diastolic BP
                    </label>
                    <input
                      type="number"
                      value={weightData.blood_pressure_diastolic}
                      onChange={(e) =>
                        setWeightData({ ...weightData, blood_pressure_diastolic: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="80"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">HbA1C (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightData.hba1c}
                    onChange={(e) => setWeightData({ ...weightData, hba1c: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="5.7"
                  />
                </div>
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
