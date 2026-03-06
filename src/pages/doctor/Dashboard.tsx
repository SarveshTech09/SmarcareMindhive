import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import TodayOverview from './TodayOverview';
import PatientListView from './PatientListView';
import PatientDetailView from './PatientDetailView';

type ViewMode = 'overview' | 'list' | 'detail';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDoctorData();
    }
  }, [user]);

  const loadDoctorData = async () => {
    try {
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (doctorData) {
        setDoctor(doctorData);
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dummyStats = {
    activePatients: 47,
    highRiskAlerts: 8,
    followupsToday: 12,
    avgBMIReduction: 8.5,
    adherenceRate: 78,
  };

  const dummyActionRequired = [
    {
      id: 'p1',
      patientName: 'Rajesh Kumar',
      issue: 'Severe nausea reported for 3 consecutive days. HbA1c level dropped to 5.2 (hypoglycemia risk)',
      severity: 'severe' as const,
      time: '2 hours ago',
    },
    {
      id: 'p2',
      patientName: 'Priya Sharma',
      issue: 'Sudden weight gain of 2.5 kg in last week. Possible treatment plateau or non-compliance',
      severity: 'severe' as const,
      time: '4 hours ago',
    },
    {
      id: 'p3',
      patientName: 'Amit Patel',
      issue: 'Missed last 3 scheduled follow-ups. Last medication intake logged 9 days ago',
      severity: 'warning' as const,
      time: '1 day ago',
    },
    {
      id: 'p4',
      patientName: 'Sneha Reddy',
      issue: 'Dropout probability score increased to 75%. Low app engagement (12% in last week)',
      severity: 'warning' as const,
      time: '1 day ago',
    },
    {
      id: 'p5',
      patientName: 'Vikram Singh',
      issue: 'BP reading elevated: 158/95. Patient has comorbid hypertension',
      severity: 'severe' as const,
      time: '5 hours ago',
    },
  ];

  const dummyBMITrendData = [
    { date: 'Week 1', avgBMI: 32.5 },
    { date: 'Week 2', avgBMI: 32.1 },
    { date: 'Week 3', avgBMI: 31.8 },
    { date: 'Week 4', avgBMI: 31.4 },
    { date: 'Week 5', avgBMI: 31.0 },
    { date: 'Week 6', avgBMI: 30.6 },
    { date: 'Week 7', avgBMI: 30.2 },
    { date: 'Week 8', avgBMI: 29.9 },
  ];

  const dummySideEffectData = [
    { effect: 'Nausea', count: 28 },
    { effect: 'Fatigue', count: 22 },
    { effect: 'Headache', count: 18 },
    { effect: 'Constipation', count: 15 },
    { effect: 'Dizziness', count: 12 },
  ];

  const dummyPatients = [
    {
      id: 'p1',
      name: 'Rajesh Kumar',
      age: 45,
      currentBMI: 31.2,
      weightChangePercent: -8.5,
      riskScore: 85,
      hasSideEffects: true,
      adherencePercent: 72,
      nextFollowup: 'Mar 8, 2026',
      medicineType: 'Semaglutide',
      bmiClass: 'Obese',
      hasComorbidity: true,
      lastVisit: 'Feb 28, 2026',
    },
    {
      id: 'p2',
      name: 'Priya Sharma',
      age: 38,
      currentBMI: 29.8,
      weightChangePercent: -12.3,
      riskScore: 78,
      hasSideEffects: true,
      adherencePercent: 88,
      nextFollowup: 'Mar 10, 2026',
      medicineType: 'Liraglutide',
      bmiClass: 'Overweight',
      hasComorbidity: false,
      lastVisit: 'Mar 1, 2026',
    },
    {
      id: 'p3',
      name: 'Amit Patel',
      age: 52,
      currentBMI: 33.5,
      weightChangePercent: -5.2,
      riskScore: 68,
      hasSideEffects: false,
      adherencePercent: 45,
      nextFollowup: 'Mar 12, 2026',
      medicineType: 'Tirzepatide',
      bmiClass: 'Obese',
      hasComorbidity: true,
      lastVisit: 'Feb 20, 2026',
    },
    {
      id: 'p4',
      name: 'Sneha Reddy',
      age: 41,
      currentBMI: 28.4,
      weightChangePercent: -15.8,
      riskScore: 82,
      hasSideEffects: true,
      adherencePercent: 65,
      nextFollowup: 'Mar 15, 2026',
      medicineType: 'Semaglutide',
      bmiClass: 'Overweight',
      hasComorbidity: false,
      lastVisit: 'Feb 25, 2026',
    },
    {
      id: 'p5',
      name: 'Vikram Singh',
      age: 48,
      currentBMI: 32.9,
      weightChangePercent: -7.1,
      riskScore: 75,
      hasSideEffects: true,
      adherencePercent: 82,
      nextFollowup: 'Mar 9, 2026',
      medicineType: 'Semaglutide',
      bmiClass: 'Obese',
      hasComorbidity: true,
      lastVisit: 'Mar 2, 2026',
    },
    {
      id: 'p6',
      name: 'Deepa Menon',
      age: 36,
      currentBMI: 27.2,
      weightChangePercent: -18.5,
      riskScore: 25,
      hasSideEffects: false,
      adherencePercent: 95,
      nextFollowup: 'Mar 20, 2026',
      medicineType: 'Liraglutide',
      bmiClass: 'Overweight',
      hasComorbidity: false,
      lastVisit: 'Mar 3, 2026',
    },
  ];

  const getSelectedPatientData = () => {
    const patient = dummyPatients.find((p) => p.id === selectedPatientId);
    if (!patient) return null;

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: 'Male',
        bmiClass: patient.bmiClass,
        medicineName: patient.medicineType,
        startDate: 'Jan 15, 2026',
        riskScore: patient.riskScore,
      },
      weightBMIData: [
        { date: 'Jan 15', weight: 95.0, bmi: 34.2, target: 80.0 },
        { date: 'Jan 22', weight: 93.5, bmi: 33.7, target: 80.0 },
        { date: 'Jan 29', weight: 92.0, bmi: 33.1, target: 80.0, medicineChange: 'Increased to 0.5mg' },
        { date: 'Feb 5', weight: 90.2, bmi: 32.5, target: 80.0 },
        { date: 'Feb 12', weight: 88.8, bmi: 32.0, target: 80.0 },
        { date: 'Feb 19', weight: 87.5, bmi: 31.5, target: 80.0 },
        { date: 'Feb 26', weight: 86.5, bmi: 31.2, target: 80.0, medicineChange: 'Increased to 1.0mg' },
        { date: 'Mar 5', weight: 85.8, bmi: 30.9, target: 80.0 },
      ],
      adherenceData: [
        { date: 'Day 1', taken: true, missed: false, engagement: 85 },
        { date: 'Day 2', taken: true, missed: false, engagement: 90 },
        { date: 'Day 3', taken: true, missed: false, engagement: 88 },
        { date: 'Day 4', taken: false, missed: true, engagement: 40 },
        { date: 'Day 5', taken: true, missed: false, engagement: 92 },
        { date: 'Day 6', taken: true, missed: false, engagement: 87 },
        { date: 'Day 7', taken: true, missed: false, engagement: 85 },
        { date: 'Day 8', taken: true, missed: false, engagement: 89 },
        { date: 'Day 9', taken: true, missed: false, engagement: 91 },
        { date: 'Day 10', taken: false, missed: true, engagement: 35 },
        { date: 'Day 11', taken: true, missed: false, engagement: 88 },
        { date: 'Day 12', taken: true, missed: false, engagement: 90 },
        { date: 'Day 13', taken: true, missed: false, engagement: 86 },
        { date: 'Day 14', taken: true, missed: false, engagement: 93 },
      ],
      sideEffectsData: [
        { effect: 'Nausea', frequency: 12, severity: 'moderate' as const, timeline: 'Week 2-4' },
        { effect: 'Fatigue', frequency: 8, severity: 'mild' as const, timeline: 'Week 1-3' },
        { effect: 'Headache', frequency: 6, severity: 'mild' as const, timeline: 'Week 1-2' },
        { effect: 'Constipation', frequency: 5, severity: 'moderate' as const, timeline: 'Week 3-5' },
        { effect: 'Dizziness', frequency: 3, severity: 'severe' as const, timeline: 'Week 4' },
      ],
      comorbidityData: {
        hba1c: [
          { date: 'Jan', value: 7.8 },
          { date: 'Feb', value: 7.2 },
          { date: 'Mar', value: 6.8 },
        ],
        bp: [
          { date: 'Jan 15', systolic: 145, diastolic: 92 },
          { date: 'Feb 1', systolic: 138, diastolic: 88 },
          { date: 'Feb 15', systolic: 135, diastolic: 85 },
          { date: 'Mar 1', systolic: 132, diastolic: 82 },
        ],
        lipids: [
          { date: 'Jan', ldl: 145, hdl: 42 },
          { date: 'Feb', ldl: 132, hdl: 48 },
          { date: 'Mar', ldl: 125, hdl: 52 },
        ],
      },
      aiInsights: {
        plateauRisk: 35,
        suggestedDose: '1.5mg',
        relapseProb: 22,
        cohortOutcome: '12.5% avg loss',
      },
    };
  };

  const handlePatientClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPatientId(null);
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedPatientId(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {viewMode === 'overview'
                  ? 'Today Overview'
                  : viewMode === 'list'
                  ? 'My Patients'
                  : 'Patient Details'}
              </h1>
              <p className="text-gray-600">
                {doctor?.name} • DC Code: <span className="font-mono font-semibold">{doctor?.dc_code}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBackToOverview}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Patient List
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'overview' && (
          <TodayOverview
            stats={dummyStats}
            actionRequired={dummyActionRequired}
            bmiTrendData={dummyBMITrendData}
            sideEffectData={dummySideEffectData}
            onPatientClick={handlePatientClick}
          />
        )}

        {viewMode === 'list' && <PatientListView patients={dummyPatients} onPatientClick={handlePatientClick} />}

        {viewMode === 'detail' && selectedPatientId && (
          <PatientDetailView
            {...getSelectedPatientData()!}
            onBack={handleBackToList}
            onAdjustDose={() => alert('Adjust Dose clicked')}
            onAddNote={() => alert('Add Note clicked')}
            onScheduleFollowup={() => alert('Schedule Follow-up clicked')}
            onFlagMonitoring={() => alert('Flag for Monitoring clicked')}
            onSendNotification={() => alert('Send Notification clicked')}
            onGenerateReport={() => alert('Generate Report clicked')}
          />
        )}
      </div>
    </div>
  );
}
