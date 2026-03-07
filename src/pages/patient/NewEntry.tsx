import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Scale, Activity, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MedicineIntakeModal from './modals/MedicineIntakeModal';
import WeightEntryModal from './modals/WeightEntryModal';
import ExerciseActivityModal from './modals/ExerciseActivityModal';
import SideEffectReportModal from './modals/SideEffectReportModal';

export default function NewEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);

  const [lastMedicineIntake, setLastMedicineIntake] = useState<any>(null);
  const [lastWeightEntry, setLastWeightEntry] = useState<any>(null);
  const [lastExerciseActivity, setLastExerciseActivity] = useState<any>(null);
  const [lastSideEffect, setLastSideEffect] = useState<any>(null);

  useEffect(() => {
    loadPatientData();
  }, [user]);

  const loadPatientData = async () => {
    const { data: patientData } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (patientData) {
      setPatient(patientData);
      await loadLastEntries(patientData.id);
    }
  };

  const loadLastEntries = async (patientId: string) => {
    const { data: therapyData } = await supabase
      .from('therapy_entries')
      .select('*')
      .eq('patient_id', patientId)
      .order('injection_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    setLastMedicineIntake(therapyData);

    const { data: weightData } = await supabase
      .from('weight_vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('entry_date', { ascending: false })
      .limit(2);

    if (weightData && weightData.length > 0) {
      setLastWeightEntry(weightData);
    }

    const { data: exerciseData } = await supabase
      .from('exercise_activities')
      .select('*')
      .eq('patient_id', patientId)
      .order('entry_date', { ascending: false })
      .limit(2);

    if (exerciseData && exerciseData.length > 0) {
      setLastExerciseActivity(exerciseData);
    }

    const { data: sideEffectData } = await supabase
      .from('side_effects')
      .select('*')
      .eq('patient_id', patientId)
      .order('entry_date', { ascending: false })
      .limit(2);

    if (sideEffectData && sideEffectData.length > 0) {
      setLastSideEffect(sideEffectData);
    }
  };

  const handleModalClose = () => {
    setOpenModal(null);
    loadPatientData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 lg:px-8">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Entry</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Pill className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Medicine Intake</h2>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Log medicine intake</p>
                {lastMedicineIntake && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-sm text-gray-600">
                        Yes - {formatDate(lastMedicineIntake.injection_date)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-4">
                View History
              </button>

              <div className="w-full h-48 lg:h-56 xl:h-64 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Medicine"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <button
              onClick={() => setOpenModal('medicine')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold hover:from-blue-700 hover:to-green-600 transition-all flex items-center justify-center gap-2 mt-auto"
            >
              Log medicine intake
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Scale className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Weight Entry</h2>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Last Update</p>
                {lastWeightEntry && lastWeightEntry.length > 0 && (
                  <div className="space-y-1">
                    {lastWeightEntry.slice(0, 2).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm text-gray-600">
                          {entry.current_weight}kg - {formatDate(entry.entry_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-4">
                View History
              </button>

              <div className="w-full h-48 lg:h-56 xl:h-64 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg?auto=compress&cs=tinysrgb&w=800"
                  alt="Weight tracking"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <button
              onClick={() => setOpenModal('weight')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2 mt-auto"
            >
              Log today's weight
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Exercise Activity</h2>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Last Update</p>
                {lastExerciseActivity && lastExerciseActivity.length > 0 && (
                  <div className="space-y-1">
                    {lastExerciseActivity.slice(0, 2).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm text-gray-600">
                          {entry.activity_type}, {entry.duration_minutes}min ({formatDate(entry.entry_date)})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-4">
                View History
              </button>

              <div className="w-full h-48 lg:h-56 xl:h-64 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Exercise"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <button
              onClick={() => setOpenModal('exercise')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold hover:from-blue-700 hover:to-green-600 transition-all flex items-center justify-center gap-2 mt-auto"
            >
              Log today's activities
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Side Effect Report</h2>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Last Update</p>
                {lastSideEffect && lastSideEffect.length > 0 && (
                  <div className="space-y-1">
                    {lastSideEffect.slice(0, 2).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm text-gray-600">
                          {entry.symptom} ({entry.severity}) - {formatDate(entry.entry_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-4">
                View History
              </button>

              <div className="w-full h-48 lg:h-56 xl:h-64 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Side effects"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <button
              onClick={() => setOpenModal('sideEffect')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2 mt-auto"
            >
              Log today's side effect
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {openModal === 'medicine' && patient && (
        <MedicineIntakeModal onClose={handleModalClose} patient={patient} />
      )}
      {openModal === 'weight' && patient && (
        <WeightEntryModal onClose={handleModalClose} patient={patient} />
      )}
      {openModal === 'exercise' && patient && (
        <ExerciseActivityModal onClose={handleModalClose} patient={patient} />
      )}
      {openModal === 'sideEffect' && patient && (
        <SideEffectReportModal onClose={handleModalClose} patient={patient} />
      )}
    </div>
  );
}
