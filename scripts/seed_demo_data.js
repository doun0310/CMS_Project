import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
let supabaseUrl = '';
let supabaseKey = '';

const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    if (match[1] === 'VITE_SUPABASE_URL') supabaseUrl = match[2].trim();
    if (match[1] === 'VITE_SUPABASE_ANON_KEY') supabaseKey = match[2].trim();
  }
});

const supabase = createClient(supabaseUrl, supabaseKey);

// Deterministic UUID helper matching idUtils.ts
const uuidMap = new Map();
function ensureUUID(id) {
  if (!id) return crypto.randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  if (uuidMap.has(id)) return uuidMap.get(id);

  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < id.length; i++) {
    const ch = id.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = Math.abs(h1).toString(16).padStart(8, '0');
  const hex2 = Math.abs(h2).toString(16).padStart(8, '0');
  const deterministicUUID = `${hex1.slice(0, 8)}-${hex2.slice(0, 4)}-4${hex2.slice(4, 7)}-a${hex1.slice(0, 3)}-${hex1}${hex2.slice(0, 4)}`;
  uuidMap.set(id, deterministicUUID);
  return deterministicUUID;
}

const projects = [
  {
    id: '513a426e-7dd6-470a-a3bf-22091e2f887a',
    key: 'CLOUD',
    name: 'Cloud AI Core Platform',
    category: 'Software Development (Agile)',
    avatar: 'cloud-ai',
    description: 'Next-gen distributed AI inference & Enterprise SaaS engine'
  },
  {
    id: 'a1b1755c-7d1b-4a6f-a1ed-8904f8dc7c94',
    key: 'MOBILE',
    name: 'AetherPulse Mobile iOS & Android',
    category: 'Mobile Application',
    avatar: 'mobile-app',
    description: 'Native mobile productivity app for agile project tracking'
  },
  {
    id: 'd6d3748e-7e1e-4bbb-8ab8-0172bab4f1a0',
    key: 'OPS',
    name: 'IT Service & Infrastructure Ops',
    category: 'IT Service Management',
    avatar: 'infra-ops',
    description: 'Global cloud infrastructure, security patching & SLA desk'
  }
];

const epics = [
  { id: 'epic-1', projectId: 'p1', key: 'CLOUD-E1', summary: 'LLM Multi-Modal Inference Pipeline', color: '#6554C0' },
  { id: 'epic-2', projectId: 'p1', key: 'CLOUD-E2', summary: 'OAuth2 & SAML SSO Security Auth', color: '#0065FF' },
  { id: 'epic-3', projectId: 'p1', key: 'CLOUD-E3', summary: 'Real-time Telemetry & Performance Dashboard', color: '#36B37E' },
  { id: 'epic-mobile-1', projectId: 'p2', key: 'MOBILE-E1', summary: 'Mobile Offline-First Data Caching Engine', color: '#FFAB00' },
  { id: 'epic-mobile-2', projectId: 'p2', key: 'MOBILE-E2', summary: 'Mobile Touch UI & Biometric Security Suite', color: '#00B8D9' },
  { id: 'epic-ops-1', projectId: 'p3', key: 'OPS-E1', summary: 'Zero-Downtime Infrastructure & K8s Security', color: '#FF5630' },
  { id: 'epic-ops-2', projectId: 'p3', key: 'OPS-E2', summary: '99.99% SLA Monitoring & Alert Desk', color: '#36B37E' }
];

const sprints = [
  { id: 'sprint-24', projectId: 'p1', name: 'CLOUD Sprint 24 (Active)', goal: 'Deliver streaming Inference API & complete SSO SAML 2.0 integration', startDate: '2026-07-20', endDate: '2026-08-03', status: 'active' },
  { id: 'sprint-25', projectId: 'p1', name: 'CLOUD Sprint 25 (Planning)', goal: 'Postgres RLS policy audit & WebSocket cluster auto-scaling', startDate: '2026-08-04', endDate: '2026-08-18', status: 'future' },
  { id: 'sprint-mobile-12', projectId: 'p2', name: 'MOBILE Sprint 12 (Active)', goal: 'Mobile offline sync & responsive touch UI performance optimization', startDate: '2026-07-22', endDate: '2026-08-05', status: 'active' },
  { id: 'sprint-mobile-13', projectId: 'p2', name: 'MOBILE Sprint 13 (Planning)', goal: 'Push notification engine & biometric Auth FaceID support', startDate: '2026-08-06', endDate: '2026-08-20', status: 'future' },
  { id: 'sprint-ops-8', projectId: 'p3', name: 'OPS Sprint 8 (Active)', goal: 'Zero-downtime cluster security patching & SLA desk automation', startDate: '2026-07-25', endDate: '2026-08-08', status: 'active' },
  { id: 'sprint-ops-9', projectId: 'p3', name: 'OPS Sprint 9 (Planning)', goal: 'Multi-region disaster recovery failover simulation & audit', startDate: '2026-08-09', endDate: '2026-08-23', status: 'future' }
];

const issues = [
  {
    id: 'issue-101',
    projectId: 'p1',
    key: 'CLOUD-101',
    summary: 'Implement Streaming Server-Sent Events (SSE) for LLM response chunking',
    description: 'Set up Express/Fastify HTTP SSE endpoint to stream token responses directly to frontend clients with low latency (<50ms TTFT).',
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
      { id: 'c1', authorId: 'u3', text: 'Frontend connection handler is ready. Waiting for token quota headers.', createdAt: '2026-07-25T10:15:00Z' }
    ]
  },
  {
    id: 'issue-102',
    projectId: 'p1',
    key: 'CLOUD-102',
    summary: 'OAuth2 / SAML 2.0 Okta & Azure AD Single Sign-On Integration',
    description: 'Implement Enterprise SAML SSO provider metadata parser and JWT token verification layer for Okta/Azure AD.',
    type: 'feature',
    status: 'done',
    priority: 'high',
    assigneeId: 'u1',
    reporterId: 'u2',
    epicId: 'epic-2',
    sprintId: 'sprint-24',
    storyPoints: 5,
    subtasks: [
      { id: 'st-4', title: 'Parse Okta SAML XML metadata file', completed: true },
      { id: 'st-5', title: 'Implement RS256 JWT signature verification', completed: true }
    ],
    comments: [
      { id: 'c2', authorId: 'u1', text: 'Okta sandbox integration verified successfully.', createdAt: '2026-07-26T14:30:00Z' }
    ]
  },
  {
    id: 'issue-103',
    projectId: 'p1',
    key: 'CLOUD-103',
    summary: 'Fix GPU Memory Leak in PyTorch Inference Worker Pool',
    description: 'Investigate VRAM leakage under heavy multi-tenant concurrency. Ensure cuda.empty_cache() is triggered after batch generation.',
    type: 'bug',
    status: 'in_review',
    priority: 'highest',
    assigneeId: 'u4',
    reporterId: 'u3',
    epicId: 'epic-1',
    sprintId: 'sprint-24',
    storyPoints: 5,
    subtasks: [
      { id: 'st-6', title: 'Profile VRAM consumption using nvidia-smi telemetry', completed: true },
      { id: 'st-7', title: 'Implement garbage collection hook after infer request', completed: true }
    ]
  },
  {
    id: 'issue-104',
    projectId: 'p1',
    key: 'CLOUD-104',
    summary: 'Real-time Telemetry Dashboard with WebSockets & Chart.js',
    description: 'Build interactive real-time dashboard displaying system load, CPU/GPU utilisation, and API request throughput.',
    type: 'feature',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u3',
    reporterId: 'u2',
    epicId: 'epic-3',
    sprintId: 'sprint-24',
    storyPoints: 3,
    subtasks: []
  },
  {
    id: 'issue-201',
    projectId: 'p2',
    key: 'MOBILE-201',
    summary: 'Implement SQLite & IndexedDB Local Persistence for Offline Mode',
    description: 'Ensure all board tasks, subtasks, and comments are cached locally using IndexedDB for seamless offline usage.',
    type: 'feature',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'u3',
    reporterId: 'u1',
    epicId: 'epic-mobile-1',
    sprintId: 'sprint-mobile-12',
    storyPoints: 5,
    subtasks: [
      { id: 'st-8', title: 'Define Dexie.js schema for offline sync store', completed: true },
      { id: 'st-9', title: 'Implement sync queue with conflict resolution', completed: false }
    ]
  },
  {
    id: 'issue-202',
    projectId: 'p2',
    key: 'MOBILE-202',
    summary: 'Biometric Security Prompt (FaceID & Fingerprint) for Mobile App',
    description: 'Integrate React Native Biometrics / iOS LocalAuthentication framework for app unlock.',
    type: 'feature',
    status: 'todo',
    priority: 'high',
    assigneeId: 'u4',
    reporterId: 'u2',
    epicId: 'epic-mobile-2',
    sprintId: 'sprint-mobile-12',
    storyPoints: 3,
    subtasks: []
  },
  {
    id: 'issue-301',
    projectId: 'p3',
    key: 'OPS-301',
    summary: 'Kubernetes 1.30 Security Cluster Patching & Node Rolling Restart',
    description: 'Upgrade control plane and worker nodes to Kubernetes 1.30 with zero downtime across AWS EKS clusters.',
    type: 'workitem',
    status: 'in_progress',
    priority: 'highest',
    assigneeId: 'u1',
    reporterId: 'u4',
    epicId: 'epic-ops-1',
    sprintId: 'sprint-ops-8',
    storyPoints: 8,
    subtasks: [
      { id: 'st-10', title: 'Drain worker node pool A in staging', completed: true },
      { id: 'st-11', title: 'Apply CNI plugin security updates', completed: true }
    ]
  },
  {
    id: 'issue-302',
    projectId: 'p3',
    key: 'OPS-302',
    summary: 'Automate PagerDuty Incident Response Webhook for SLA Desk',
    description: 'Set up automated PagerDuty alert triggers for CPU/Memory spikes exceeding 90% threshold for >3 minutes.',
    type: 'feature',
    status: 'done',
    priority: 'high',
    assigneeId: 'u2',
    reporterId: 'u3',
    epicId: 'epic-ops-2',
    sprintId: 'sprint-ops-8',
    storyPoints: 3,
    subtasks: []
  }
];

const retroItems = [
  {
    id: 'retro-1',
    projectId: 'p1',
    sprintId: 'sprint-24',
    authorId: 'u1',
    type: 'went_well',
    content: 'SAML SSO Okta integration was completed 2 days ahead of target schedule with clean unit test coverage.',
    votes: 4,
    voterIds: ['u1', 'u2', 'u3', 'u4']
  },
  {
    id: 'retro-2',
    projectId: 'p1',
    sprintId: 'sprint-24',
    authorId: 'u3',
    type: 'to_improve',
    content: 'Staging environment deployment pipeline was delayed due to Docker build cache invalidation issues.',
    votes: 3,
    voterIds: ['u2', 'u3', 'u4']
  },
  {
    id: 'retro-3',
    projectId: 'p1',
    sprintId: 'sprint-24',
    authorId: 'u2',
    type: 'action_item',
    content: 'Implement GitHub Actions layer caching for TurboPack build runner to cut CI time in half.',
    status: 'planned',
    assigneeId: 'u4',
    votes: 5,
    voterIds: ['u1', 'u2', 'u3', 'u4', 'u5']
  }
];

const leaveRequests = [
  {
    id: 'lr-1',
    userId: 'u3',
    leaveType: 'ANNUAL',
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    reason: 'Summer vacation & personal recharge',
    status: 'APPROVED',
    approverId: 'u1'
  },
  {
    id: 'lr-2',
    userId: 'u4',
    leaveType: 'HALF_PM',
    startDate: '2026-08-07',
    endDate: '2026-08-07',
    reason: 'Health checkup appointment',
    status: 'PENDING'
  }
];

async function seedData() {
  console.log('🌱 Starting Demo Data Seeding to Supabase...');

  // 1. Projects
  console.log('--> Seeding Projects...');
  for (const proj of projects) {
    const { error } = await supabase.from('projects').upsert({
      id: proj.id,
      key: proj.key,
      name: proj.name,
      description: proj.description,
      avatar: proj.avatar,
    });
    if (error) console.error(`   Error seeding project ${proj.key}:`, error.message);
    else console.log(`   ✅ Project ${proj.key} seeded.`);
  }

  // 2. Sprints
  console.log('--> Seeding Sprints...');
  for (const sprint of sprints) {
    const projId = projects.find(p => p.id === sprint.projectId || p.key === sprint.projectId)?.id || projects[0].id;
    const dbStatus = sprint.status === 'future' ? 'planned' : sprint.status;
    const { error } = await supabase.from('sprints').upsert({
      id: ensureUUID(sprint.id),
      project_id: projId,
      name: sprint.name,
      goal: sprint.goal,
      status: dbStatus,
      start_date: sprint.startDate,
      end_date: sprint.endDate,
    });
    if (error) console.error(`   Error seeding sprint ${sprint.name}:`, error.message);
    else console.log(`   ✅ Sprint ${sprint.name} seeded.`);
  }

  // 3. Epics
  console.log('--> Seeding Epics...');
  for (const epic of epics) {
    const projId = projects.find(p => p.id === epic.projectId || p.key === epic.projectId)?.id || projects[0].id;
    const { error } = await supabase.from('epics').upsert({
      id: ensureUUID(epic.id),
      project_id: projId,
      name: epic.summary,
      summary: epic.summary,
      color: epic.color,
    });
    if (error) console.error(`   Error seeding epic ${epic.key}:`, error.message);
    else console.log(`   ✅ Epic ${epic.key} seeded.`);
  }

  // 4. Issues
  console.log('--> Seeding Issues...');
  for (const issue of issues) {
    const projId = projects.find(p => p.id === issue.projectId)?.id || projects[0].id;
    const sprintUUID = issue.sprintId ? ensureUUID(issue.sprintId) : null;
    const epicUUID = issue.epicId ? ensureUUID(issue.epicId) : null;

    const { error } = await supabase.from('issues').upsert({
      id: ensureUUID(issue.id),
      project_id: projId,
      sprint_id: sprintUUID,
      epic_id: epicUUID,
      key: issue.key,
      summary: issue.summary,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      priority: issue.priority,
      assignee_id: issue.assigneeId,
      reporter_id: issue.reporterId,
      story_points: issue.storyPoints,
      subtasks: issue.subtasks || [],
      comments: issue.comments || [],
      history: issue.history || [],
    });
    if (error) console.error(`   Error seeding issue ${issue.key}:`, error.message);
    else console.log(`   ✅ Issue ${issue.key} seeded.`);
  }

  // 5. Retrospective Items
  console.log('--> Seeding Retrospective Items...');
  for (const retro of retroItems) {
    const projId = projects.find(p => p.id === retro.projectId)?.id || projects[0].id;
    const sprintUUID = ensureUUID(retro.sprintId);
    const { error } = await supabase.from('retrospective_items').upsert({
      id: ensureUUID(retro.id),
      project_id: projId,
      sprint_id: sprintUUID,
      author_id: retro.authorId,
      category: retro.type === 'went_well' ? 'good' : retro.type === 'to_improve' ? 'improve' : 'action',
      content: retro.content,
      upvotes: retro.votes,
      status: retro.status || 'planned',
      assignee_id: retro.assigneeId || null,
      voter_ids: retro.voterIds || [],
    });
    if (error) console.error(`   Error seeding retro item ${retro.id}:`, error.message);
    else console.log(`   ✅ Retro item ${retro.id} seeded.`);
  }

  // 6. Leave Requests
  console.log('--> Seeding Leave Requests...');
  for (const req of leaveRequests) {
    const { error } = await supabase.from('leave_requests').upsert({
      id: ensureUUID(req.id),
      user_id: req.userId,
      leave_type: req.leaveType,
      start_date: req.startDate,
      end_date: req.endDate,
      reason: req.reason,
      status: req.status,
      approver_id: req.approverId || null,
    });
    if (error) console.error(`   Error seeding leave request ${req.id}:`, error.message);
    else console.log(`   ✅ Leave request ${req.id} seeded.`);
  }

  console.log('\n🎉 ALL DEMO DATA SEEDED SUCCESSFULLY TO SUPABASE!');
}

seedData();
