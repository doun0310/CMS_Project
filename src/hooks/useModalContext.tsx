import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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

export interface ModalContextValue {
  activeModal: ModalName;
  openModal: (name: ModalName) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue>({
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
