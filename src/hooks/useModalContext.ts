import { createContext, useContext } from 'react';

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
