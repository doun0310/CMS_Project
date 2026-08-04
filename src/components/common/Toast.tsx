import React from 'react';
import { useToast } from '../../context/ToastContext';

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const duration = toast.duration ?? 3500;
        return (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            <div className="toast-icon">{icons[toast.type]}</div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              ✕
            </button>
            <div 
              className="toast-progress" 
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        );
      })}
    </div>
  );
};
