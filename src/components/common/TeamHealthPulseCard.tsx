import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconCheckCircle } from './Icons';
import type { User } from '../../types/Aether';

export const TeamHealthPulseCard: React.FC = () => {
  const { users, issues, sprints, updateIssue } = useAether();
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
    let badgeColor = '#22c55e';
    let labelText = '🟢 Optimal Balance';

    if (assignedPts > 15 || openCount > 5) {
      healthState = 'BURNOUT';
      badgeColor = '#de350b';
      labelText = '🔴 Burnout Risk';
    } else if (assignedPts > 10 || openCount > 3) {
      healthState = 'MODERATE';
      badgeColor = '#ffab00';
      labelText = '🟡 Heavy Workload';
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
    const targetMember = lightMembers[0];
    const overloaded = overloadedMembers[0];
    const taskToMove = overloaded.uIssues.find(i => i.status === 'todo');

    if (taskToMove) {
      updateIssue(taskToMove.id, { assigneeId: targetMember.user.id });
      setBalancedAlert(`Reallocated [${taskToMove.key}] from ${overloaded.user.name} to ${targetMember.user.name} for workload health!`);
      setTimeout(() => setBalancedAlert(null), 4000);
    }
  };

  return (
    <div className="team-health-pulse-card animate-fade-in">
      <div className="card-header-row">
        <div className="title-area">
          <span className="card-icon">🩺</span>
          <div>
            <h3>AI Team Health Pulse & Burnout Risk Diagnostics</h3>
            <p>Workload density & fatigue monitoring engine for agile engineering teams</p>
          </div>
        </div>

        {overloadedMembers.length > 0 && lightMembers.length > 0 && (
          <button className="btn-primary-sm" onClick={handle1ClickRedistribute}>
            ⚡ 1-Click Workload Rebalancer
          </button>
        )}
      </div>

      {balancedAlert && (
        <div className="mitigation-alert-banner animate-fade-in">
          <IconCheckCircle size={16} /> {balancedAlert}
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
                {item.labelText}
              </span>
            </div>

            <div className="member-stats-row">
              <div className="m-stat">
                <span className="m-label">Assigned Points</span>
                <span className="m-val">{item.assignedPts} pts</span>
              </div>
              <div className="m-stat">
                <span className="m-label">Open Tasks</span>
                <span className="m-val">{item.openCount} items</span>
              </div>
              <div className="m-stat">
                <span className="m-label">Completed</span>
                <span className="m-val green">{item.donePts} pts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
