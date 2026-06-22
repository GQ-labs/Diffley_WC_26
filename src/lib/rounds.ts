import type { KnockoutMilestoneKey } from './types/match';

const KNOCKOUT_ROUND_MAP: Record<string, KnockoutMilestoneKey> = {
  'round of 32': 'roundOf32',
  'round of 16': 'roundOf16',
  'quarter-final': 'quarterFinal',
  'quarter-finals': 'quarterFinal',
  'semi-final': 'semiFinal',
  'semi-finals': 'semiFinal',
  final: 'final',
};

export function classifyRound(roundLabel: string, hasGroup: boolean) {
  const normalized = roundLabel.trim().toLowerCase();

  if (normalized.includes('third place')) {
    return {
      stage: 'thirdPlace' as const,
      knockoutRound: 'semiFinal' as KnockoutMilestoneKey,
    };
  }

  const knockoutRound = KNOCKOUT_ROUND_MAP[normalized] ?? null;
  if (knockoutRound) {
    return { stage: 'knockout' as const, knockoutRound };
  }

  if (hasGroup || normalized.startsWith('matchday')) {
    return { stage: 'group' as const, knockoutRound: null };
  }

  return { stage: 'group' as const, knockoutRound: null };
}

export function knockoutRoundOrder(key: KnockoutMilestoneKey): number {
  const order: Record<KnockoutMilestoneKey, number> = {
    groupExit: 0,
    roundOf32: 1,
    roundOf16: 2,
    quarterFinal: 3,
    semiFinal: 4,
    final: 5,
    winner: 6,
  };
  return order[key];
}

export function isKnockoutStage(
  stage: 'group' | 'knockout' | 'thirdPlace',
): boolean {
  return stage === 'knockout' || stage === 'thirdPlace';
}
