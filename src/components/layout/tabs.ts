import type { AppTab } from '../../types/config';

export const TABS: { id: AppTab; label: string }[] = [
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'groups', label: 'Groups' },
  { id: 'knockout', label: 'Knockout stage' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'rules', label: 'Rules' },
];
