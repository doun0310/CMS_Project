import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Language } from '../../i18n/translations';
import type { IssueType, Project, User } from '../../types/Aether';
import {
  IconSearch,
  IconPlus,
  IconSun,
  IconMoon,
  IconChevronDown,
  IconReset,
  IconBell
} from '../common/Icons';

import { DailyStandupModal } from '../modals/DailyStandupModal';
import { ProjectSwitchModal } from '../modals/ProjectSwitchModal';
import { ReleaseNotesModal } from '../modals/ReleaseNotesModal';
import { TestGeneratorModal } from '../modals/TestGeneratorModal';
import { CustomFieldModal } from '../modals/CustomFieldModal';
import { VelocitySimulatorModal } from '../modals/VelocitySimulatorModal';
import { CodeImpactModal } from '../modals/CodeImpactModal';
import { RetroReportModal } from '../modals/RetroReportModal';
import { AutomationRuleModal } from '../modals/AutomationRuleModal';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    currentProject,
    setCurrentProject,
    projects,
    users,
    currentUser,
    setCurrentUser,
    searchQuery,
    setSearchQuery,
    onlyMyIssues,
    setOnlyMyIssues,
    selectedType,
    setSelectedType,
    setSelectedIssueId,
    setIsCreateModalOpen,
    resetDemoData
  } = useAether();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isStandupOpen, setIsStandupOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isCustomFieldOpen, setIsCustomFieldOpen] = useState(false);
  const [isVelocityOpen, setIsVelocityOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isRetroReportOpen, setIsRetroReportOpen] = useState(false);
  const [isAutoRuleOpen, setIsAutoRuleOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(3);

  const notifications = [
    {
      id: 'n1',
      title: 'Workflow update: QA auto-assigned',
      text: 'CLOUD-101 was automatically assigned to QA Engineer (David Park)',
      time: '10m ago',
      issueId: 'issue-1'
    },
    {
      id: 'n2',
      title: 'Capacity rebalance completed',
      text: 'Rebalanced 3 story points from Alex Rivera to Maria Santos',
      time: '1h ago',
      issueId: 'issue-2'
    },
    {
      id: 'n3',
      title: 'New comment on CLOUD-103',
      text: 'David Park: "GPU WebSocket token stream integration passed latency tests!"',
      time: '3h ago',
      issueId: 'issue-3'
    }
  ];

  return (
    <header className="app-header">
      {/* Left section: Logo & App title */}
      <div className="header-left">
        <div className="brand">
          <div className="brand-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="brand-name">AetherPulse</span>
          <span className="brand-badge">Product Ops</span>
        </div>

        {/* Project Selector */}
        <div className="dropdown-container">
          <button
            className="header-nav-btn"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
          >
            <span className="proj-avatar">{currentProject.avatar}</span>
            <span className="proj-name">{currentProject.name}</span>
            <IconChevronDown size={14} />
          </button>
          {isProjectDropdownOpen && (
            <div className="dropdown-menu animate-fade-in">
              <div className="dropdown-header">SWITCH PROJECT</div>
              {projects.map((p: Project) => (
                <div
                  key={p.id}
                  className={`dropdown-item ${p.id === currentProject.id ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentProject(p);
                    setIsProjectDropdownOpen(false);
                  }}
                >
                  <span className="dropdown-avatar">{p.avatar}</span>
                  <div>
                    <div className="dropdown-title">{p.name}</div>
                    <div className="dropdown-sub">{p.key} • {p.category}</div>
                  </div>
                </div>
              ))}
              <div
                className="dropdown-item"
                style={{ borderTop: '1px solid var(--border-color)', color: 'var(--color-in-progress, #6366f1)', fontWeight: 700 }}
                onClick={() => {
                  setIsProjectDropdownOpen(false);
                  setIsProjectModalOpen(true);
                }}
              >
                Manage workspaces...
              </div>
            </div>
          )}
        </div>

        {/* Quick Create Button */}
        <button className="btn-create" onClick={() => setIsCreateModalOpen(true)}>
          <IconPlus size={16} />
          <span>{t('createIssue')}</span>
        </button>
      </div>

      {/* Center: Search Bar & Filters */}
      <div className="header-center">
        <div className="search-bar">
          <IconSearch size={16} className="search-icon" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        {/* Filters */}
        <div className="quick-filters">
          <button
            className={`filter-chip ${onlyMyIssues ? 'active' : ''}`}
            onClick={() => setOnlyMyIssues(!onlyMyIssues)}
          >
            {t('onlyMyIssues')}
          </button>
          <select
            className="filter-select"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as IssueType | 'all')}
          >
            <option value="all">{t('allTypes')}</option>
            <option value="feature">Feature</option>
            <option value="workitem">WorkItem</option>
            <option value="bug">Bug</option>
            <option value="initiative">Initiative</option>
            <option value="subtask">SubTask</option>
          </select>
          <button
            className="btn-standup-header"
            onClick={() => setIsStandupOpen(true)}
            title="Open AI Daily Standup Digest"
          >
            <span className="btn-standup-text">Standup</span>
          </button>
          <button
            className="btn-standup-header"
            onClick={() => setIsReleaseOpen(true)}
            title="Open AI Release Notes Generator"
          >
            <span className="btn-standup-text">Release</span>
          </button>
          <button
            className="btn-standup-header"
            onClick={() => setIsTestOpen(true)}
            title="Open AI Test & AC Workbench"
          >
            <span className="btn-standup-text">Tests</span>
          </button>
          <button
            className="btn-standup-header"
            onClick={() => setIsCustomFieldOpen(true)}
            title="Open Custom Fields & Enterprise Schema Workbench"
          >
            <span className="btn-standup-text">Custom Fields</span>
          </button>
          <button
            className="btn-standup-header"
            onClick={() => setIsVelocityOpen(true)}
            title="Open Sprint Velocity & What-If Capacity Simulator"
          >
            <span className="btn-standup-text">Simulator</span>
          </button>
          <button
            className="btn-standup-header"
            onClick={() => setIsImpactOpen(true)}
            title="Open AI Code Impact & Architecture Visualizer"
          >
            <span className="btn-standup-text">Code Impact</span>
          </button>
          <button
            className="btn-standup-header"
            onClick={() => setIsRetroReportOpen(true)}
            title="Open Sprint Retrospective AI Executive Report & Exporter"
          >
            <span className="btn-standup-text">Retro Report</span>
          </button>
          <button
            className="btn-standup-header"
            onClick={() => setIsAutoRuleOpen(true)}
            title="Open Visual Automation Rule Builder & Webhook Simulator"
          >
            <span className="btn-standup-text">Rule Builder</span>
          </button>
        </div>
      </div>

      {/* Right Section: Language Switcher, Theme Toggle, User Switcher, Demo Reset */}
      <div className="header-right">

        {/* Language Selector */}
        <select
          className="lang-select-header"
          value={language}
          onChange={e => setLanguage(e.target.value as Language)}
          title="Select Language"
        >
          <option value="ko">🇰🇷 한국어</option>
          <option value="en">🇺🇸 English</option>
          <option value="ja">🇯🇵 日本語</option>
          <option value="zh">🇨🇳 中文</option>
        </select>

        {/* Notification Center */}
        <div className="dropdown-container">
          <button
            className="header-action-icon notif-bell-btn"
            title="Notification Center"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (unreadNotifs > 0) setUnreadNotifs(0);
            }}
          >
            <IconBell size={18} />
            {unreadNotifs > 0 && <span className="notif-unread-badge">{unreadNotifs}</span>}
          </button>

          {isNotifOpen && (
            <div className="dropdown-menu right notif-dropdown animate-fade-in">
              <div className="dropdown-header notif-header-flex">
                <span>TEAM ACTIVITY</span>
                <span className="notif-clear-text" onClick={() => setUnreadNotifs(0)}>Mark as read</span>
              </div>
              <div className="notif-items-list">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className="notif-item"
                    onClick={() => {
                      if (n.issueId) setSelectedIssueId(n.issueId);
                      setIsNotifOpen(false);
                    }}
                  >
                    <div className="notif-title-row">
                      <span className="notif-title">{n.title}</span>
                      <span className="notif-time">{n.time}</span>
                    </div>
                    <div className="notif-text">{n.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className="header-action-icon"
          title="Reset Demo Data"
          onClick={() => {
            if (window.confirm('Reset sample issues and sprints to original default demo data?')) {
              resetDemoData();
            }
          }}
        >
          <IconReset size={18} />
        </button>

        <button className="header-action-icon" title="Toggle Theme" onClick={toggleTheme}>
          {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>

        {/* User profile dropdown */}
        <div className="dropdown-container">
          <button
            className="user-profile-btn"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          >
            <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-img" />
            <span className="user-name">{currentUser.name.split(' ')[0]}</span>
            <IconChevronDown size={14} />
          </button>
          {isUserDropdownOpen && (
            <div className="dropdown-menu right animate-fade-in">
              <div className="dropdown-header">SWITCH CURRENT USER</div>
              {users.map((u: User) => (
                <div
                  key={u.id}
                  className={`dropdown-item ${u.id === currentUser.id ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentUser(u);
                    setIsUserDropdownOpen(false);
                  }}
                >
                  <img src={u.avatar} alt={u.name} className="dropdown-user-avatar" />
                  <div>
                    <div className="dropdown-title">{u.name}</div>
                    <div className="dropdown-sub">{u.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Daily Standup Digest Modal */}
      <DailyStandupModal
        isOpen={isStandupOpen}
        onClose={() => setIsStandupOpen(false)}
      />

      {/* Enterprise Project Switcher Modal */}
      <ProjectSwitchModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      {/* AI Release Notes Generator Modal */}
      <ReleaseNotesModal
        isOpen={isReleaseOpen}
        onClose={() => setIsReleaseOpen(false)}
      />

      {/* AI Acceptance Criteria & Test Workbench Modal */}
      <TestGeneratorModal
        isOpen={isTestOpen}
        onClose={() => setIsTestOpen(false)}
      />

      {/* Custom Fields & Enterprise Schema Workbench Modal */}
      <CustomFieldModal
        isOpen={isCustomFieldOpen}
        onClose={() => setIsCustomFieldOpen(false)}
      />

      {/* Sprint Velocity & What-If Capacity Simulator Modal */}
      <VelocitySimulatorModal
        isOpen={isVelocityOpen}
        onClose={() => setIsVelocityOpen(false)}
      />

      {/* AI Code Impact & Architecture Visualizer Modal */}
      <CodeImpactModal
        isOpen={isImpactOpen}
        onClose={() => setIsImpactOpen(false)}
      />

      {/* Sprint Retrospective AI Executive Report & Exporter Modal */}
      <RetroReportModal
        isOpen={isRetroReportOpen}
        onClose={() => setIsRetroReportOpen(false)}
      />

      {/* Visual Automation Rule Builder & Webhook Simulator Modal */}
      <AutomationRuleModal
        isOpen={isAutoRuleOpen}
        onClose={() => setIsAutoRuleOpen(false)}
      />
    </header>
  );
};
