import React, { useEffect, useEffectEvent, useState, lazy, Suspense } from 'react';
import { AetherProvider } from './context/AetherContext';
import { useAether } from './context/AetherContextValue';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ModalProvider } from './hooks/ModalProvider';
import { ModalManager } from './components/common/ModalManager';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Lazy-loaded Views for Code Splitting & Performance Optimization
const KanbanBoard = lazy(() => import('./components/views/KanbanBoard').then(m => ({ default: m.KanbanBoard })));
const BacklogView = lazy(() => import('./components/views/BacklogView').then(m => ({ default: m.BacklogView })));
const RoadmapView = lazy(() => import('./components/views/RoadmapView').then(m => ({ default: m.RoadmapView })));
const ReportsView = lazy(() => import('./components/views/ReportsView').then(m => ({ default: m.ReportsView })));
const AutomationView = lazy(() => import('./components/views/AutomationView').then(m => ({ default: m.AutomationView })));
const SettingsView = lazy(() => import('./components/views/SettingsView').then(m => ({ default: m.SettingsView })));
const RetrospectiveView = lazy(() => import('./components/views/RetrospectiveView').then(m => ({ default: m.RetrospectiveView })));
const ArchitectureView = lazy(() => import('./components/views/ArchitectureView').then(m => ({ default: m.ArchitectureView })));
const PortfolioView = lazy(() => import('./components/views/PortfolioView').then(m => ({ default: m.PortfolioView })));
const RetroKanbanView = lazy(() => import('./components/views/RetroKanbanView').then(m => ({ default: m.RetroKanbanView })));
const CapacityView = lazy(() => import('./components/views/CapacityView').then(m => ({ default: m.CapacityView })));
const MyWorkView = lazy(() => import('./components/views/MyWorkView').then(m => ({ default: m.MyWorkView })));
const PricingView = lazy(() => import('./components/views/PricingView').then(m => ({ default: m.PricingView })));
const BudgetView = lazy(() => import('./components/views/BudgetView').then(m => ({ default: m.BudgetView })));
import { SubscriptionProvider } from './context/SubscriptionContext';
import { IssueDetailModal } from './components/modals/IssueDetailModal';
import { CreateIssueModal } from './components/modals/CreateIssueModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { AICopilotPanel } from './components/common/AICopilotPanel';
import AuthPage from './components/auth/AuthPage';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { OfflineBanner } from './components/common/OfflineBanner';
import { isSupabaseConfigured, supabase } from './services/supabase';
import type { ViewMode } from './types/Aether';
import './App.css';
import './styles/auth.css';

// ─── Auth Gate ─────────────────────────────────────────────────────────────

/**
 * Wraps the entire app with an authentication gate.
 * - When Supabase is NOT configured → skip auth (local-only / demo mode)
 * - When Supabase IS configured → require a valid session before showing the workspace
 */
const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    isSupabaseConfigured ? 'loading' : 'authenticated'
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession('authenticated');
      return;
    }

    // Check existing session immediately
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? 'authenticated' : 'unauthenticated');
    }).catch(() => setSession('unauthenticated'));

    // Listen for subsequent auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? 'authenticated' : 'unauthenticated');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === 'loading') {
    return (
      <div className="auth-page">
        <div className="auth-bg-shapes">
          <div className="auth-shape auth-shape-1" />
          <div className="auth-shape auth-shape-2" />
        </div>
        <div className="auth-loading-card">
          <div className="auth-loading-logo">
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="url(#lg-splash)"/>
              <path d="M10 26L18 10L26 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 21H23" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="lg-splash" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1"/>
                  <stop offset="1" stopColor="#8B5CF6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="auth-spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
          <p className="auth-loading-text">AetherPulse 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (session === 'unauthenticated') {
    return <AuthPage />;
  }

  return <>{children}</>;
};

// ─── Main Workspace Layout ──────────────────────────────────────────────────

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
      '2': 'backlog',
      '3': 'board',
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
      case 'capacity':
        return <CapacityView />;
      case 'pricing':
        return <PricingView />;
      case 'budget':
        return <BudgetView />;
      default:
        return <MyWorkView />;
    }
  };

  return (
    <div className="app-container">
      {/* Atlassian Top Navigation Header */}
      <ErrorBoundary fallbackTitle="Header failed to load">
        <Header />
      </ErrorBoundary>

      <div className="app-main-layout">
        {/* Atlassian Sidebar */}
        <ErrorBoundary fallbackTitle="Sidebar failed to load">
          <Sidebar />
        </ErrorBoundary>

        {/* Dynamic Main Workspace Content View */}
        <main className="app-content-area animate-fade-in">
          <ErrorBoundary fallbackTitle="This view encountered an error">
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', gap: '12px', color: '#64748b' }}>
                <div className="auth-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                <span>로딩 중...</span>
              </div>
            }>
              {renderCurrentView()}
            </Suspense>
          </ErrorBoundary>
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
      <ToastContainer />
      <OfflineBanner />

      {/* Centralized Modal Manager — renders only the active tool modal */}
      <ModalManager />
    </div>
  );
};


// ─── Subscription-aware Provider (needs AetherContext) ───────────────────────

const SubscriptionAwareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUser } = useAether();
  return (
    <SubscriptionProvider userId={authUser?.id ?? null}>
      {children}
    </SubscriptionProvider>
  );
};

// ─── Root App ───────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ToastProvider>
      <AuthGate>
        <AetherProvider>
          <SubscriptionAwareProvider>
            <ModalProvider>
              <ErrorBoundary fallbackTitle="Application crashed — please refresh">
                <MainLayout />
              </ErrorBoundary>
            </ModalProvider>
          </SubscriptionAwareProvider>
        </AetherProvider>
      </AuthGate>
    </ToastProvider>
  );
}
