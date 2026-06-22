import draft from '../data/draft.json';
import overrides from '../data/overrides.json';
import scoring from '../data/scoring.json';
import type { OverridesConfig } from './lib/overrides';
import type { DraftConfig, ScoringConfig } from './types/config';

export const draftConfig = draft as DraftConfig;
export const scoringConfig = scoring as ScoringConfig;
export const overridesConfig = overrides as OverridesConfig;

export const RESULTS_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
