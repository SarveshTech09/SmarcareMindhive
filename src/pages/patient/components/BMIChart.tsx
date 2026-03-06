interface BMIChartProps {
  data: Array<{
    current_weight: number;
    entry_date: string;
  }>;
  height: number;
}

export default function BMIChart({ data, height }: BMIChartProps) {
  const heightInMeters = height / 100;

  const currentWeight = data.length > 0
    ? data.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())[0].current_weight
    : 0;

  const currentBMI = currentWeight / (heightInMeters * heightInMeters);

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (bmi: number): string => {
    if (bmi < 18.5) return '#60a5fa';
    if (bmi < 25) return '#4ade80';
    if (bmi < 30) return '#fbbf24';
    return '#f87171';
  };

  const getHealthyWeightRange = (heightCm: number): { min: number; max: number } => {
    const heightM = heightCm / 100;
    const minWeight = 18.5 * heightM * heightM;
    const maxWeight = 24.9 * heightM * heightM;
    return { min: minWeight, max: maxWeight };
  };

  const getBMIPosition = (bmi: number): number => {
    const minBMI = 10;
    const maxBMI = 40;
    const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
    return ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 100;
  };

  const category = getBMICategory(currentBMI);
  const color = getBMIColor(currentBMI);
  const position = getBMIPosition(currentBMI);
  const healthyRange = getHealthyWeightRange(height);

  const BMIBar = () => {
    const segments = [
      { start: 0, end: 27.5, color: '#60a5fa', label: '< 18.5' },
      { start: 27.5, end: 48.3, color: '#4ade80', label: '18.5 - 24.9' },
      { start: 48.3, end: 66.7, color: '#fbbf24', label: '25.0 - 29.9' },
      { start: 66.7, end: 100, color: '#f87171', label: '30.0+' },
    ];

    return (
      <div className="relative w-full h-8 flex rounded-full overflow-hidden">
        {segments.map((segment, idx) => (
          <div
            key={idx}
            className="h-full"
            style={{
              backgroundColor: segment.color,
              width: `${segment.end - segment.start}%`,
            }}
          />
        ))}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-10 bg-gray-800 rounded-full shadow-lg transition-all duration-300"
          style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 h-full flex flex-col border border-gray-200">
      <h2 className="text-base font-semibold text-gray-900 mb-5">My BMI</h2>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-6">
          <div className="text-8xl font-bold mb-2" style={{ color }}>
            {currentBMI.toFixed(1)}
          </div>
          <div
            className="inline-block px-6 py-2 rounded-full text-white text-lg font-semibold"
            style={{ backgroundColor: color }}
          >
            {category}
          </div>
        </div>

        <div className="w-full max-w-lg mb-8">
          <BMIBar />
        </div>

        <div className="w-full border-t pt-6">
          <div className="grid grid-cols-2 gap-6 text-center mb-6">
            <div>
              <div className="text-3xl font-bold" style={{ color: '#4ade80' }}>
                {currentWeight.toFixed(1)} kg
              </div>
              <div className="text-sm text-gray-600 mt-1">Weight</div>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#4ade80' }}>
                {height} cm
              </div>
              <div className="text-sm text-gray-600 mt-1">Height</div>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">Healthy weight for your height:</div>
            <div className="text-2xl font-bold" style={{ color: '#4ade80' }}>
              {healthyRange.min.toFixed(1)} kg - {healthyRange.max.toFixed(1)} kg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
