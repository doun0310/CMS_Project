import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconCheckCircle, IconHeartPulse, IconZap } from './Icons';
import type { User } from '../../types/Aether';

export const TeamHealthPulseCard: React.FC = () => {
  const { users, issues, sprints, updateIssue, t } = useAether();
  const [balancedAlert, setBalancedAlert] = useState<string | null>(null);

  const activeSprint = sprints.find(s => s.status === 'active');
  if (!activeSprint) return null;

  const sprintIssues = issues.filter(i => i.sprintId === activeSprint.id);

  // Compute individual burnout risk per team member
  const memberHealthList = users.map((user: User) => {
    const uIssues = sprintIssues.filter(i => i.assigneeId === user.id);
    const assignedPts = uIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    const donePts = uIssues.filter(i => i.status === 'done').reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    const openCount = uIssues.filter(i => i.status !== 'done').length;

    let healthState: 'OPTIMAL' | 'MODERATE' | 'BURNOUT' = 'OPTIMAL';
    let badgeColor = '#10b981';
    let labelText = t('optimalBalance');

    if (assignedPts > 15 || openCount > 5) {
      healthState = 'BURNOUT';
      badgeColor = '#de350b';
      labelText = t('burnoutRisk');
    } else if (assignedPts > 10 || openCount > 3) {
      healthState = 'MODERATE';
      badgeColor = '#ffab00';
      labelText = t('heavyWorkload');
    }

    return {
      user,
      uIssues,
      assignedPts,
      donePts,
      openCount,
      healthState,
      badgeColor,
      labelText
    };
  });

  const overloadedMembers = memberHealthList.filter(m => m.healthState === 'BURNOUT');
  const lightMembers = memberHealthList.filter(m => m.assignedPts <= 8);

  const handle1ClickRedistribute = () => {
    if (overloadedMembers.length === 0 || lightMembers.length === 0) return;
    // Pick the light member with the lowest currently assigned points
    const targetMember = [...lightMembers].sort((a, b) => a.assignedPts - b.assignedPts)[0];
    const overloaded = overloadedMembers[0];
    const taskToMove = overloaded.uIssues.find(i => i.status === 'todo');

    if (taskToMove) {
      updateIssue(taskToMove.id, { assigneeId: targetMember.user.id });
      setBalancedAlert(`Reallocated [${taskToMove.key}] from ${overloaded.user.name} to ${targetMember.user.name}!`);
      setTimeout(() => setBalancedAlert(null), 4000);
    }
  };

  return (
    <div className="team-health-pulse-card animate-fade-in">
      <div className="card-header-row">
        <div className="title-area">
          <span className="card-icon">
            <IconHeartPulse size={22} color="#ec4899" />
          </span>
          <div>
            <h3>{t('teamHealthTitle')}</h3>
          </div>
        </div>

        {overloadedMembers.length > 0 && lightMembers.length > 0 && (
          <button className="btn-primary-sm" onClick={handle1ClickRedistribute}>
            <IconZap size={14} color="#ffffff" style={{ marginRight: 4 }} />
            {t('rebalanceWorkload')}
          </button>
        )}
      </div>

      {balancedAlert && (
        <div className="mitigation-alert-banner animate-fade-in">
          <IconCheckCircle size={16} color="#10b981" /> {balancedAlert}
        </div>
      )}

      <div className="health-members-grid">
        {memberHealthList.map(item => (
          <div key={item.user.id} className="member-health-card">
            <div className="member-top">
              <img src={item.user.avatar} alt={item.user.name} className="member-avatar" />
              <div className="member-meta">
                <span className="member-name">{item.user.name}</span>
                <span className="member-role">{item.user.role}</span>
              </div>
              <span className="health-state-badge" style={{ color: item.badgeColor, borderColor: item.badgeColor }}>
                <span className="dot" style={{ backgroundColor: item.badgeColor, width: 6, height: 6, borderRadius: '50%', display: 'inline-block', marginRight: 5 }}></span>
                {item.labelText}
              </span>
            </div>

            <div className="member-stats-row">
              <div className="m-stat">
                <span className="m-label">{t('totalPoints')}</span>
                <span className="m-val">{item.assignedPts} {t('pointsShort')}</span>
              </div>
              <div className="m-stat">
                <span className="m-label">{t('assignedTasks')}</span>
                <span className="m-val">{item.openCount} {t('tasks')}</span>
              </div>
              <div className="m-stat">
                <span className="m-label">{t('donePoints')}</span>
                <span className="m-val green">{item.donePts} {t('pointsShort')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
