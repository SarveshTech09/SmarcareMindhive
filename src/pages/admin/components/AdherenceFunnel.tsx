interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

interface AdherenceFunnelProps {
  data: FunnelData[];
}

export default function AdherenceFunnel({ data }: AdherenceFunnelProps) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Dropout / Adherence Funnel</h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const width = (item.count / maxCount) * 100;
          const isLast = index === data.length - 1;

          return (
            <div key={item.stage} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{item.stage}</span>
                <span className="text-sm text-gray-600">
                  {item.count} patients ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 flex items-center justify-center transition-all duration-500 ${
                    isLast
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      : index === data.length - 2
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  style={{ width: `${width}%` }}
                >
                  <span className="text-white font-semibold text-sm">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              {index < data.length - 1 && (
                <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 text-red-500">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
