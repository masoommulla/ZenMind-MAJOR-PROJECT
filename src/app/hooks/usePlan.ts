import { useMemo } from 'react';

const TIER_ORDER = ['free', 'silver', 'gold', 'platinum'];

export function usePlan(userTier: string = 'free') {
  return useMemo(() => {
    return {
      tier: userTier,
      hasAccess: (minTier: string) => {
        const userLevel = TIER_ORDER.indexOf(userTier);
        const minLevel = TIER_ORDER.indexOf(minTier);
        return userLevel >= minLevel;
      }
    };
  }, [userTier]);
}
