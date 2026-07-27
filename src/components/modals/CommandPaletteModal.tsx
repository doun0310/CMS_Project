import React, { useState, useEffect } from 'react';
import { useAether } from '../../context/AetherContext';
import type { ViewMode } from '../../types/Aether';
import { IconSearch, IconZap, IconPlus, IconX } from '../common/Icons';

export const CommandPaletteModal: React.FC = () => {
  const {
    issues,
    setViewMode,
    setSelectedIssueId,
    setIsCreateModalOpen,
    resetDemoData
  } = useAether();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const views: { mode: ViewMode; label: string; icon: string }[] = [
    { mode: 'board', label: 'Go to Kanban Board', icon: '📋' },
    { mode: 'backlog', label: 'Go to Backlog & Sprints', icon: '📑' },
    { mode: 'roadmap', label: 'Go to Timeline Roadmap', icon: '🗺️' },
    { mode: 'reports', label: 'Go to Velocity & Analytics Reports', icon: '📊' },
    { mode: 'automation', label: 'Go to Visual Automation Engine', icon: '⚡' },
    { mode: 'retrospective', label: 'Go to Sprint Retrospective', icon: '🔄' },
    { mode: 'settings', label: 'Go to Project Settings', icon: '⚙️' }
  ];

  const filteredIssues = issues.filter(
    i =>
      i.key.toLowerCase().includes(query.toLowerCase()) ||
      i.summary.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredViews = views.filter(v =>
    v.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectView = (mode: ViewMode) => {
    setViewMode(mode);
    setIsOpen(false);
  };

  const handleSelectIssue = (id: string) => {
    setSelectedIssueId(id);
    setIsOpen(false);
  };

  const handleCreateIssue = () => {
    setIsCreateModalOpen(true);
    setIsOpen(false);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={() => setIsOpen(false)}>
      <div className="command-palette-modal animate-scale-up" onClick={e => e.stopPropagation()}>
        <div className="command-palette-header">
          <IconSearch size={18} />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, search issues, or switch view... (esc to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn-icon-close" onClick={() => setIsOpen(false)}>
            <IconX size={16} />
          </button>
        </div>

        <div className="command-palette-body">
          {/* Quick Actions */}
          <div className="command-section">
            <div className="command-section-title">Actions & Operations</div>
            <div className="command-item" onClick={handleCreateIssue}>
              <span className="command-icon"><IconPlus size={14} /></span>
              <span>Create New Issue</span>
              <span className="shortcut-badge">C</span>
            </div>
            <div
              className="command-item"
              onClick={() => {
                resetDemoData();
                setIsOpen(false);
              }}
            >
              <span className="command-icon"><IconZap size={14} /></span>
              <span>Reset Workspace Demo Data</span>
            </div>
          </div>

          {/* Navigation Views */}
          {filteredViews.length > 0 && (
            <div className="command-section">
              <div className="command-section-title">Navigation Views</div>
              {filteredViews.map(v => (
                <div
                  key={v.mode}
                  className="command-item"
                  onClick={() => handleSelectView(v.mode)}
                >
                  <span className="command-icon">{v.icon}</span>
                  <span>{v.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matching Issues */}
          {filteredIssues.length > 0 && (
            <div className="command-section">
              <div className="command-section-title">Matching Issues</div>
              {filteredIssues.map(i => (
                <div
                  key={i.id}
                  className="command-item"
                  onClick={() => handleSelectIssue(i.id)}
                >
                  <span className="issue-key-badge">{i.key}</span>
                  <span className="issue-title-text">{i.summary}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
