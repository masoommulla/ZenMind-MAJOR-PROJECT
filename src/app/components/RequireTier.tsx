import React from 'react';
import { usePlan } from '../hooks/usePlan';
import { Lock } from 'lucide-react';

interface RequireTierProps {
  userTier: string;
  minTier: 'free' | 'silver' | 'gold' | 'platinum';
  children: React.ReactNode;
  fallbackMessage?: string;
  onUpgradeClick?: () => void;
}

export default function RequireTier({ userTier, minTier, children, fallbackMessage, onUpgradeClick }: RequireTierProps) {
  const { hasAccess } = usePlan(userTier);

  if (hasAccess(minTier)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#f0fbf4] dark:bg-[#0d1f14] rounded-2xl border border-[#0d5d3a]/10 dark:border-[#1a8a5a]/20 m-4">
      <div className="w-16 h-16 rounded-full bg-[#0d5d3a]/10 dark:bg-[#1a8a5a]/20 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-[#0d5d3a] dark:text-[#10b981]" />
      </div>
      <h3 className="text-xl font-bold text-[#0a2617] dark:text-gray-100 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        Premium Feature
      </h3>
      <p className="text-[#4a7c5d] dark:text-gray-400 max-w-md mb-6">
        {fallbackMessage || `You need the ${minTier.charAt(0).toUpperCase() + minTier.slice(1)} plan to access this feature.`}
      </p>
      <button 
        onClick={onUpgradeClick}
        className="px-6 py-3 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-semibold shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition-colors"
      >
        Upgrade to {minTier.charAt(0).toUpperCase() + minTier.slice(1)}
      </button>
    </div>
  );
}
