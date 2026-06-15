import { useCallback, useEffect, useState } from 'react';

import type { AppTab } from './types/config';

import styles from './App.module.css';

import { draftConfig } from './config';

import { TournamentProvider, useTournament } from './context/TournamentContext';

import { IconTrophy } from './components/icons/IconTrophy';

import {

  TabNav,

  tabButtonId,

  tabPanelId,

} from './components/layout/TabNav';

import { Button } from './components/ui/Button';

import { LeaderboardTab } from './components/tabs/LeaderboardTab';

import { TeamsTab } from './components/tabs/TeamsTab';

import { FixturesTab } from './components/tabs/FixturesTab';

import { RulesTab } from './components/tabs/RulesTab';

import { CacheBanner } from './components/ui/CacheBanner';



function tabFromHash(): AppTab {

  const hash = window.location.hash.replace('#', '');

  if (hash === 'teams' || hash === 'fixtures' || hash === 'rules') return hash;

  return 'leaderboard';

}



function playerFromSearch(): string {

  return new URLSearchParams(window.location.search).get('player') ?? '';

}



function formatUpdated(date: Date | null): string {

  if (!date) return 'Not loaded yet';

  return date.toLocaleString(undefined, {

    dateStyle: 'medium',

    timeStyle: 'short',

  });

}



function AppShell() {

  const [activeTab, setActiveTab] = useState<AppTab>(tabFromHash);

  const [playerFilter, setPlayerFilter] = useState(playerFromSearch);

  const {

    lastUpdated,

    playedCount,

    refreshing,

    refresh,

    loading,

    warning,

    dataSource,

    overrideCount,

  } = useTournament();



  const playerCount = draftConfig.players.length;

  const teamCount = new Set(draftConfig.players.flatMap((p) => p.teams)).size;



  const changeTab = useCallback((tab: AppTab) => {

    setActiveTab(tab);

    const url = new URL(window.location.href);

    if (tab === 'leaderboard') {

      window.history.replaceState({}, '', `${url.pathname}${url.search}`);

    } else {

      window.history.replaceState({}, '', `${url.pathname}${url.search}#${tab}`);

    }

  }, []);



  const changePlayerFilter = useCallback((id: string) => {

    setPlayerFilter(id);

    const url = new URL(window.location.href);

    if (id) url.searchParams.set('player', id);

    else url.searchParams.delete('player');

    window.history.replaceState({}, '', url);

  }, []);



  useEffect(() => {

    const onHashChange = () => setActiveTab(tabFromHash());

    window.addEventListener('hashchange', onHashChange);

    return () => window.removeEventListener('hashchange', onHashChange);

  }, []);



  return (

    <div className={styles.app}>

      <a className={styles.skipLink} href="#main-content">

        Skip to content

      </a>



      <header className={styles.header}>

        <div className={styles.headerInner}>

          <div className={styles.brand}>

            <IconTrophy className={styles.brandIcon} aria-hidden />

            <div>

              <p className={styles.eyebrow}>Diffley Lab</p>

              <h1 className={styles.title}>World Cup 2026</h1>

            </div>

          </div>

          <div className={styles.headerActions}>

            <p className={styles.updated}>

              {loading && dataSource === 'none'

                ? 'Loading…'

                : `${playedCount} matches played · Updated ${formatUpdated(lastUpdated)}${

                    dataSource === 'cache' && !warning ? ' (cached)' : ''

                  }${overrideCount > 0 ? ` · ${overrideCount} override(s)` : ''}`}

            </p>

            <Button

              icon

              spinning={refreshing}

              onClick={() => void refresh()}

              disabled={loading || refreshing}

              aria-label={refreshing ? 'Refreshing results' : 'Refresh results'}

            >

              {refreshing ? 'Refreshing…' : 'Refresh'}

            </Button>

          </div>

        </div>

      </header>



      <TabNav active={activeTab} onChange={changeTab} />



      <main id="main-content" className={styles.main} tabIndex={-1}>

        {warning && <CacheBanner message={warning} />}



        <div

          role="tabpanel"

          id={tabPanelId('leaderboard')}

          aria-labelledby={tabButtonId('leaderboard')}

          hidden={activeTab !== 'leaderboard'}

          inert={activeTab !== 'leaderboard' ? true : undefined}

        >

          <LeaderboardTab

            playerFilter={playerFilter}

            onPlayerFilterChange={changePlayerFilter}

          />

        </div>



        <div

          role="tabpanel"

          id={tabPanelId('teams')}

          aria-labelledby={tabButtonId('teams')}

          hidden={activeTab !== 'teams'}

          inert={activeTab !== 'teams' ? true : undefined}

        >

          <TeamsTab />

        </div>



        <div

          role="tabpanel"

          id={tabPanelId('fixtures')}

          aria-labelledby={tabButtonId('fixtures')}

          hidden={activeTab !== 'fixtures'}

          inert={activeTab !== 'fixtures' ? true : undefined}

        >

          <FixturesTab />

        </div>



        <div

          role="tabpanel"

          id={tabPanelId('rules')}

          aria-labelledby={tabButtonId('rules')}

          hidden={activeTab !== 'rules'}

          inert={activeTab !== 'rules' ? true : undefined}

        >

          <RulesTab />

        </div>

      </main>



      <footer className={styles.footer}>

        <p>

          {playerCount} players · {teamCount} teams · Points tracker

        </p>

      </footer>

    </div>

  );

}



export default function App() {

  return (

    <TournamentProvider>

      <AppShell />

    </TournamentProvider>

  );

}

