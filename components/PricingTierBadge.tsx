import React from 'react';

interface PricingTierBadgeProps {
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
}

const PricingTierBadge: React.FC<PricingTierBadgeProps> = ({ tier, size = 'md' }) => {
  const getTierConfig = () => {
    switch (tier) {
      case 'free':
        return {
          label: 'Free',
          color: 'bg-gray-700 text-gray-100',
          borderColor: 'border-gray-600',
        };
      case 'pro':
        return {
          label: 'Pro',
          color: 'bg-blue-600 text-white',
          borderColor: 'border-blue-500',
        };
      case 'business':
        return {
          label: 'Business',
          color: 'bg-purple-600 text-white',
          borderColor: 'border-purple-500',
        };
      case 'enterprise':
        return {
          label: 'Enterprise',
          color: 'bg-orange-600 text-white',
          borderColor: 'border-orange-500',
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-500 text-white',
          borderColor: 'border-gray-400',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-lg px-4 py-2';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  const config = getTierConfig();

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border-2 ${config.color} ${config.borderColor} ${getSizeClasses()}`}
    >
      {config.label}
    </span>
  );
};

export default PricingTierBadge;

