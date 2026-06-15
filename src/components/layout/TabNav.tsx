import type { KeyboardEvent, ReactNode } from 'react';
import type { AppTab } from '../../types/config';
import { TABS } from './tabs';
import styles from './TabNav.module.css';

interface TabNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

export function tabPanelId(tab: AppTab): string {
  return `panel-${tab}`;
}

export function tabButtonId(tab: AppTab): string {
  return `tab-${tab}`;
}

export function TabNav({ active, onChange }: TabNavProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((tab) => tab.id === active);
    if (index < 0) return;

    let next = index;
    if (event.key === 'ArrowRight') {
      next = (index + 1) % TABS.length;
    } else if (event.key === 'ArrowLeft') {
      next = (index - 1 + TABS.length) % TABS.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = TABS.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const tab = TABS[next];
    onChange(tab.id);
    document.getElementById(tabButtonId(tab.id))?.focus();
  };

  return (
    <nav className={styles.nav} aria-label="Sections">
      <div className={styles.inner} role="tablist" onKeyDown={handleKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={tabButtonId(tab.id)}
            type="button"
            role="tab"
            className={styles.tab}
            data-active={active === tab.id || undefined}
            aria-selected={active === tab.id}
            aria-controls={tabPanelId(tab.id)}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

interface PageHeaderProps {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ id, title, description, action }: PageHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h2 id={id} className={styles.pageTitle} tabIndex={-1}>
          {title}
        </h2>
        {description && <p className={styles.pageDesc}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
