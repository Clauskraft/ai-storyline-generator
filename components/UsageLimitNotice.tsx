import React from 'react';
import { pricingService } from '../services/pricingService';
import PricingTierBadge from './PricingTierBadge';

interface UsageLimitNoticeProps {
  feature: string;
  onUpgrade?: () => void;
}

const UsageLimitNotice: React.FC<UsageLimitNoticeProps> = ({ feature, onUpgrade }) => {
  const limits = pricingService.getLimits();
  const stats = pricingService.getUsageStats();

  // Check if limit reached
  const isLimitReached = stats.monthlyLimit > 0 && stats.progress >= 100;

  if (!isLimitReached) {
    return null;
  }

  return (
    <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-yellow-400 mb-2">Monthly Limit Reached</h3>
          <p className="text-gray-300 mb-3">
            You've created {stats.presentationsThisMonth} of {stats.monthlyLimit} presentations this month.
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Upgrade to create unlimited presentations and unlock advanced features.
          </p>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              Upgrade Now
            </button>
          )}
        </div>
        <div className="ml-4">
          <PricingTierBadge tier={stats.tier} />
        </div>
      </div>
    </div>
  );
};

export default UsageLimitNotice;

