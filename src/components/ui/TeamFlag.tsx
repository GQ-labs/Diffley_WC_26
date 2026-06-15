import type { ComponentType } from 'react';
import * as FlagIcons from 'country-flag-icons/react/3x2';
import { FlagEngland } from '../icons/flags/FlagEngland';
import { FlagScotland } from '../icons/flags/FlagScotland';
import { getTeamIso } from '../../lib/teamIso';
import styles from './TeamFlag.module.css';

interface TeamFlagProps {
  team: string;
  className?: string;
}

const CUSTOM_FLAGS: Record<string, ComponentType<{ className?: string }>> = {
  ENG: FlagEngland,
  SCT: FlagScotland,
};

export function TeamFlag({ team, className }: TeamFlagProps) {
  const iso = getTeamIso(team);
  if (!iso) return null;

  const Flag =
    CUSTOM_FLAGS[iso] ??
    (FlagIcons as Record<string, ComponentType<{ className?: string }>>)[iso];

  if (!Flag) return null;

  return <Flag className={className ?? styles.flag} aria-hidden />;
}
