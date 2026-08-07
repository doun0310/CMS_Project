import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconZap, IconUsers } from '../common/Icons';

interface SkillMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkillMatrixModal: React.FC<SkillMatrixModalProps> = ({ isOpen, onClose }) => {
  const { users, issues, updateIssue, t } = useAether();

  const unassignedIssues = issues.filter((i) => !i.assigneeId || i.status !== 'done');
  const [selectedIssueId, setSelectedIssueId] = useState<string>(unassignedIssues[0]?.id || issues[0]?.id || '');
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  if (!isOpen) return null;

  const targetIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const teamSkillMatrix = [
    {
      user: users[0] || { id: 'u1', name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
      role: 'Lead Architect',
      skills: { frontend: 5, backend: 4, devops: 3, ai: 5 },
      matchScore: targetIssue?.type === 'feature' ? 95 : 88,
    },
    {
      user: users[1] || { id: 'u2', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
      role: 'Senior Mobile & QA Engineer',
      skills: { frontend: 4, backend: 3, devops: 4, ai: 3 },
      matchScore: targetIssue?.type === 'bug' ? 98 : 75,
    },
    {
      user: users[2] || { id: 'u3', name: 'Marcus Vance', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
      role: 'DevOps & Database Lead',
      skills: { frontend: 2, backend: 5, devops: 5, ai: 3 },
      matchScore: targetIssue?.component?.toLowerCase().includes('db') ? 99 : 70,
    },
  ];

  const bestMatch = teamSkillMatrix.reduce((prev, curr) => (curr.matchScore > prev.matchScore ? curr : prev));

  const handleAssignBestMatch = (userId: string) => {
    if (!targetIssue) return;
    updateIssue(targetIssue.id, { assigneeId: userId });
    setAssignedSuccess(true);
    setTimeout(() => {
      setAssignedSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content skill-matrix-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconUsers size={20} /></span>
            <div>
              <h2 className="modal-title">{t('skillMatrixModalTitle')}</h2>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body skill-modal-body">
          {/* Target Issue Selection Bar */}
          <div className="skill-issue-select-bar">
            <label>{t('selectTargetIssue')}:</label>
            <select
              value={selectedIssueId}
              onChange={(e) => setSelectedIssueId(e.target.value)}
              className="skill-select"
            >
              {issues.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.key}] {i.summary} ({i.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* AI Skill Matching Banner */}
          <div className="ai-skill-recommendation-card">
            <div className="skill-rec-header">
              <IconZap size={18} color="#6366f1" />
              <span>{t('aiRecommendedMatch')}: {bestMatch.user.name} ({bestMatch.matchScore}% {t('match')})</span>
            </div>
            <p className="skill-rec-text">
              Based on skill proficiency tags and current workload, <strong>{bestMatch.user.name}</strong> possesses the highest technical competency for [{targetIssue?.key}].
            </p>
          </div>

          {/* Skill Proficiency Matrix Table */}
          <div className="skill-matrix-section">
            <h3>{t('teamSkillRatings')}</h3>

            <div className="skill-table-wrap">
              <table className="skill-table">
                <thead>
                  <tr>
                    <th>{t('engineer')}</th>
                    <th>{t('role')}</th>
                    <th>Frontend</th>
                    <th>Backend</th>
                    <th>DevOps</th>
                    <th>AI / ML</th>
                    <th>{t('aiRecommendedMatch')}</th>
                    <th>{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {teamSkillMatrix.map((item) => (
                    <tr key={item.user.id}>
                      <td>
                        <div className="user-info-flex">
                          <img src={item.user.avatar} alt="" className="avatar-xs" />
                          <span className="font-semibold">{item.user.name}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{item.role}</td>
                      <td><span className="skill-stars">{'★'.repeat(item.skills.frontend)}</span></td>
                      <td><span className="skill-stars">{'★'.repeat(item.skills.backend)}</span></td>
                      <td><span className="skill-stars">{'★'.repeat(item.skills.devops)}</span></td>
                      <td><span className="skill-stars">{'★'.repeat(item.skills.ai)}</span></td>
                      <td>
                        <span className={`match-badge ${item.matchScore >= 90 ? 'high' : 'medium'}`}>
                          {item.matchScore}% {t('match')}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-primary-sm"
                          onClick={() => handleAssignBestMatch(item.user.id)}
                        >
                          {t('assignTicket')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {t('close')}
          </button>
          <button
            className="btn-primary"
            onClick={() => handleAssignBestMatch(bestMatch.user.id)}
            disabled={assignedSuccess}
          >
            {assignedSuccess ? (
              <>
                <IconCheckCircle /> {t('assignedSuccess')}
              </>
            ) : (
              <>
                {t('autoAssignBestMatch')} ({bestMatch.user.name})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
