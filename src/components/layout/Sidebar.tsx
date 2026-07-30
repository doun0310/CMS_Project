import React from 'react';
import { useAether } from '../../context/AetherContextValue';
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
  IconRetroBoard
} from '../common/Icons';

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { viewMode, setViewMode, currentProject, issues, sprints, retrospectiveItems, t } = useAether();

  const activeSprint = sprints.find(s => s.status === 'active');
  const activeSprintIssues = issues.filter(i => i.sprintId === activeSprint?.id);
  const backlogIssues = issues.filter(i => !i.sprintId);

  const navItems: NavItem[] = [
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
        <div className="project-icon">{currentProject.avatar}</div>
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
