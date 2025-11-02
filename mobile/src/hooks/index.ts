/**
 * Custom Hooks Index
 *
 * Re-export all custom hooks
 */

export { useWallet } from './useWallet';
export { useCircles } from './useCircles';

// Re-export context hooks for convenience
export { useSolana } from '../contexts/SolanaContext';
export { usePrivacy, PrivacyMode } from '../contexts/PrivacyContext';
export { useYield, ReflectTokenType } from '../contexts/YieldContext';
export type { YieldSource, YieldBreakdown, StakedPosition, YieldStrategy } from '../contexts/YieldContext';
