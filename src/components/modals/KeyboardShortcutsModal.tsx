import React from 'react';
import { IconX } from '../common/Icons';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: '⚡ Quick Actions',
      items: [
        { key: 'Cmd + K', desc: 'Open Universal Command Palette' },
        { key: 'C', desc: 'Create New Issue' },
        { key: '?', desc: 'Toggle Keyboard Shortcuts Guide' },
        { key: 'Esc', desc: 'Close open modal or drawer' }
      ]
    },
    {
      category: '🗺️ View Navigation',
      items: [
        { key: '1', desc: 'Switch to Kanban Board' },
        { key: '2', desc: 'Switch to Backlog' },
        { key: '3', desc: 'Switch to Timeline Roadmap' },
        { key: '4', desc: 'Switch to Reports & Analytics' },
        { key: '5', desc: 'Switch to Sprint Retrospective' },
        { key: '6', desc: 'Switch to Automation Engine' },
        { key: '7', desc: 'Switch to Settings' }
      ]
    }
  ];

  return (
    <div className="modal-backdrop-center animate-fade-in" onClick={onClose}>
      <div className="shortcuts-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <h3>⌨️ Keyboard Shortcuts Guide</h3>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close shortcuts modal">
            <IconX size={18} />
          </button>
        </div>

        <div className="shortcuts-modal-body">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="shortcut-group">
              <h4>{group.category}</h4>
              <div className="shortcut-items">
                {group.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="shortcut-row">
                    <span className="shortcut-desc">{item.desc}</span>
                    <kbd className="shortcut-kbd">{item.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-modal-footer">
          <span>Press <kbd>Esc</kbd> or click anywhere outside to close.</span>
        </div>
      </div>
    </div>
  );
};
