import React from 'react';
import { useAether } from '../../context/AetherContextValue';
import { useSubscription } from '../../context/SubscriptionContext';
import { ProjectAvatar } from '../common/ProjectAvatar';
import type { ViewMode } from '../../types/Aether';
import {
  IconBoard,
  IconBacklog,
  IconTimeline,
  IconReports,
  IconAutomation,
  IconRetro,
  IconSettings,
  IconMyWork,
  IconArchitecture,
  IconPortfolio,
  IconRetroBoard,
  IconCalendar,
  IconBudget,
  IconDailySummary
} from '../common/Icons';

// Simple credit card icon for pricing
const IconPricing: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="3" fill="currentColor" fillOpacity="0.1" />
    <path d="M1 10h22" />
  </svg>
);

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { viewMode, setViewMode, currentProject, issues, sprints, retrospectiveItems, t } = useAether();
  const { planId, isFree } = useSubscription();

  const activeSprint = sprints.find(s => s.status === 'active');
  const activeSprintIssues = issues.filter(i => i.sprintId === activeSprint?.id);
  const backlogIssues = issues.filter(i => !i.sprintId);

  const navItems: NavItem[] = [
    {
      id: 'pricing',
      label: t('pricing'),
      icon: <IconPricing size={18} />,
      badge: isFree ? 'FREE' : planId.toUpperCase(),
    },
    {
      id: 'budget',
      label: '예산 & 소요금액',
      icon: <IconBudget size={18} />,
      badge: 'PRO'
    },
    {
      id: 'capacity',
      label: '휴가 & 가동인원',
      icon: <IconCalendar size={18} />,
      badge: 'NEW'
    },
    {
      id: 'daily-summary',
      label: '오늘의 개발 요약',
      icon: <IconDailySummary size={18} />,
      badge: 'AI'
    },
    {
      id: 'my-work',
      label: t('myWork'),
      icon: <IconMyWork size={18} />
    },
    {
      id: 'backlog',
      label: t('backlog'),
      icon: <IconBacklog size={18} />,
      badge: `${backlogIssues.length}`
    },
    {
      id: 'board',
      label: t('board'),
      icon: <IconBoard size={18} />,
      badge: `${activeSprintIssues.length}`
    },
    {
      id: 'roadmap',
      label: t('roadmap'),
      icon: <IconTimeline size={18} />
    },
    {
      id: 'reports',
      label: t('reports'),
      icon: <IconReports size={18} />
    },
    {
      id: 'automation',
      label: t('automation'),
      icon: <IconAutomation size={18} />
    },
    {
      id: 'retrospective',
      label: t('retrospective'),
      icon: <IconRetro size={18} />,
      badge: `${retrospectiveItems.length}`
    },
    {
      id: 'architecture',
      label: t('architecture'),
      icon: <IconArchitecture size={18} />,
    },
    {
      id: 'portfolio',
      label: t('portfolio'),
      icon: <IconPortfolio size={18} />,
    },
    {
      id: 'retro-kanban',
      label: t('retroKanban'),
      icon: <IconRetroBoard size={18} />,
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <IconSettings size={18} />
    }
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-project-card">
        <ProjectAvatar avatar={currentProject.avatar} projectKey={currentProject.key} name={currentProject.name} size="md" />
        <div className="project-info">
          <div className="project-title">{currentProject.name}</div>
          <div className="project-type">{currentProject.key}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-link ${viewMode === item.id ? 'active' : ''}`}
            onClick={() => setViewMode(item.id)}
            title={item.label}
            aria-label={item.label}
          >
            <span className="link-icon">{item.icon}</span>
            <span className="link-text">{item.label}</span>
            {item.badge !== undefined && (
              <span className="link-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {activeSprint && (
        <div className="sidebar-sprint-widget">
          <div className="widget-header">
            <span className="pulse-dot"></span>
            <span className="widget-title">{t('activeSprint')}</span>
          </div>
          <div className="sprint-name">{activeSprint.name}</div>
          <div className="sprint-progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  activeSprintIssues.length > 0
                    ? Math.round(
                        (activeSprintIssues.filter(i => i.status === 'done').length /
                          activeSprintIssues.length) *
                          100
                      )
                    : 0
                }%`
              }}
            ></div>
          </div>
          <div className="sprint-stats">
            <span>{activeSprintIssues.filter(i => i.status === 'done').length}/{activeSprintIssues.length} {t('done')}</span>
            <span>{activeSprintIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0)} {t('pointsShort')}</span>
          </div>
        </div>
      )}
    </aside>
  );
};
