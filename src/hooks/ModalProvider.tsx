import React, { useState, useCallback, type ReactNode } from 'react';
import { ModalContext, type ModalName } from './useModalContext';

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
