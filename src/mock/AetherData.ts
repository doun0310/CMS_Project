import type { User, Project, Epic, Sprint, Issue, AutomationRule } from '../types/Aether';

export const initialUsers: User[] = [
  {
    id: 'u1',
    name: '김민수 (Min-su Kim)',
    email: 'minsu.kim@aetherpulse.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    projectRole: 'Project Owner',
    role: 'Project Owner'
  },
  {
    id: 'u2',
    name: 'Sarah Connor',
    email: 'sarah.c@aetherpulse.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    projectRole: 'Project Manager',
    role: 'Project Manager'
  },
  {
    id: 'u3',
    name: 'Alex Rivera',
    email: 'alex.rivera@aetherpulse.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    projectRole: 'Project Member',
    role: 'Project Member'
  },
  {
    id: 'u4',
    name: 'Elena Rostova',
    email: 'elena.r@aetherpulse.io',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    projectRole: 'Project Member',
    role: 'Project Member'
  },
  {
    id: 'u5',
    name: '박다윗 (David Park)',
    email: 'david.park@aetherpulse.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    projectRole: 'Viewer',
    role: 'Viewer'
  }
];

export const initialProjects: Project[] = [
  {
    id: 'p1',
    remoteId: '513a426e-7dd6-470a-a3bf-22091e2f887a',
    key: 'CLOUD',
    name: 'Cloud AI Core Platform',
    category: 'Software Development (Agile)',
    avatar: 'cloud-ai',
    description: 'Next-gen distributed AI inference & Enterprise SaaS engine'
  },
  {
    id: 'p2',
    remoteId: 'a1b1755c-7d1b-4a6f-a1ed-8904f8dc7c94',
    key: 'MOBILE',
    name: 'AetherPulse Mobile iOS & Android',
    category: 'Mobile Application',
    avatar: 'mobile-app',
    description: 'Native mobile productivity app for agile project tracking'
  },
  {
    id: 'p3',
    remoteId: 'd6d3748e-7e1e-4bbb-8ab8-0172bab4f1a0',
    key: 'OPS',
    name: 'IT Service & Infrastructure Ops',
    category: 'IT Service Management',
    avatar: 'infra-ops',
    description: 'Global cloud infrastructure, security patching & SLA desk'
  }
];

export const initialEpics: Epic[] = [
  // Project 1: Cloud AI Core Platform (p1)
  {
    id: 'epic-1',
    projectId: 'p1',
    key: 'CLOUD-E1',
    summary: 'LLM Multi-Modal Inference Pipeline',
    color: '#6554C0',
    description: 'High-throughput GPU clusters and streaming API endpoints'
  },
  {
    id: 'epic-2',
    projectId: 'p1',
    key: 'CLOUD-E2',
    summary: 'OAuth2 & SAML SSO Security Auth',
    color: '#0065FF',
    description: 'OAuth2/OIDC, SAML SSO, and Postgres RLS security compliance',
    isCriticalPath: true
  },
  {
    id: 'epic-3',
    projectId: 'p1',
    key: 'CLOUD-E3',
    summary: 'Real-time Telemetry & Performance Dashboard',
    color: '#36B37E',
    description: 'WebSocket live metric streaming, alert notifications & audit logs'
  },
  // Project 2: AetherPulse Mobile iOS & Android (p2)
  {
    id: 'epic-mobile-1',
    projectId: 'p2',
    key: 'MOBILE-E1',
    summary: 'Mobile Offline-First Data Caching Engine',
    color: '#FFAB00',
    description: 'IndexedDB caching, state persistence & background sync manager'
  },
  {
    id: 'epic-mobile-2',
    projectId: 'p2',
    key: 'MOBILE-E2',
    summary: 'Mobile Touch UI & Biometric Security Suite',
    color: '#00B8D9',
    description: 'Biometric FaceID prompt & touch gesture smooth scrolling'
  },
  // Project 3: IT Service & Infrastructure Ops (p3)
  {
    id: 'epic-ops-1',
    projectId: 'p3',
    key: 'OPS-E1',
    summary: 'Zero-Downtime Infrastructure & K8s Security',
    color: '#FF5630',
    description: 'K8s kernel security patching & multi-region failover cluster'
  },
  {
    id: 'epic-ops-2',
    projectId: 'p3',
    key: 'OPS-E2',
    summary: '99.99% SLA Monitoring & Alert Desk',
    color: '#36B37E',
    description: 'PagerDuty incident webhooks, SLA breach alerting & Datadog integration'
  }
];

export const initialSprints: Sprint[] = [
  // Project 1: Cloud AI Core Platform (p1)
  {
    id: 'sprint-24',
    projectId: 'p1',
    name: 'CLOUD Sprint 24 (Active)',
    goal: 'Deliver streaming Inference API & complete SSO SAML 2.0 integration',
    startDate: '2026-07-20',
    endDate: '2026-08-03',
    status: 'active'
  },
  {
    id: 'sprint-25',
    projectId: 'p1',
    name: 'CLOUD Sprint 25 (Planning)',
    goal: 'Postgres RLS policy audit & WebSocket cluster auto-scaling',
    startDate: '2026-08-04',
    endDate: '2026-08-18',
    status: 'future'
  },
  // Project 2: AetherPulse Mobile iOS & Android (p2)
  {
    id: 'sprint-mobile-12',
    projectId: 'p2',
    name: 'MOBILE Sprint 12 (Active)',
    goal: 'Mobile offline sync & responsive touch UI performance optimization',
    startDate: '2026-07-22',
    endDate: '2026-08-05',
    status: 'active'
  },
  {
    id: 'sprint-mobile-13',
    projectId: 'p2',
    name: 'MOBILE Sprint 13 (Planning)',
    goal: 'Push notification engine & biometric Auth FaceID support',
    startDate: '2026-08-06',
    endDate: '2026-08-20',
    status: 'future'
  },
  // Project 3: IT Service & Infrastructure Ops (p3)
  {
    id: 'sprint-ops-8',
    projectId: 'p3',
    name: 'OPS Sprint 8 (Active)',
    goal: 'Zero-downtime cluster security patching & SLA desk automation',
    startDate: '2026-07-25',
    endDate: '2026-08-08',
    status: 'active'
  },
  {
    id: 'sprint-ops-9',
    projectId: 'p3',
    name: 'OPS Sprint 9 (Planning)',
    goal: 'Multi-region disaster recovery failover simulation & audit',
    startDate: '2026-08-09',
    endDate: '2026-08-23',
    status: 'future'
  }
];

export const initialAutomationRules: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Auto-set Resolution Date on Done',
    trigger: 'When Issue Status changes to "Done"',
    action: 'Set Resolved Timestamp & Notify Reporter',
    enabled: true,
    lastExecuted: '2026-07-26 14:20'
  },
  {
    id: 'auto-2',
    name: 'Auto-assign Bug to SRE Team',
    trigger: 'When new Issue of type "Bug" with Priority "Highest" is created',
    action: 'Assign to Elena Rostova & Add label #critical-bug',
    enabled: true,
    lastExecuted: '2026-07-25 09:12'
  },
  {
    id: 'auto-3',
    name: 'Sub-task Completion Checker',
    trigger: 'When all Sub-tasks are checked completed',
    action: 'Suggest moving parent issue to "In Review"',
    enabled: true
  }
];

export const initialIssues: Issue[] = [
  {
    id: 'issue-101',
    key: 'CLOUD-101',
    summary: 'Implement Streaming Server-Sent Events (SSE) for LLM response chunking',
    description: 'Set up Express/Fastify HTTP SSE endpoint to stream token responses directly to frontend clients with low latency (<50ms TTFT). Ensure token rate limiting per tenant key.',
    type: 'feature',
    status: 'in_progress',
    priority: 'highest',
    assigneeId: 'u2',
    reporterId: 'u1',
    epicId: 'epic-1',
    sprintId: 'sprint-24',
    storyPoints: 8,
    subtasks: [
      { id: 'st-1', title: 'Create SSE middleware with backpressure handling', completed: true },
      { id: 'st-2', title: 'Write integration test suite with mock LLM provider', completed: true },
      { id: 'st-3', title: 'Integrate client reconnection exponential backoff', completed: false }
    ],
    comments: [
      {
        id: 'c1',
        authorId: 'u3',
        text: 'Frontend connection handler is ready. Waiting for the token quota headers.',
        createdAt: '2026-07-25T10:15:00Z'
      },
      {
        id: 'c2',
        authorId: 'u2',
        text: 'Headers added in PR #142! Backpressure handling completed successfully.',
        createdAt: '2026-07-25T14:30:00Z'
      }
    ],
    history: [
      { id: 'h1', authorId: 'u1', action: 'Created issue', timestamp: '2026-07-21T09:00:00Z' },
      { id: 'h2', authorId: 'u2', action: 'Changed status from To Do to In Progress', timestamp: '2026-07-22T11:00:00Z' }
    ],
    labels: ['backend', 'streaming', 'llm-core'],
    component: 'Inference Engine',
    dueDate: '2026-07-30',
    originalEstimate: 16,
    timeLogged: 12,
    createdAt: '2026-07-21T09:00:00Z',
    updatedAt: '2026-07-25T14:30:00Z'
  },
  {
    id: 'issue-102',
    key: 'CLOUD-102',
    summary: 'Fix memory leak in Redis Pub/Sub WebSocket session listener',
    description: 'Unsubscribed clients leave stale references in Node event emitter memory pool. High concurrency causes OOM after 12 hours.',
    type: 'bug',
    status: 'in_review',
    priority: 'high',
    assigneeId: 'u4',
    reporterId: 'u5',
    epicId: 'epic-3',
    sprintId: 'sprint-24',
    storyPoints: 5,
    subtasks: [
      { id: 'st-4', title: 'Profile memory leak using heap snapshots', completed: true },
      { id: 'st-5', title: 'Add explicit cleanup hook on WS disconnect', completed: true }
    ],
    comments: [
      {
        id: 'c3',
        authorId: 'u4',
        text: 'PR submitted. Retained memory dropped from 1.2GB down to 45MB during stress testing.',
        createdAt: '2026-07-26T16:00:00Z'
      }
    ],
    history: [
      { id: 'h3', authorId: 'u5', action: 'Created issue', timestamp: '2026-07-23T08:30:00Z' },
      { id: 'h4', authorId: 'u4', action: 'Changed status to In Review', timestamp: '2026-07-26T16:00:00Z' }
    ],
    labels: ['bugfix', 'redis', 'websocket'],
    component: 'Realtime Service',
    dueDate: '2026-07-29',
    originalEstimate: 8,
    timeLogged: 7,
    createdAt: '2026-07-23T08:30:00Z',
    updatedAt: '2026-07-26T16:00:00Z'
  },
  {
    id: 'issue-103',
    key: 'CLOUD-103',
    summary: 'Design glassmorphism UI components for AetherPulse Agile Dashboard',
    description: 'Implement dark/light mode CSS design system with Atlassian tokens, responsive sidebar, filter chips, and smooth drag animations.',
    type: 'feature',
    status: 'done',
    priority: 'high',
    assigneeId: 'u3',
    reporterId: 'u1',
    epicId: 'epic-1',
    sprintId: 'sprint-24',
    storyPoints: 5,
    subtasks: [
      { id: 'st-6', title: 'Atlassian color palette CSS variables setup', completed: true },
      { id: 'st-7', title: 'Header navigation & search component', completed: true },
      { id: 'st-8', title: 'Kanban board swimlanes and card layout', completed: true }
    ],
    comments: [],
    history: [],
    labels: ['frontend', 'ui-ux', 'design-system'],
    component: 'Frontend Web App',
    dueDate: '2026-07-27',
    originalEstimate: 12,
    timeLogged: 12,
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-27T09:00:00Z'
  },
  {
    id: 'issue-104',
    key: 'CLOUD-104',
    projectId: 'p1',
    epicId: 'epic-2',
    summary: 'OAuth2 & SAML 2.0 Identity Provider Integration (100% 완료)',
    description: 'Implement OAuth2 / SAML SSO authentication flow with metadata XML parsing, assertion signature validation, and auto user provisioning.',
    type: 'workitem',
    status: 'done',
    priority: 'highest',
    assigneeId: 'u2',
    reporterId: 'u1',
    sprintId: 'sprint-24',
    storyPoints: 5,
    isCriticalPath: true,
    subtasks: [
      { id: 'st-9', title: 'OAuth2 & SAML SP metadata endpoint setup', completed: true },
      { id: 'st-10', title: 'Certificate validation & OAuth2 JWT assertion parser', completed: true }
    ],
    comments: [],
    history: [],
    labels: ['security', 'oauth2', 'sso', 'saml'],
    component: 'Auth Service',
    dueDate: '2026-08-02',
    originalEstimate: 10,
    timeLogged: 0,
    createdAt: '2026-07-22T14:00:00Z',
    updatedAt: '2026-07-22T14:00:00Z'
  },
  {
    id: 'issue-105',
    key: 'CLOUD-105',
    summary: 'Postgres Row-Level Security (RLS) policies for multi-tenant isolation',
    description: 'Write SQL migration scripts enforcing tenant_id checks across workspace tables to ensure strict data separation.',
    type: 'workitem',
    status: 'todo',
    priority: 'high',
    assigneeId: 'u2',
    reporterId: 'u4',
    epicId: 'epic-2',
    sprintId: 'sprint-25', // Future sprint / backlog
    storyPoints: 8,
    subtasks: [],
    comments: [],
    history: [],
    labels: ['database', 'postgres', 'rls'],
    component: 'Database Migration',
    dueDate: '2026-08-10',
    originalEstimate: 14,
    timeLogged: 0,
    createdAt: '2026-07-24T11:00:00Z',
    updatedAt: '2026-07-24T11:00:00Z'
  },
  {
    id: 'issue-106',
    key: 'CLOUD-106',
    summary: 'Automated E2E Playwright test suite for Sprint & Kanban board workflows',
    description: 'Write automated browser test scripts verifying issue creation, drag-and-drop status changes, and report rendering.',
    type: 'workitem',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'u5',
    reporterId: 'u1',
    epicId: 'epic-3',
    sprintId: 'sprint-24',
    storyPoints: 3,
    subtasks: [
      { id: 'st-11', title: 'Configure Playwright CI runner in Github Actions', completed: true }
    ],
    comments: [],
    history: [],
    labels: ['qa', 'e2e', 'automation'],
    component: 'Testing Suite',
    dueDate: '2026-07-31',
    originalEstimate: 6,
    timeLogged: 4,
    createdAt: '2026-07-24T15:00:00Z',
    updatedAt: '2026-07-26T11:00:00Z'
  },
  {
    id: 'issue-107',
    key: 'CLOUD-107',
    summary: 'Optimize GPU H100 tensor model warm-up latency',
    description: 'Pre-allocate CUDA context upon pod spin-up to reduce initial model loading delay from 8.2s to under 1.5s.',
    type: 'feature',
    status: 'todo',
    priority: 'low',
    assigneeId: 'u4',
    reporterId: 'u2',
    epicId: 'epic-1',
    sprintId: null, // Backlog
    storyPoints: 13,
    subtasks: [],
    comments: [],
    history: [],
    labels: ['gpu', 'performance', 'ai-infra'],
    component: 'Inference Engine',
    dueDate: '2026-08-20',
    originalEstimate: 20,
    timeLogged: 0,
    createdAt: '2026-07-25T13:00:00Z',
    updatedAt: '2026-07-25T13:00:00Z'
  },
  // Project 2 (MOBILE) Issues
  {
    id: 'issue-mobile-201',
    key: 'MOBILE-201',
    projectId: 'p2',
    epicId: 'epic-mobile-1',
    summary: 'Implement Mobile Offline First Data Caching & LocalStorage Sync',
    description: 'Optimize mobile network resiliency by caching workspace state in IndexedDB and syncing when connection resumes.',
    type: 'feature',
    status: 'in_progress',
    priority: 'highest',
    assigneeId: 'u3',
    reporterId: 'u1',
    sprintId: 'sprint-mobile-12',
    storyPoints: 5,
    subtasks: [
      { id: 'st-m1', title: 'Setup IndexedDB storage adapter', completed: true },
      { id: 'st-m2', title: 'Implement background sync manager', completed: false }
    ],
    comments: [],
    history: [],
    labels: ['mobile', 'offline-first', 'react-native'],
    component: 'Mobile Framework',
    dueDate: '2026-08-02',
    originalEstimate: 10,
    timeLogged: 4,
    createdAt: '2026-07-22T10:00:00Z',
    updatedAt: '2026-07-25T11:00:00Z'
  },
  {
    id: 'issue-mobile-202',
    key: 'MOBILE-202',
    projectId: 'p2',
    epicId: 'epic-mobile-2',
    summary: 'Fix touch gesture latency on iOS Safari and React Native WebView',
    description: 'Address 300ms click delay and touch scrolling jitter on lower-end mobile test devices.',
    type: 'bug',
    status: 'todo',
    priority: 'high',
    assigneeId: 'u5',
    reporterId: 'u3',
    sprintId: 'sprint-mobile-12',
    storyPoints: 3,
    subtasks: [],
    comments: [],
    history: [],
    labels: ['bugfix', 'touch-ui', 'performance'],
    component: 'Mobile UI',
    dueDate: '2026-08-04',
    originalEstimate: 6,
    timeLogged: 0,
    createdAt: '2026-07-23T14:00:00Z',
    updatedAt: '2026-07-23T14:00:00Z'
  },
  {
    id: 'issue-mobile-203',
    key: 'MOBILE-203',
    projectId: 'p2',
    epicId: 'epic-mobile-2',
    summary: 'Biometric FaceID & TouchID Authentication UI Flow',
    description: 'Add secure biometric authentication prompt for sensitive workspace operations on iOS and Android.',
    type: 'story',
    status: 'done',
    priority: 'medium',
    assigneeId: 'u3',
    reporterId: 'u1',
    sprintId: 'sprint-mobile-12',
    storyPoints: 8,
    subtasks: [],
    comments: [],
    history: [],
    labels: ['auth', 'biometrics', 'security'],
    component: 'Mobile Security',
    dueDate: '2026-07-28',
    originalEstimate: 12,
    timeLogged: 12,
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-28T16:00:00Z'
  },
  // Project 3 (OPS) Issues
  {
    id: 'issue-ops-301',
    key: 'OPS-301',
    projectId: 'p3',
    epicId: 'epic-ops-1',
    summary: 'Zero-downtime Kubernetes node security patching (CVE-2026-8801)',
    description: 'Roll out kernel patch to all production K8s worker nodes without interrupting active user traffic.',
    type: 'workitem',
    status: 'in_progress',
    priority: 'highest',
    assigneeId: 'u4',
    reporterId: 'u2',
    sprintId: 'sprint-ops-8',
    storyPoints: 8,
    subtasks: [
      { id: 'st-o1', title: 'Drain worker node pool 1', completed: true },
      { id: 'st-o2', title: 'Apply security patch & reboot', completed: true },
      { id: 'st-o3', title: 'Verify pod health status', completed: false }
    ],
    comments: [],
    history: [],
    labels: ['devops', 'security-patch', 'k8s'],
    component: 'Cloud Infra',
    dueDate: '2026-08-01',
    originalEstimate: 16,
    timeLogged: 10,
    createdAt: '2026-07-24T08:00:00Z',
    updatedAt: '2026-07-26T15:00:00Z'
  },
  {
    id: 'issue-ops-302',
    key: 'OPS-302',
    projectId: 'p3',
    epicId: 'epic-ops-2',
    summary: 'Configure Automated PagerDuty Incident Alerting for SLA Desk',
    description: 'Connect Datadog monitors to PagerDuty webhooks for auto-escalation of 99.99% SLA breaches.',
    type: 'task',
    status: 'done',
    priority: 'high',
    assigneeId: 'u4',
    reporterId: 'u1',
    sprintId: 'sprint-ops-8',
    storyPoints: 5,
    subtasks: [],
    comments: [],
    history: [],
    labels: ['sre', 'alerting', 'sla'],
    component: 'Monitoring Desk',
    dueDate: '2026-07-27',
    originalEstimate: 8,
    timeLogged: 8,
    createdAt: '2026-07-21T11:00:00Z',
    updatedAt: '2026-07-27T17:00:00Z'
  }
];

export const initialRetrospectiveItems = [
  {
    id: 'retro-1',
    projectId: 'p1',
    type: 'went_well' as const,
    content: 'Completed high-throughput WebSocket token stream implementation ahead of schedule with 0 memory leaks!',
    votes: 5,
    authorId: 'u3',
    createdAt: '2026-07-26T10:00:00Z'
  },
  {
    id: 'retro-2',
    projectId: 'p1',
    type: 'to_improve' as const,
    content: 'API documentation for rate-limiting headers was missing during QA deployment, causing false positive alerts.',
    votes: 3,
    authorId: 'u2',
    createdAt: '2026-07-26T11:30:00Z'
  },
  {
    id: 'retro-3',
    projectId: 'p1',
    type: 'action_item' as const,
    content: 'Automate OpenAPI Spec generation in GitHub Actions CI pipeline before merging PRs into release branch.',
    votes: 7,
    authorId: 'u4',
    createdAt: '2026-07-26T14:00:00Z'
  }
];

export const initialAutomationAuditLogs = [
  {
    id: 'log-1',
    ruleName: 'Auto-Assign QA on Review',
    triggeredAt: '2026-07-27 11:20:00',
    targetIssueKey: 'CLOUD-101',
    actionTaken: 'Assigned to QA Engineer (David Park)',
    status: 'SUCCESS' as const
  },
  {
    id: 'log-2',
    ruleName: 'Alert Highest Priority Bugs',
    triggeredAt: '2026-07-27 09:45:12',
    targetIssueKey: 'CLOUD-102',
    actionTaken: 'Sent AI alert to Team Lead Slack channel',
    status: 'SUCCESS' as const
  }
];
