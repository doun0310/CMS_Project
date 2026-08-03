import { useContext } from 'react';
import { UIContext, type UIContextValue } from '../context/UIContext';

export const useUIState = (): UIContextValue => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIState must be used within a UIProvider');
  }
  return context;
};
