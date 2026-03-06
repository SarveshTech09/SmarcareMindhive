import { Target } from 'lucide-react';

interface GoalProgressRingProps {
  startingWeight: number;
  currentWeight: number;
  goalWeight: number;
}

export default function GoalProgressRing({ startingWeight, currentWeight, goalWeight }: GoalProgressRingProps) {
  const totalWeightToLose = startingWeight - goalWeight;
  const weightLost = startingWeight - currentWeight;
  const progressPercentage = Math.min(100, Math.max(0, (weightLost / totalWeightToLose) * 100));
  const remainingWeight = Math.max(0, currentWeight - goalWeight);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const getProgressColor = () => {
    if (progressPercentage >= 100) return '#10b981';
    if (progressPercentage >= 75) return '#34d399';
    if (progressPercentage >= 50) return '#60a5fa';
    if (progressPercentage >= 25) return '#93c5fd';
    return '#dbeafe';
  };

  const getProgressLabel = () => {
    if (progressPercentage >= 100) return 'Goal Achieved!';
    if (progressPercentage >= 75) return 'Almost There!';
    if (progressPercentage >= 50) return 'Halfway There!';
    if (progressPercentage >= 25) return 'Great Start!';
    return 'Keep Going!';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-teal-100 p-2 rounded-lg">
          <Target className="w-5 h-5 text-teal-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Goal Progress</h2>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="14"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={getProgressColor()}
              strokeWidth="14"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-gray-900">{progressPercentage.toFixed(0)}%</p>
            <p className="text-sm text-gray-600 mt-1">Complete</p>
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="text-xl font-semibold text-gray-900 mb-2">{getProgressLabel()}</p>
          {progressPercentage >= 100 && (
            <p className="text-base text-emerald-600 font-medium">Goal achieved!</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6 w-full mb-6">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Starting</p>
            <p className="text-2xl font-bold text-gray-900">{startingWeight.toFixed(1)}</p>
            <p className="text-xs text-gray-600">kg</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Current</p>
            <p className="text-2xl font-bold text-blue-600">{currentWeight.toFixed(1)}</p>
            <p className="text-xs text-gray-600">kg</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Goal</p>
            <p className="text-2xl font-bold text-emerald-600">{goalWeight.toFixed(1)}</p>
            <p className="text-xs text-gray-600">kg</p>
          </div>
        </div>

        <div className="w-full px-6 py-3 bg-emerald-50 rounded-lg">
          <p className="text-base text-emerald-700 text-center">
            <span className="font-bold">{weightLost.toFixed(1)} kg</span> lost so far
          </p>
        </div>
      </div>
    </div>
  );
}
