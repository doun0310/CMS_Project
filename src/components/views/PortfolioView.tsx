import React, { useMemo } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconAiSpark, IconPortfolio, IconUsers } from '../common/Icons';

export const PortfolioView: React.FC = () => {
  const { projects, portfolioIssues, users, setCurrentProject, setViewMode, updateProject, t } = useAether();

  const portfolioProjects = useMemo(() => projects.map(project => {
    const projectIssues = portfolioIssues.filter(issue => issue.projectId === project.id);
    const activeIssues = projectIssues.filter(issue => issue.status !== 'done');
    const totalPoints = projectIssues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    const donePoints = projectIssues.filter(issue => issue.status === 'done').reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    const completionPct = totalPoints ? Math.round((donePoints / totalPoints) * 100) : 0;
    const blocked = activeIssues.filter(issue => (issue.blockedBy?.length || 0) > 0).length;
    const status = blocked > 0 ? 'degraded' : completionPct < 45 && activeIssues.length > 0 ? 'warning' : 'on_track';
    return { ...project, activeIssues: activeIssues.length, totalPoints, completionPct, status };
  }), [projects, portfolioIssues]);

  const teamAllocations = useMemo(() => users.map(user => {
    const assigned = portfolioIssues.filter(issue => issue.assigneeId === user.id && issue.status !== 'done');
    const totalSp = assigned.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    return { user, assignedProjects: [...new Set(assigned.map(issue => projects.find(project => project.id === issue.projectId)?.name).filter(Boolean))], totalSp, maxCap: 20 };
  }), [users, portfolioIssues, projects]);

  return (
    <div className="portfolio-view animate-fade-in">
      <div className="view-header-row"><div><h1 className="view-title view-title-with-icon"><IconPortfolio size={20} /> {t('portfolioTitle')}</h1></div></div>

      <div className="portfolio-ai-card">
        <div className="ai-card-title"><IconAiSpark size={18} color="var(--color-in-progress, #6366f1)" /><span>{t('portfolioAiDigest')}</span></div>
        <p className="ai-card-text">{projects.length}개 프로젝트의 진행률, 막힌 작업, 담당자별 작업량을 실시간으로 확인하고 조율할 수 있습니다.</p>
      </div>

      <div className="portfolio-projects-grid">
        {portfolioProjects.map(project => {
          const lead = users.find(user => user.id === project.leadUserId);
          return (
            <article key={project.id} className={`portfolio-proj-card ${project.status}`}>
              <div className="proj-card-top"><div className="proj-avatar">{project.avatar}</div><div className="proj-meta"><span className="proj-name">{project.name}</span><span className="proj-key font-mono">[{project.key}]</span></div><span className={`proj-status-badge ${project.status}`}>{project.status === 'on_track' ? `🟢 ${t('onTrack')}` : project.status === 'warning' ? `🟡 ${t('attention')}` : `🔴 ${t('atRisk')}`}</span></div>
              <div className="proj-stats-row"><div className="stat-item"><span className="stat-label">{t('activeIssues')}</span><span className="stat-val">{project.activeIssues}</span></div><div className="stat-item"><span className="stat-label">{t('totalPoints')}</span><span className="stat-val">{project.totalPoints}</span></div><div className="stat-item"><span className="stat-label">{t('completion')}</span><span className="stat-val">{project.completionPct}%</span></div></div>
              <div className="proj-progress-wrap"><div className="proj-progress-bar" style={{ width: `${project.completionPct}%` }} /></div>
              <div className="portfolio-lead-control"><span>{t('lead')}</span><select value={project.leadUserId || ''} onChange={event => updateProject(project.id, { leadUserId: event.target.value || null })}><option value="">{t('unassigned')}</option>{users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></div>
              <div className="proj-card-bottom"><span className="proj-lead">{lead?.name || t('unassigned')}</span><button className="btn-switch-workspace" onClick={() => { setCurrentProject(project); setViewMode('board'); }}>{t('switchWorkspace')} ➔</button></div>
            </article>
          );
        })}
      </div>

      <section className="resource-allocation-section"><h3 className="section-title-with-icon"><IconUsers size={17} /> {t('resourceHeatmap')}</h3><div className="allocation-grid">
        {teamAllocations.map(allocation => {
          const status = allocation.totalSp > allocation.maxCap ? 'overallocated' : 'optimal';
          return <div key={allocation.user.id} className={`alloc-card ${status}`}><div className="alloc-header"><img src={allocation.user.avatar} alt="" className="avatar-md" /><div><div className="alloc-name">{allocation.user.name}</div><div className="alloc-projects">{allocation.assignedProjects.join(', ') || t('unassigned')}</div></div><span className={`alloc-badge ${status}`}>{status === 'overallocated' ? `🔴 ${t('overallocated')}` : `🟢 ${t('optimal')}`}</span></div><div className="alloc-load-bar"><div className={`alloc-bar-fill ${status}`} style={{ width: `${Math.min(100, allocation.totalSp / allocation.maxCap * 100)}%` }} /></div><div className="alloc-footer font-mono">{t('workload')}: {allocation.totalSp} / {allocation.maxCap} {t('pointsShort')}</div></div>;
        })}
      </div></section>
    </div>
  );
};
