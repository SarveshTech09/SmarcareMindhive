import { Award, TrendingUp, Gift } from 'lucide-react';

interface RewardPointsTrackerProps {
  totalPoints: number;
  recentTransactions: Array<{
    points: number;
    reason: string;
    transaction_type: string;
    created_at: string;
  }>;
}

export default function RewardPointsTracker({ totalPoints, recentTransactions }: RewardPointsTrackerProps) {
  const rewards = [
    { name: 'Fitness Membership', points: 100, icon: '🏋️' },
    { name: 'Diet Planner', points: 150, icon: '🥗' },
    { name: 'Health Coaching', points: 200, icon: '💪' },
    { name: 'Wellness Package', points: 300, icon: '🎁' },
  ];

  const getProgressToNextReward = () => {
    const nextReward = rewards.find(r => r.points > totalPoints);
    if (!nextReward) return { name: 'All rewards unlocked!', percentage: 100, needed: 0 };

    const previousReward = rewards
      .filter(r => r.points <= totalPoints)
      .sort((a, b) => b.points - a.points)[0];

    const previousPoints = previousReward?.points || 0;
    const range = nextReward.points - previousPoints;
    const progress = totalPoints - previousPoints;
    const percentage = (progress / range) * 100;

    return {
      name: nextReward.name,
      percentage: Math.max(0, Math.min(100, percentage)),
      needed: nextReward.points - totalPoints,
    };
  };

  const nextReward = getProgressToNextReward();

  const recentEarnings = recentTransactions
    .filter(t => t.transaction_type === 'earned')
    .slice(0, 5);

  const totalEarned = recentTransactions
    .filter(t => t.transaction_type === 'earned')
    .reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-amber-100 p-2 rounded-lg">
          <Award className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Reward Points</h2>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-6xl font-bold text-amber-600">{totalPoints}</p>
          <p className="text-lg text-gray-600">points</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span className="text-gray-600">{totalEarned} earned total</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-900">Next Reward</p>
          {nextReward.needed > 0 && (
            <p className="text-sm text-amber-600 font-semibold">{nextReward.needed} points needed</p>
          )}
        </div>
        <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-600 h-full transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${nextReward.percentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">{nextReward.name}</p>
      </div>

      <div className="border-t border-gray-200 pt-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-4 h-4 text-gray-600" />
          <p className="text-sm font-semibold text-gray-900">Available Rewards</p>
        </div>
        <div className="space-y-3">
          {rewards.map((reward, index) => {
            const isUnlocked = totalPoints >= reward.points;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isUnlocked
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{reward.icon}</span>
                  <div>
                    <p className={`text-sm font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                      {reward.name}
                    </p>
                    <p className="text-xs text-gray-600">{reward.points} points</p>
                  </div>
                </div>
                {isUnlocked && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded">
                    Unlocked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {recentEarnings.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</p>
          <div className="space-y-3">
            {recentEarnings.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate flex-1 mr-3">{transaction.reason}</span>
                <span className="text-sm font-bold text-emerald-600">+{transaction.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
