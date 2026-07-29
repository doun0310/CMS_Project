import React, { createContext, useContext, useState, useCallback, type ReactNode, type ComponentType } from 'react';

// -- Modal Registry Type --
export type ModalName =
  | 'standup'
  | 'projectSwitch'
  | 'release'
  | 'testGenerator'
  | 'customField'
  | 'velocitySimulator'
  | 'codeImpact'
  | 'retroReport'
  | 'automationRule'
  | 'prAudit'
  | 'capacityCalendar'
  | 'releaseGate'
  | 'skillMatrix'
  | 'issueTriage'
  | 'incidentPostMortem'
  | 'techDebtScanner'
  | 'dependencyGraph'
  | 'monteCarlo'
  | 'complianceMatrix'
  | 'auth'
  | null;

interface ModalContextValue {
  activeModal: ModalName;
  openModal: (name: ModalName) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  activeModal: null,
  openModal: () => {},
  closeModal: () => {},
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalName>(null);

  const openModal = useCallback((name: ModalName) => {
    setActiveModal(name);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// -- Lazy Modal Registry --
// Only the active modal is imported and rendered. All others are unmounted.
const MODAL_REGISTRY: Record<string, () => Promise<{ default: ComponentType<{ isOpen: boolean; onClose: () => void }> }>> = {
  standup: () => import('../modals/DailyStandupModal').then(m => ({ default: m.DailyStandupModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  projectSwitch: () => import('../modals/ProjectSwitchModal').then(m => ({ default: m.ProjectSwitchModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  release: () => import('../modals/ReleaseNotesModal').then(m => ({ default: m.ReleaseNotesModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  testGenerator: () => import('../modals/TestGeneratorModal').then(m => ({ default: m.TestGeneratorModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  customField: () => import('../modals/CustomFieldModal').then(m => ({ default: m.CustomFieldModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  velocitySimulator: () => import('../modals/VelocitySimulatorModal').then(m => ({ default: m.VelocitySimulatorModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  codeImpact: () => import('../modals/CodeImpactModal').then(m => ({ default: m.CodeImpactModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  retroReport: () => import('../modals/RetroReportModal').then(m => ({ default: m.RetroReportModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  automationRule: () => import('../modals/AutomationRuleModal').then(m => ({ default: m.AutomationRuleModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  prAudit: () => import('../modals/PrAuditModal').then(m => ({ default: m.PrAuditModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  capacityCalendar: () => import('../modals/CapacityCalendarModal').then(m => ({ default: m.CapacityCalendarModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  releaseGate: () => import('../modals/ReleaseGateModal').then(m => ({ default: m.ReleaseGateModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  skillMatrix: () => import('../modals/SkillMatrixModal').then(m => ({ default: m.SkillMatrixModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  issueTriage: () => import('../modals/IssueTriageModal').then(m => ({ default: m.IssueTriageModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  incidentPostMortem: () => import('../modals/IncidentPostMortemModal').then(m => ({ default: m.IncidentPostMortemModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  techDebtScanner: () => import('../modals/TechDebtScannerModal').then(m => ({ default: m.TechDebtScannerModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  dependencyGraph: () => import('../modals/DependencyGraphModal').then(m => ({ default: m.DependencyGraphModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  monteCarlo: () => import('../modals/MonteCarloSimulatorModal').then(m => ({ default: m.MonteCarloSimulatorModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  complianceMatrix: () => import('../modals/ComplianceMatrixModal').then(m => ({ default: m.ComplianceMatrixModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
  auth: () => import('../modals/AuthModal').then(m => ({ default: m.AuthModal as unknown as ComponentType<{ isOpen: boolean; onClose: () => void }> })),
};

/**
 * ModalManager renders ONLY the currently active modal via React.lazy.
 * All other modals are completely unmounted — zero render overhead.
 */
export const ModalManager: React.FC = () => {
  const { activeModal, closeModal } = useModal();

  if (!activeModal || !MODAL_REGISTRY[activeModal]) {
    return null;
  }

  const LazyModal = React.lazy(MODAL_REGISTRY[activeModal]);

  return (
    <React.Suspense fallback={null}>
      <LazyModal isOpen={true} onClose={closeModal} />
    </React.Suspense>
  );
};
