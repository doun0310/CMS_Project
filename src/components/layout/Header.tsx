import React, { useEffect, useRef, useState } from 'react';
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
import { PrAuditModal } from '../modals/PrAuditModal';
import { CapacityCalendarModal } from '../modals/CapacityCalendarModal';
import { ReleaseGateModal } from '../modals/ReleaseGateModal';
import { SkillMatrixModal } from '../modals/SkillMatrixModal';
import { IssueTriageModal } from '../modals/IssueTriageModal';

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
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isStandupOpen, setIsStandupOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isCustomFieldOpen, setIsCustomFieldOpen] = useState(false);
  const [isVelocityOpen, setIsVelocityOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isRetroReportOpen, setIsRetroReportOpen] = useState(false);
  const [isAutoRuleOpen, setIsAutoRuleOpen] = useState(false);
  const [isPrAuditOpen, setIsPrAuditOpen] = useState(false);
  const [isCapacityOpen, setIsCapacityOpen] = useState(false);
  const [isReleaseGateOpen, setIsReleaseGateOpen] = useState(false);
  const [isSkillMatrixOpen, setIsSkillMatrixOpen] = useState(false);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(3);
  const projectDropdownRef = useRef<HTMLDivElement | null>(null);
  const notifDropdownRef = useRef<HTMLDivElement | null>(null);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const toolsDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (projectDropdownRef.current && !projectDropdownRef.current.contains(target)) {
        setIsProjectDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setIsUserDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(target)) {
        setIsToolsOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

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

  const typeLabels: Record<IssueType, string> = {
    feature: t('typeFeature'),
    story: t('typeFeature'),
    workitem: t('typeWorkItem'),
    task: t('typeWorkItem'),
    bug: t('typeBug'),
    initiative: t('typeInitiative'),
    epic: t('typeInitiative'),
    subtask: t('typeSubtask')
  };

  const toolActions = [
    { label: t('tests'), title: t('openTestsTitle'), onClick: () => setIsTestOpen(true) },
    { label: t('customFields'), title: t('openCustomFieldsTitle'), onClick: () => setIsCustomFieldOpen(true) },
    { label: t('simulator'), title: t('openSimulatorTitle'), onClick: () => setIsVelocityOpen(true) },
    { label: t('codeImpact'), title: t('openCodeImpactTitle'), onClick: () => setIsImpactOpen(true) },
    { label: t('retroReport'), title: t('openRetroReportTitle'), onClick: () => setIsRetroReportOpen(true) },
    { label: t('ruleBuilder'), title: t('openRuleBuilderTitle'), onClick: () => setIsAutoRuleOpen(true) },
    { label: t('prAudit'), title: t('openPrAuditTitle'), onClick: () => setIsPrAuditOpen(true) },
    { label: 'PTO Calendar', title: 'Open Sprint Team Capacity & Holiday Calendar Integrator', onClick: () => setIsCapacityOpen(true) },
    { label: 'Release Gate', title: 'Open Enterprise Release Go / No-Go Decision Gate', onClick: () => setIsReleaseGateOpen(true) },
    { label: 'Skill Matrix', title: 'Open AI Cross-Team Skill Matrix & Resource Load Balancer', onClick: () => setIsSkillMatrixOpen(true) },
    { label: 'Auto Triage', title: 'Open AI Smart Issue Auto-Triage & Label Recommendation Assistant', onClick: () => setIsTriageOpen(true) }
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
        <div className="dropdown-container" ref={projectDropdownRef}>
          <button
            className="header-nav-btn"
            onClick={() => {
              setIsNotifOpen(false);
              setIsUserDropdownOpen(false);
              setIsToolsOpen(false);
              setIsProjectDropdownOpen(prev => !prev);
            }}
          >
            <span className="proj-avatar">{currentProject.avatar}</span>
            <span className="proj-name">{currentProject.name}</span>
            <IconChevronDown size={14} />
          </button>
          {isProjectDropdownOpen && (
            <div className="dropdown-menu animate-fade-in">
              <div className="dropdown-header">{t('switchProject').toUpperCase()}</div>
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
                {t('manageWorkspaces')}
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
            <option value="feature">{typeLabels.feature}</option>
            <option value="workitem">{typeLabels.workitem}</option>
            <option value="bug">{typeLabels.bug}</option>
            <option value="initiative">{typeLabels.initiative}</option>
            <option value="subtask">{typeLabels.subtask}</option>
          </select>
          <button
            className="btn-standup-header"
            onClick={() => setIsStandupOpen(true)}
            title={t('openStandupTitle')}
          >
            <span className="btn-standup-text">{t('standup')}</span>
          </button>
          <button
            className="btn-standup-header"
            onClick={() => setIsReleaseOpen(true)}
            title={t('openReleaseTitle')}
          >
            <span className="btn-standup-text">{t('release')}</span>
          </button>
          <div className="dropdown-container" ref={toolsDropdownRef}>
            <button
              className="btn-tools-header"
              onClick={() => {
                setIsProjectDropdownOpen(false);
                setIsNotifOpen(false);
                setIsUserDropdownOpen(false);
                setIsToolsOpen(prev => !prev);
              }}
              title="Open workspace tools"
            >
              <span className="btn-standup-text">Tools</span>
              <IconChevronDown size={14} />
            </button>
            {isToolsOpen && (
              <div className="dropdown-menu tools-dropdown right animate-fade-in">
                <div className="dropdown-header">WORKSPACE TOOLS</div>
                {toolActions.map(action => (
                  <button
                    key={action.label}
                    className="dropdown-item dropdown-action"
                    title={action.title}
                    onClick={() => {
                      action.onClick();
                      setIsToolsOpen(false);
                    }}
                  >
                    <span className="dropdown-title">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Language Switcher, Theme Toggle, User Switcher, Demo Reset */}
      <div className="header-right">

        {/* Language Selector */}
        <select
          className="lang-select-header"
          value={language}
          onChange={e => setLanguage(e.target.value as Language)}
          title={t('selectLanguageTitle')}
        >
          <option value="ko">🇰🇷 {t('languageKo')}</option>
          <option value="en">🇺🇸 {t('languageEn')}</option>
          <option value="ja">🇯🇵 {t('languageJa')}</option>
          <option value="zh">🇨🇳 {t('languageZh')}</option>
        </select>

        {/* Notification Center */}
        <div className="dropdown-container" ref={notifDropdownRef}>
          <button
            className="header-action-icon notif-bell-btn"
            title={t('notificationCenter')}
            onClick={() => {
              setIsProjectDropdownOpen(false);
              setIsUserDropdownOpen(false);
              setIsToolsOpen(false);
              setIsNotifOpen(prev => !prev);
              if (unreadNotifs > 0) setUnreadNotifs(0);
            }}
          >
            <IconBell size={18} />
            {unreadNotifs > 0 && <span className="notif-unread-badge">{unreadNotifs}</span>}
          </button>

          {isNotifOpen && (
            <div className="dropdown-menu right notif-dropdown animate-fade-in">
              <div className="dropdown-header notif-header-flex">
                <span>{t('teamActivity').toUpperCase()}</span>
                <span className="notif-clear-text" onClick={() => setUnreadNotifs(0)}>{t('markAsRead')}</span>
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
          title={t('resetData')}
          onClick={() => {
            if (window.confirm(t('resetDemoDataConfirm'))) {
              resetDemoData();
            }
          }}
        >
          <IconReset size={18} />
        </button>

        <button className="header-action-icon" title={t('themeSetting')} onClick={toggleTheme}>
          {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>

        {/* User profile dropdown */}
        <div className="dropdown-container" ref={userDropdownRef}>
          <button
            className="user-profile-btn"
            onClick={() => {
              setIsProjectDropdownOpen(false);
              setIsNotifOpen(false);
              setIsToolsOpen(false);
              setIsUserDropdownOpen(prev => !prev);
            }}
          >
            <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-img" />
            <span className="user-name">{currentUser.name.split(' ')[0]}</span>
            <IconChevronDown size={14} />
          </button>
          {isUserDropdownOpen && (
            <div className="dropdown-menu right animate-fade-in">
              <div className="dropdown-header">{t('switchCurrentUser').toUpperCase()}</div>
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

      {/* AI Pull Request Quality & Security Gate Audit Modal */}
      <PrAuditModal
        isOpen={isPrAuditOpen}
        onClose={() => setIsPrAuditOpen(false)}
      />

      {/* Sprint Team Capacity & Holiday Calendar Integrator Modal */}
      <CapacityCalendarModal
        isOpen={isCapacityOpen}
        onClose={() => setIsCapacityOpen(false)}
      />

      {/* Enterprise Release Go / No-Go Decision Gate Modal */}
      <ReleaseGateModal
        isOpen={isReleaseGateOpen}
        onClose={() => setIsReleaseGateOpen(false)}
      />

      {/* AI Cross-Team Skill Matrix & Resource Load Balancer Modal */}
      <SkillMatrixModal
        isOpen={isSkillMatrixOpen}
        onClose={() => setIsSkillMatrixOpen(false)}
      />

      {/* AI Smart Issue Auto-Triage & Label Recommendation Assistant Modal */}
      <IssueTriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
      />
    </header>
  );
};
