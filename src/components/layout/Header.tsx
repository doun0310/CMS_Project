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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(3);

  const notifications = [
    {
      id: 'n1',
      title: '⚡ Rule Executed: Auto-Assign QA',
      text: 'CLOUD-101 was automatically assigned to QA Engineer (David Park)',
      time: '10m ago',
      issueId: 'issue-1'
    },
    {
      id: 'n2',
      title: '🤖 AI Workload Auto-Balancer',
      text: 'Rebalanced 3 story points from Alex Rivera to Maria Santos',
      time: '1h ago',
      issueId: 'issue-2'
    },
    {
      id: 'n3',
      title: '💬 New Comment on CLOUD-103',
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
          <span className="brand-badge">AI Agile Enterprise</span>
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
                <span>TEAM ACTIVITY & AI ALERTS</span>
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
    </header>
  );
};
