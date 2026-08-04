import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAether } from '../../context/AetherContextValue';
import { useModal } from '../../hooks/useModalContext';
import { ProjectAvatar } from '../common/ProjectAvatar';
import { TeamPresenceBar } from '../common/TeamPresenceBar';
import type { Language } from '../../i18n/translations';
import type { IssueType, Project, User } from '../../types/Aether';
import {
  IconSearch,
  IconPlus,
  IconSun,
  IconMoon,
  IconChevronDown,
  IconReset,
  IconBell,
  IconAiSpark,
  IconAnalytics,
  IconArchitecture,
  IconAutomation,
  IconCalendar,
  IconCheckCircle,
  IconLink,
  IconReports,
  IconRetro,
  IconSettings,
  IconTarget,
  IconUsers,
  IconX,
} from '../common/Icons';
import { SAVED_JQL_PRESETS } from '../../utils/jqlEngine';
import { can } from '../../utils/permissions';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    currentProject,
    setCurrentProject,
    setViewMode,
    projects,
    currentUser,
    users,
    signedInAccounts,
    switchAccount,
    removeAccount,
    signOutAllAccounts,
    searchQuery,
    setSearchQuery,
    onlyMyIssues,
    setOnlyMyIssues,
    selectedType,
    setSelectedType,
    setSelectedIssueId,
    setIsCreateModalOpen,
    resetDemoData,
    notifications,
    markNotificationsRead,
  } = useAether();

  const { openModal } = useModal();

  // -- UI dropdown states (only 5 states instead of 24) --
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [toastNotificationId, setToastNotificationId] = useState<string | null>(null);

  const projectDropdownRef = useRef<HTMLDivElement | null>(null);
  const notifDropdownRef = useRef<HTMLDivElement | null>(null);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const toolsDropdownRef = useRef<HTMLDivElement | null>(null);
  const toolsButtonRef = useRef<HTMLButtonElement | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);
  const [toolsMenuPosition, setToolsMenuPosition] = useState({ top: 0, right: 0 });

  const updateToolsMenuPosition = () => {
    const button = toolsButtonRef.current;
    if (!button) return;

    const bounds = button.getBoundingClientRect();
    setToolsMenuPosition({
      top: bounds.bottom + 8,
      right: Math.max(10, window.innerWidth - bounds.right),
    });
  };

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
      if (
        toolsDropdownRef.current
        && !toolsDropdownRef.current.contains(target)
        && !toolsMenuRef.current?.contains(target)
      ) {
        setIsToolsOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isToolsOpen) return;

    updateToolsMenuPosition();
    window.addEventListener('resize', updateToolsMenuPosition);
    window.addEventListener('scroll', updateToolsMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateToolsMenuPosition);
      window.removeEventListener('scroll', updateToolsMenuPosition, true);
    };
  }, [isToolsOpen]);

  const unreadNotifs = notifications.filter(notification => !notification.read).length;
  const latestUnreadId = notifications.find(notification => !notification.read)?.id;
  const toastNotification = notifications.find(notification => notification.id === toastNotificationId);

  useEffect(() => {
    if (!latestUnreadId) return;
    setToastNotificationId(latestUnreadId);
    const timer = window.setTimeout(() => setToastNotificationId(null), 4500);
    return () => window.clearTimeout(timer);
  }, [latestUnreadId]);

  const formatNotificationTime = (createdAt: string) => {
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
    if (elapsedMinutes < 1) return t('justNow');
    if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
    if (elapsedMinutes < 1440) return `${Math.floor(elapsedMinutes / 60)}h`;
    return `${Math.floor(elapsedMinutes / 1440)}d`;
  };

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
    { label: t('tests'), title: t('openTestsTitle'), icon: <IconCheckCircle size={16} />, onClick: () => openModal('testGenerator') },
    { label: t('customFields'), title: t('openCustomFieldsTitle'), icon: <IconSettings size={16} />, onClick: () => openModal('customField') },
    { label: t('simulator'), title: t('openSimulatorTitle'), icon: <IconAnalytics size={16} />, onClick: () => openModal('velocitySimulator') },
    { label: t('codeImpact'), title: t('openCodeImpactTitle'), icon: <IconArchitecture size={16} />, onClick: () => openModal('codeImpact') },
    { label: t('retroReport'), title: t('openRetroReportTitle'), icon: <IconRetro size={16} />, onClick: () => openModal('retroReport') },
    { label: t('ruleBuilder'), title: t('openRuleBuilderTitle'), icon: <IconAutomation size={16} />, onClick: () => openModal('automationRule') },
    { label: t('prAudit'), title: t('openPrAuditTitle'), icon: <IconCheckCircle size={16} />, onClick: () => openModal('prAudit') },
    { label: t('ptoCalendar'), title: t('openPtoCalendarTitle'), icon: <IconCalendar size={16} />, onClick: () => openModal('capacityCalendar') },
    { label: t('releaseGate'), title: t('openReleaseGateTitle'), icon: <IconTarget size={16} />, onClick: () => openModal('releaseGate') },
    { label: t('skillMatrix'), title: t('openSkillMatrixTitle'), icon: <IconUsers size={16} />, onClick: () => openModal('skillMatrix') },
    { label: t('autoTriage'), title: t('openAutoTriageTitle'), icon: <IconAiSpark size={16} />, onClick: () => openModal('issueTriage') },
    { label: t('postMortem'), title: t('openPostMortemTitle'), icon: <IconReports size={16} />, onClick: () => openModal('incidentPostMortem') },
    { label: t('techDebt'), title: t('openTechDebtTitle'), icon: <IconSettings size={16} />, onClick: () => openModal('techDebtScanner') },
    { label: t('dependencyGraph'), title: t('openDependencyGraphTitle'), icon: <IconLink size={16} />, onClick: () => openModal('dependencyGraph') },
    { label: t('monteCarlo'), title: t('openMonteCarloTitle'), icon: <IconAnalytics size={16} />, onClick: () => openModal('monteCarlo') },
    { label: t('complianceMatrix'), title: t('openComplianceMatrixTitle'), icon: <IconCheckCircle size={16} />, onClick: () => openModal('complianceMatrix') }
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
          <span className="brand-badge">Enterprise</span>
        </div>

        <div className="dropdown-container" ref={projectDropdownRef}>
          <button
            className="header-nav-btn"
            onClick={() => {
              setIsNotifOpen(false);
              setIsUserDropdownOpen(false);
              setIsToolsOpen(false);
              setIsProjectDropdownOpen(current => !current);
            }}
          >
            <ProjectAvatar avatar={currentProject.avatar} projectKey={currentProject.key} name={currentProject.name} size="sm" />
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
                    setViewMode('board');
                    setSearchQuery('');
                    setSelectedIssueId(null);
                    setIsProjectDropdownOpen(false);
                  }}
                >
                  <ProjectAvatar avatar={p.avatar} projectKey={p.key} name={p.name} size="sm" />
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
                  openModal('projectSwitch');
                }}
              >
                <IconSettings size={14} style={{ marginRight: '6px' }} />
                {t('manageWorkspaces')}
              </div>
            </div>
          )}
        </div>
        {can(currentUser, 'issue:write') && <button className="btn-create" onClick={() => setIsCreateModalOpen(true)}>
          <IconPlus size={16} />
          <span>{t('createIssue')}</span>
        </button>}
      </div>

      {/* Center: Search + Filters */}
      <div className="header-center">
        <div className="search-bar">
          <IconSearch size={16} className="search-icon" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')} aria-label={t('clearFilters')}>×</button>
          )}
        </div>

        <div className="quick-filters">
          {/* JQL Filter Presets Dropdown */}
          <select
            className="filter-select"
            style={{ fontWeight: 600, borderColor: 'var(--color-in-progress, #6366f1)' }}
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setSearchQuery(e.target.value);
              }
            }}
          >
            <option value="">{t('savedFilters')}</option>
            {SAVED_JQL_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.query}>
                {t(preset.nameKey) || preset.name}
              </option>
            ))}
          </select>

          <button className={`filter-chip ${onlyMyIssues ? 'active' : ''}`} onClick={() => setOnlyMyIssues(current => !current)}>
            {t('onlyMyIssues')}
          </button>
          <select
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as IssueType | 'all')}
          >
            <option value="all">{t('allTypes')}</option>
            <option value="feature">{typeLabels.feature}</option>
            <option value="workitem">{typeLabels.workitem}</option>
            <option value="bug">{typeLabels.bug}</option>
            <option value="initiative">{typeLabels.initiative}</option>
            <option value="subtask">{typeLabels.subtask}</option>
          </select>
          <button className="btn-standup-header" onClick={() => openModal('standup')} title={t('openStandupTitle')}>
            <span className="btn-standup-text">{t('standup')}</span>
          </button>
          <button className="btn-standup-header" onClick={() => openModal('release')} title={t('openReleaseTitle')}>
            <span className="btn-standup-text">{t('release')}</span>
          </button>
          <div className="dropdown-container" ref={toolsDropdownRef}>
            <button
              ref={toolsButtonRef}
              className="btn-tools-header"
              onClick={() => {
                setIsProjectDropdownOpen(false);
                setIsNotifOpen(false);
                setIsUserDropdownOpen(false);
                setIsToolsOpen(current => {
                  if (!current) updateToolsMenuPosition();
                  return !current;
                });
              }}
              title={t('openWorkspaceTools')}
            >
              <span className="btn-standup-text">{t('tools')}</span>
              <IconChevronDown size={14} />
            </button>
            {isToolsOpen && createPortal(
              <div
                ref={toolsMenuRef}
                className="dropdown-menu tools-dropdown tools-dropdown-portal animate-fade-in"
                style={{ top: toolsMenuPosition.top, right: toolsMenuPosition.right }}
              >
                <div className="dropdown-header">{t('workspaceTools').toUpperCase()}</div>
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
                    <span className="tool-action-icon">{action.icon}</span>
                    <span className="dropdown-title">{action.label}</span>
                  </button>
                ))}
              </div>,
              document.body,
            )}
          </div>
        </div>
      </div>

      <div className="header-right">
        <TeamPresenceBar />
        <select className="lang-select-header" value={language} onChange={event => setLanguage(event.target.value as Language)} title={t('selectLanguageTitle')}>
          <option value="ko">🇰🇷 {t('languageKo')}</option>
          <option value="en">🇺🇸 {t('languageEn')}</option>
          <option value="ja">🇯🇵 {t('languageJa')}</option>
          <option value="zh">🇨🇳 {t('languageZh')}</option>
        </select>

        <div className="dropdown-container" ref={notifDropdownRef}>
          <button
            className="header-action-icon notif-bell-btn"
            title={t('notificationCenter')}
            onClick={() => {
              setIsProjectDropdownOpen(false);
              setIsUserDropdownOpen(false);
              setIsToolsOpen(false);
              setIsNotifOpen(current => !current);
              if (unreadNotifs > 0) markNotificationsRead();
            }}
          >
            <IconBell size={18} />
            {unreadNotifs > 0 && <span className="notif-unread-badge">{unreadNotifs}</span>}
          </button>
          {isNotifOpen && (
            <div className="dropdown-menu right notif-dropdown animate-fade-in">
              <div className="dropdown-header notif-header-flex">
                <span>{t('teamActivity').toUpperCase()}</span>
                {notifications.length > 0 && <button type="button" className="notif-clear-text" onClick={markNotificationsRead}>{t('markAsRead')}</button>}
              </div>
              <div className="notif-items-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty-state">{t('noNotifications')}</div>
                ) : notifications.map(notification => (
                  <div key={notification.id} className="notif-item" onClick={() => {
                    if (notification.issueId) setSelectedIssueId(notification.issueId);
                    setIsNotifOpen(false);
                  }}>
                    <div className="notif-title-row"><span className="notif-title">{notification.title}</span><span className="notif-time">{formatNotificationTime(notification.createdAt)}</span></div>
                    <div className="notif-text">{notification.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {toastNotification && (
          <button className="live-notification-toast animate-fade-in" onClick={() => {
            if (toastNotification.issueId) setSelectedIssueId(toastNotification.issueId);
            setToastNotificationId(null);
          }}>
            <IconBell size={16} />
            <span><strong>{toastNotification.title}</strong><small>{toastNotification.text}</small></span>
          </button>
        )}

        <button className="header-action-icon" title={t('resetData')} onClick={() => {
          if (window.confirm(t('resetDemoDataConfirm'))) resetDemoData();
        }}>
          <IconReset size={18} />
        </button>
        <button className="header-action-icon" title={t('themeSetting')} onClick={toggleTheme}>
          {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>
        <div className="dropdown-container" ref={userDropdownRef}>
          <button
            className="user-profile-btn"
            onClick={() => {
              setIsProjectDropdownOpen(false);
              setIsNotifOpen(false);
              setIsToolsOpen(false);
              setIsUserDropdownOpen(current => !current);
            }}
          >
            <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-img" />
            <span className="user-name">{currentUser.name.split(' ')[0]}</span>
            <IconChevronDown size={14} />
          </button>
          {isUserDropdownOpen && (
            <div className="dropdown-menu right animate-fade-in google-account-switcher">
              <div className="account-switcher-header">
                <img src={currentUser.avatar} alt={currentUser.name} className="current-user-avatar-lg" />
                <div className="current-user-info">
                  <div className="current-user-name">{currentUser.name}</div>
                  <div className="current-user-email">{currentUser.email}</div>
                  <span className="current-user-role-badge">{currentUser.projectRole || currentUser.role || 'Project Member'}</span>
                </div>
              </div>

              <div className="dropdown-divider" />
              <div className="dropdown-header">{t('signedInAccounts').toUpperCase()} ({signedInAccounts.length})</div>

              <div className="signed-in-accounts-list">
                {signedInAccounts.map((u: User) => {
                  const isActive = u.id === currentUser.id;
                  const latestUser = users.find((user: User) => user.id === u.id) || u;
                  return (
                    <div
                      key={u.id}
                      className={`account-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        switchAccount(latestUser);
                        setIsUserDropdownOpen(false);
                      }}
                    >
                      <img src={u.avatar} alt={u.name} className="dropdown-user-avatar" />
                      <div className="account-item-details">
                        <div className="dropdown-title">
                          {u.name}
                          {isActive && <span className="active-tag">✓ {t('activeAccount')}</span>}
                        </div>
                        <div className="dropdown-sub">{u.email}</div>
                      </div>
                      {signedInAccounts.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-account"
                          title={t('signOutThisAccount')}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAccount(u.id);
                          }}
                        >
                          <IconX size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="dropdown-divider" />

              <div
                className="dropdown-item add-account-item"
                onClick={() => {
                  setIsUserDropdownOpen(false);
                  openModal('auth');
                }}
              >
                <IconPlus size={16} className="add-account-icon" />
                <span className="dropdown-title">{t('addAnotherAccount')}</span>
              </div>

              <div
                className="dropdown-item signout-all-item"
                onClick={() => {
                  setIsUserDropdownOpen(false);
                  signOutAllAccounts();
                }}
              >
                <IconX size={16} className="signout-icon" />
                <span className="dropdown-title danger-text">{t('signOutAll')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};
