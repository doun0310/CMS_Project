import React, { useEffect, useEffectEvent, useState } from 'react';
import { AetherProvider } from './context/AetherContext';
import { useAether } from './context/AetherContextValue';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { KanbanBoard } from './components/views/KanbanBoard';
import { BacklogView } from './components/views/BacklogView';
import { RoadmapView } from './components/views/RoadmapView';
import { ReportsView } from './components/views/ReportsView';
import { AutomationView } from './components/views/AutomationView';
import { SettingsView } from './components/views/SettingsView';
import { RetrospectiveView } from './components/views/RetrospectiveView';
import { ArchitectureView } from './components/views/ArchitectureView';
import { PortfolioView } from './components/views/PortfolioView';
import { RetroKanbanView } from './components/views/RetroKanbanView';
import { MyWorkView } from './components/views/MyWorkView';
import { IssueDetailModal } from './components/modals/IssueDetailModal';
import { CreateIssueModal } from './components/modals/CreateIssueModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { AICopilotPanel } from './components/common/AICopilotPanel';
import type { ViewMode } from './types/Aether';
import './App.css';

const MainLayout: React.FC = () => {
  const { viewMode, setViewMode, setIsCreateModalOpen, isCreateModalOpen, selectedIssueId, setSelectedIssueId } = useAether();
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const handleGlobalKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const activeEl = document.activeElement;
    const isInputActive = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.tagName === 'SELECT' ||
      activeEl.getAttribute('contenteditable') === 'true'
    );

    if (isInputActive) return;

    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      setIsShortcutsModalOpen(prev => !prev);
      return;
    }

    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      setIsCreateModalOpen(true);
      return;
    }

    const viewMap: Record<string, ViewMode> = {
      '1': 'my-work',
      '2': 'board',
      '3': 'backlog',
      '4': 'roadmap',
      '5': 'reports',
      '6': 'retrospective',
      '7': 'automation'
    };

    if (viewMap[e.key]) {
      e.preventDefault();
      setViewMode(viewMap[e.key]);
      return;
    }

    if (e.key === 'Escape') {
      if (isShortcutsModalOpen) {
        setIsShortcutsModalOpen(false);
      } else if (isCreateModalOpen) {
        setIsCreateModalOpen(false);
      } else if (selectedIssueId) {
        setSelectedIssueId(null);
      }
    }
  });

  // Register once; useEffectEvent keeps the handler fresh without re-subscribing.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleGlobalKeyDown(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'my-work':
        return <MyWorkView />;
      case 'board':
        return <KanbanBoard />;
      case 'backlog':
        return <BacklogView />;
      case 'roadmap':
        return <RoadmapView />;
      case 'reports':
        return <ReportsView />;
      case 'automation':
        return <AutomationView />;
      case 'retrospective':
        return <RetrospectiveView />;
      case 'settings':
        return <SettingsView />;
      case 'architecture':
        return <ArchitectureView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'retro-kanban':
        return <RetroKanbanView />;
      default:
        return <MyWorkView />;
    }
  };

  return (
    <div className="app-container">
      {/* Atlassian Top Navigation Header */}
      <Header />

      <div className="app-main-layout">
        {/* Atlassian Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace Content View */}
        <main className="app-content-area animate-fade-in">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals & AI Panel */}
      <IssueDetailModal />
      <CreateIssueModal />
      <CommandPaletteModal />
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
      <AICopilotPanel />
    </div>
  );
};

export default function App() {
  return (
    <AetherProvider>
      <MainLayout />
    </AetherProvider>
  );
}
