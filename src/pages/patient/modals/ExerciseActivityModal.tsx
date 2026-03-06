import { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const ACTIVITY_TYPES = ['Walking', 'Running', 'Swimming', 'Cycling', 'Yoga', 'Gym', 'Dancing', 'Sports'];
const INTENSITY_LEVELS = ['low', 'moderate', 'high'];

interface ExerciseActivityModalProps {
  onClose: () => void;
  patient: any;
}

export default function ExerciseActivityModal({ onClose, patient }: ExerciseActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [exerciseData, setExerciseData] = useState({
    activity_type: '',
    duration_minutes: '',
    intensity: 'moderate',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const entryDate = new Date().toISOString().split('T')[0];

      const { error: exerciseError } = await supabase
        .from('exercise_activities')
        .insert({
          patient_id: patient.id,
          entry_date: entryDate,
          activity_type: exerciseData.activity_type,
          duration_minutes: parseInt(exerciseData.duration_minutes),
          intensity: exerciseData.intensity,
          notes: exerciseData.notes,
        });

      if (exerciseError) throw exerciseError;

      const pointsAwarded = 5;
      await supabase.from('points_transactions').insert({
        patient_id: patient.id,
        points: pointsAwarded,
        reason: 'Exercise activity logged',
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
    return exerciseData.activity_type && exerciseData.duration_minutes && exerciseData.intensity;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Exercise Activity</h2>
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
            <p className="text-gray-600">Your exercise activity has been logged successfully.</p>
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
                Activity Type <span className="text-red-500">*</span>
              </label>
              <select
                value={exerciseData.activity_type}
                onChange={(e) => setExerciseData({ ...exerciseData, activity_type: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Select activity</option>
                {ACTIVITY_TYPES.map((activity) => (
                  <option key={activity} value={activity}>
                    {activity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={exerciseData.duration_minutes}
                onChange={(e) => setExerciseData({ ...exerciseData, duration_minutes: e.target.value })}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Intensity <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {INTENSITY_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setExerciseData({ ...exerciseData, intensity: level })}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                      exerciseData.intensity === level
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={exerciseData.notes}
                onChange={(e) => setExerciseData({ ...exerciseData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Any additional details..."
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
