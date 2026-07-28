import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconPlus, IconCheck } from '../common/Icons';
import type { Project } from '../../types/Aether';

interface ProjectSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSwitchModal: React.FC<ProjectSwitchModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, setCurrentProject, createProject, projects, issues, t } = useAether();

  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  if (!isOpen) return null;

  const handleSelectProject = (proj: Project) => {
    setCurrentProject(proj);
    onClose();
  };

  const handleCreateSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newKey.trim() || !newName.trim()) return;

    createProject({
      key: newKey.trim().toUpperCase(),
      name: newName.trim(),
      category: 'Software Engineering',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      description: newDesc.trim() || t('projectDescriptionDefault')
    });
    setIsCreating(false);
    setNewKey('');
    setNewName('');
    setNewDesc('');
    onClose();
  };

  return (
    <div className="modal-backdrop-center animate-fade-in" onClick={onClose}>
      <div className="project-switch-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="title-with-icon">
            <span>💼</span>
            <h3>{t('workspacesTitle')}</h3>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        {!isCreating ? (
          <div className="modal-body-content">
            <div className="projects-grid-list">
              {projects.map(proj => {
                const projIssues = issues.filter(i => i.key.startsWith(proj.key));
                const isSelected = proj.id === currentProject.id;

                return (
                  <div
                    key={proj.id}
                    className={`project-card-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectProject(proj)}
                  >
                    <div className="card-top">
                      <img src={proj.avatar} alt={proj.name} className="project-avatar-lg" />
                      <div className="proj-info">
                        <span className="proj-key">{proj.key}</span>
                        <h4 className="proj-name">{proj.name}</h4>
                      </div>
                      {isSelected && <span className="active-badge"><IconCheck size={14} /> {t('active')}</span>}
                    </div>
                    <p className="proj-desc">{proj.description}</p>

                    <div className="proj-meta-footer">
                      <span className="meta-item">📁 {proj.category}</span>
                      <span className="meta-item">🎟️ {projIssues.length} {t('activeIssues')}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer-actions">
              <button className="btn-primary" onClick={() => setIsCreating(true)}>
                <IconPlus size={16} /> {t('createWorkspace')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit} className="create-project-form">
            <div className="form-group">
              <label>{t('projectKeyHint')}</label>
              <input
                type="text"
                placeholder={t('projectKeyPlaceholder')}
                maxLength={6}
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('projectNameField')}</label>
              <input
                type="text"
                placeholder={t('projectNamePlaceholder')}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('descriptionField')}</label>
              <textarea
                rows={2}
                placeholder={t('projectDescriptionPlaceholder')}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>

            <div className="form-actions-row">
              <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)}>{t('cancel')}</button>
              <button type="submit" className="btn-primary">
                {t('createSwitchWorkspace')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
