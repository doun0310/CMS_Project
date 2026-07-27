import React from 'react';
import { JiraProvider, useJira } from './context/JiraContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { KanbanBoard } from './components/views/KanbanBoard';
import { BacklogView } from './components/views/BacklogView';
import { RoadmapView } from './components/views/RoadmapView';
import { ReportsView } from './components/views/ReportsView';
import { AutomationView } from './components/views/AutomationView';
import { SettingsView } from './components/views/SettingsView';
import { RetrospectiveView } from './components/views/RetrospectiveView';
import { IssueDetailModal } from './components/modals/IssueDetailModal';
import { CreateIssueModal } from './components/modals/CreateIssueModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { AICopilotPanel } from './components/common/AICopilotPanel';
import './App.css';

const MainLayout: React.FC = () => {
  const { viewMode } = useJira();

  const renderCurrentView = () => {
    switch (viewMode) {
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
      default:
        return <KanbanBoard />;
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
      <AICopilotPanel />
    </div>
  );
};

export default function App() {
  return (
    <JiraProvider>
      <MainLayout />
    </JiraProvider>
  );
}
