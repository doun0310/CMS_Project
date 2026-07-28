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
  IconSettings
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
      id: 'board',
      label: t('board'),
      icon: <IconBoard size={18} />,
      badge: `${activeSprintIssues.length}`
    },
    {
      id: 'backlog',
      label: t('backlog'),
      icon: <IconBacklog size={18} />,
      badge: `${backlogIssues.length}`
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
      label: 'Architecture',
      icon: <span>📐</span>,
      badge: '6'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: <span>💼</span>,
      badge: '4'
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <IconSettings size={18} />
    }
  ];

  return (
    <aside className="app-sidebar">
      {/* Sidebar Top Project Card */}
      <div className="sidebar-project-card">
        <div className="project-icon">{currentProject.avatar}</div>
        <div className="project-info">
          <div className="project-title">{currentProject.name}</div>
          <div className="project-type">Software Project (Agile)</div>
        </div>
      </div>

      <div className="sidebar-section-header">WORKSPACE</div>

      {/* Navigation list */}
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

      {/* Active Sprint Summary Widget */}
      {activeSprint && (
        <div className="sidebar-sprint-widget">
          <div className="widget-header">
            <span className="pulse-dot"></span>
            <span className="widget-title">CURRENT SPRINT</span>
          </div>
          <div className="sprint-name">{activeSprint.name}</div>
          <div className="sprint-dates">
            {activeSprint.startDate} ~ {activeSprint.endDate}
          </div>
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
            <span>
              Done:{' '}
              {activeSprintIssues.filter(i => i.status === 'done').length}/
              {activeSprintIssues.length}
            </span>
            <span>
              {activeSprintIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0)}{' '}
              pts
            </span>
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="atlassian-credit">
          Built around <strong>AetherPulse</strong>
        </div>
      </div>
    </aside>
  );
};
