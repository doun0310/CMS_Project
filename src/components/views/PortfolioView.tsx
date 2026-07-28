import React from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconZap } from '../common/Icons';

export const PortfolioView: React.FC = () => {
  const { users, setCurrentProject, setViewMode } = useAether();

  const portfolioProjects = [
    {
      id: 'proj-aether',
      key: 'AETH',
      name: 'Aether Pulse Core',
      category: 'Software Architecture',
      avatar: '⚡',
      lead: users[0]?.name || 'Lead Architect',
      status: 'on_track',
      statusLabel: '🟢 On Track',
      completionPct: 85,
      activeIssues: 14,
      totalSp: 42,
      velocity: 28,
    },
    {
      id: 'proj-apex',
      key: 'APEX',
      name: 'Apex Mobile Client',
      category: 'Mobile iOS / Android',
      avatar: '📱',
      lead: users[1]?.name || 'Mobile Engineer',
      status: 'warning',
      statusLabel: '🟡 High Scope Addition',
      completionPct: 62,
      activeIssues: 22,
      totalSp: 68,
      velocity: 32,
    },
    {
      id: 'proj-titan',
      key: 'TITN',
      name: 'Titan Infra & DB Cluster',
      category: 'DevOps & Database',
      avatar: '🛡️',
      lead: users[2]?.name || 'DevOps Lead',
      status: 'degraded',
      statusLabel: '🔴 SLA Breached',
      completionPct: 40,
      activeIssues: 18,
      totalSp: 54,
      velocity: 18,
    },
    {
      id: 'proj-cypher',
      key: 'CYPH',
      name: 'Cypher AI Engine',
      category: 'AI / Machine Learning',
      avatar: '🤖',
      lead: users[0]?.name || 'AI Specialist',
      status: 'on_track',
      statusLabel: '🟢 On Track',
      completionPct: 92,
      activeIssues: 8,
      totalSp: 26,
      velocity: 24,
    },
  ];

  const teamAllocations = [
    {
      user: users[0] || { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
      assignedProjects: ['Aether Pulse Core', 'Cypher AI Engine'],
      totalSp: 22,
      maxCap: 20,
      status: 'overallocated',
    },
    {
      user: users[1] || { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
      assignedProjects: ['Apex Mobile Client'],
      totalSp: 16,
      maxCap: 20,
      status: 'optimal',
    },
    {
      user: users[2] || { name: 'Marcus Vance', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
      assignedProjects: ['Titan Infra & DB Cluster', 'Apex Mobile Client'],
      totalSp: 25,
      maxCap: 20,
      status: 'overallocated',
    },
  ];

  const handleSelectProject = (proj: typeof portfolioProjects[0]) => {
    setCurrentProject({
      id: proj.id,
      key: proj.key,
      name: proj.name,
      category: proj.category,
      avatar: proj.avatar,
      description: `Active portfolio project ${proj.name}`,
    });
    setViewMode('board');
  };

  return (
    <div className="portfolio-view animate-fade-in">
      <div className="view-header-row">
        <div>
          <h1 className="view-title">💼 AI Executive Portfolio & Multi-Project Analytics</h1>
          <p className="view-subtitle">
            Cross-workspace executive overview, project health indicators & global resource allocations
          </p>
        </div>
      </div>

      {/* AI Portfolio Executive Digest Banner */}
      <div className="portfolio-ai-card">
        <div className="ai-card-title">
          <IconZap size={18} color="#6366f1" />
          <span>🤖 AI Executive Portfolio Digest</span>
        </div>
        <p className="ai-card-text">
          Portfolio velocity is tracking at <strong>102 SP/sprint</strong> across 4 active workspaces.
          <strong>Titan Infra & DB Cluster</strong> requires executive escalation due to 2 SLA-breached blocker tickets.
          Resource allocation heatmap detects 2 engineers overallocated across multi-project bounds.
        </p>
      </div>

      {/* Multi-Project Health Grid */}
      <div className="portfolio-projects-grid">
        {portfolioProjects.map((proj) => (
          <div key={proj.id} className={`portfolio-proj-card ${proj.status}`}>
            <div className="proj-card-top">
              <div className="proj-avatar">{proj.avatar}</div>
              <div className="proj-meta">
                <span className="proj-name">{proj.name}</span>
                <span className="proj-key font-mono">[{proj.key}]</span>
              </div>
              <span className={`proj-status-badge ${proj.status}`}>
                {proj.statusLabel}
              </span>
            </div>

            <div className="proj-stats-row">
              <div className="stat-item">
                <span className="stat-label">Velocity</span>
                <span className="stat-val">{proj.velocity} SP</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Issues</span>
                <span className="stat-val">{proj.activeIssues}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completion</span>
                <span className="stat-val">{proj.completionPct}%</span>
              </div>
            </div>

            <div className="proj-progress-wrap">
              <div className="proj-progress-bar" style={{ width: `${proj.completionPct}%` }}></div>
            </div>

            <div className="proj-card-bottom">
              <span className="proj-lead">Lead: {proj.lead}</span>
              <button className="btn-switch-workspace" onClick={() => handleSelectProject(proj)}>
                Switch Workspace ➔
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Global Resource Allocation Heatmap */}
      <div className="resource-allocation-section">
        <h3>👥 Global Cross-Project Engineer Resource Heatmap</h3>

        <div className="allocation-grid">
          {teamAllocations.map((alloc, idx) => (
            <div key={idx} className={`alloc-card ${alloc.status}`}>
              <div className="alloc-header">
                <img src={alloc.user.avatar} alt="" className="avatar-md" />
                <div>
                  <div className="alloc-name">{alloc.user.name}</div>
                  <div className="alloc-projects">{alloc.assignedProjects.join(', ')}</div>
                </div>
                <span className={`alloc-badge ${alloc.status}`}>
                  {alloc.status === 'overallocated' ? '🔴 Overallocated' : '🟢 Optimal'}
                </span>
              </div>

              <div className="alloc-load-bar">
                <div
                  className={`alloc-bar-fill ${alloc.status}`}
                  style={{ width: `${Math.min(100, (alloc.totalSp / alloc.maxCap) * 100)}%` }}
                ></div>
              </div>

              <div className="alloc-footer font-mono">
                Workload: {alloc.totalSp} / {alloc.maxCap} SP ({Math.round((alloc.totalSp / alloc.maxCap) * 100)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
