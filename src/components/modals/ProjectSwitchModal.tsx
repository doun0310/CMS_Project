import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconPlus, IconCheck, IconTrash, IconSettings } from '../common/Icons';
import type { Project } from '../../types/Aether';
import { can } from '../../utils/permissions';

interface ProjectSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSwitchModal: React.FC<ProjectSwitchModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, currentUser, setCurrentProject, setViewMode, setSearchQuery, setSelectedIssueId, createProject, updateProject, deleteProject, projects, issues, t } = useAether();

  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  if (!isOpen) return null;

  const handleSelectProject = (proj: Project) => {
    setCurrentProject(proj);
    setViewMode('board');
    setSearchQuery('');
    setSelectedIssueId(null);
    onClose();
  };

  const handleCreateSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newKey.trim() || !newName.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, {
        key: newKey.trim().toUpperCase(),
        name: newName.trim(),
        description: newDesc.trim() || t('projectDescriptionDefault'),
      });
    } else {
      createProject({
        key: newKey.trim().toUpperCase(),
        name: newName.trim(),
        category: 'Software Engineering',
        avatar: '✦',
        description: newDesc.trim() || t('projectDescriptionDefault')
      });
    }
    setIsCreating(false);
    setEditingProject(null);
    setNewKey('');
    setNewName('');
    setNewDesc('');
    onClose();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewKey(project.key);
    setNewName(project.name);
    setNewDesc(project.description);
    setIsCreating(true);
  };

  const handleDeleteProject = (project: Project) => {
    if (!window.confirm(`Delete ${project.name}? This cannot be undone.`)) return;
    if (!deleteProject(project.id)) {
      window.alert('At least one workspace must remain.');
    }
  };

  return (
    <div className="modal-backdrop-center animate-fade-in" onClick={onClose}>
      <div className="project-switch-modal glass-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="title-with-icon">
            <span></span>
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
                      <span className="project-avatar-lg project-avatar-symbol" aria-hidden="true">
                        {proj.avatar.startsWith('http') || proj.avatar.startsWith('data:image') ? '✦' : proj.avatar}
                      </span>
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
                    {can(currentUser, 'team:manage') && <div className="project-card-actions">
                      <button type="button" className="project-card-action" onClick={event => { event.stopPropagation(); handleEditProject(proj); }}>
                        <IconSettings size={14} /> Edit
                      </button>
                      <button type="button" className="project-card-action danger" onClick={event => { event.stopPropagation(); handleDeleteProject(proj); }}>
                        <IconTrash size={14} /> Delete
                      </button>
                    </div>}
                  </div>
                );
              })}
            </div>

            <div className="modal-footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                className="btn-primary-sm flex-center gap-1"
                style={{ padding: '7px 14px', fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px' }}
                onClick={() => { setEditingProject(null); setNewKey(''); setNewName(''); setNewDesc(''); setIsCreating(true); }}
              >
                <IconPlus size={14} /> {t('createWorkspace')}
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

            <div className="form-actions-row flex-center gap-3" style={{ marginTop: '16px' }}>
              <button type="button" className="btn-ghost-styled" onClick={() => { setIsCreating(false); setEditingProject(null); }}>{t('cancel')}</button>
              <button type="submit" className="btn-primary-styled flex-center gap-2">
                <IconPlus size={16} />
                {editingProject ? 'Save Changes' : t('createSwitchWorkspace')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
