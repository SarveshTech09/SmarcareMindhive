import { useState } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, AlertCircle, Calendar } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  currentBMI: number;
  weightChangePercent: number;
  riskScore: number;
  hasSideEffects: boolean;
  adherencePercent: number;
  nextFollowup: string;
  medicineType: string;
  bmiClass: string;
  hasComorbidity: boolean;
  lastVisit: string;
}

interface PatientListViewProps {
  patients: Patient[];
  onPatientClick: (patientId: string) => void;
}

export default function PatientListView({ patients, onPatientClick }: PatientListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    ageRange: '',
    bmiClass: '',
    medicineType: '',
    comorbidity: '',
    riskLevel: '',
    adherenceMin: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredPatients = patients.filter((patient) => {
    if (searchQuery && !patient.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.bmiClass && patient.bmiClass !== filters.bmiClass) {
      return false;
    }
    if (filters.medicineType && patient.medicineType !== filters.medicineType) {
      return false;
    }
    if (filters.comorbidity === 'yes' && !patient.hasComorbidity) {
      return false;
    }
    if (filters.comorbidity === 'no' && patient.hasComorbidity) {
      return false;
    }
    if (filters.riskLevel === 'high' && patient.riskScore < 70) {
      return false;
    }
    if (filters.riskLevel === 'medium' && (patient.riskScore < 40 || patient.riskScore >= 70)) {
      return false;
    }
    if (filters.riskLevel === 'low' && patient.riskScore >= 40) {
      return false;
    }
    if (filters.adherenceMin > 0 && patient.adherencePercent < filters.adherenceMin) {
      return false;
    }
    return true;
  });

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-amber-600 bg-amber-100';
    return 'text-emerald-600 bg-emerald-100';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Patients</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">BMI Class</label>
              <select
                value={filters.bmiClass}
                onChange={(e) => setFilters({ ...filters, bmiClass: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="Normal">Normal</option>
                <option value="Overweight">Overweight</option>
                <option value="Obese">Obese</option>
                <option value="Severely Obese">Severely Obese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Type</label>
              <select
                value={filters.medicineType}
                onChange={(e) => setFilters({ ...filters, medicineType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="Semaglutide">Semaglutide</option>
                <option value="Liraglutide">Liraglutide</option>
                <option value="Tirzepatide">Tirzepatide</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comorbidity</label>
              <select
                value={filters.comorbidity}
                onChange={(e) => setFilters({ ...filters, comorbidity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Adherence %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.adherenceMin}
                onChange={(e) => setFilters({ ...filters, adherenceMin: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    ageRange: '',
                    bmiClass: '',
                    medicineType: '',
                    comorbidity: '',
                    riskLevel: '',
                    adherenceMin: 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-900">Patient Name</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-900">Age</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-900">Current BMI</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-900">Weight Change</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-900">Risk Score</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-900">Side Effects</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-900">Adherence</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-900">Next Follow-up</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => onPatientClick(patient.id)}
                >
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-600">{patient.medicineType}</p>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{patient.age}</td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">{patient.currentBMI.toFixed(1)}</span>
                    <p className="text-xs text-gray-600">{patient.bmiClass}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {patient.weightChangePercent < 0 ? (
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`font-semibold ${
                          patient.weightChangePercent < 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {patient.weightChangePercent > 0 ? '+' : ''}
                        {patient.weightChangePercent.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(patient.riskScore)}`}>
                      {getRiskLabel(patient.riskScore)} ({patient.riskScore})
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {patient.hasSideEffects ? (
                      <AlertCircle className="w-5 h-5 text-amber-600 mx-auto" />
                    ) : (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            patient.adherencePercent >= 80
                              ? 'bg-emerald-500'
                              : patient.adherencePercent >= 60
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${patient.adherencePercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-10">
                        {patient.adherencePercent}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {patient.nextFollowup}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPatientClick(patient.id);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No patients found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
