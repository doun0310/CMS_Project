import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAether } from '../../context/AetherContextValue';
import type { LeaveRequest, LeaveType } from '../../types/Aether';
import { canApproveLeave, getProjectRole } from '../../utils/permissions';
import {
  IconCalendar,
  IconCheckCircle,
  IconX,
  IconUser,
  IconClock,
  IconAlertTriangle,
  IconPlus,
  IconDownload,
  IconAiSpark,
  IconPalmtree,
  IconSun,
  IconMoon,
  IconBriefcase,
  IconStethoscope,
  IconStory,
  IconChevronLeft,
  IconChevronRight,
  IconXCircle,
  IconArrowRight
} from '../common/Icons';
import {
  fetchLeaveRequestsFromSupabase,
  syncLeaveRequestToSupabase,
  mapDbToLeaveRequest
} from '../../services/supabaseSync';
import { isSupabaseConfigured, subscribeToTable } from '../../services/supabase';
import type { SupabaseLeaveRequestRow } from '../../types/SupabaseTypes';
import '../../styles/capacityView.css';

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-1',
    userId: 'u1', // Alex Rivera
    leaveType: 'ANNUAL',
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    reason: '여름 정기 휴가',
    status: 'APPROVED',
    approverId: 'u3',
    createdAt: '2026-08-01T09:00:00Z'
  },
  {
    id: 'leave-2',
    userId: 'u2', // Sarah Chen
    leaveType: 'OUTSIDE',
    startDate: '2026-08-14',
    endDate: '2026-08-14',
    reason: '클라우드 아키텍처 외부 세미나 및 고객사 미팅',
    status: 'APPROVED',
    approverId: 'u3',
    createdAt: '2026-08-02T11:30:00Z'
  },
  {
    id: 'leave-3',
    userId: 'u4', // Marcus Vance
    leaveType: 'HALF_PM',
    startDate: '2026-08-11',
    endDate: '2026-08-11',
    reason: '개인 병원 진료',
    status: 'PENDING',
    createdAt: '2026-08-05T14:20:00Z'
  }
];

export const CapacityView: React.FC = () => {
  const { users, sprints, issues, currentUser, addNotification, updateIssue } = useAether();

  const isViewer = currentUser ? getProjectRole(currentUser) === 'Viewer' : false;
  const isManager = currentUser ? canApproveLeave(currentUser) : true;

  const notifyPermissionDenied = () => {
    addNotification({
      kind: 'system',
      title: '권한 없음',
      text: '현재 프로젝트 역할로는 작업을 변경할 수 없습니다.'
    });
  };

  const LEAVE_STORAGE_KEY = 'AETHER_PULSE_LEAVE_REQUESTS_V1';

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LEAVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse leave requests from localStorage:', e);
    }
    return INITIAL_LEAVE_REQUESTS;
  });

  // LocalStorage Save Effect
  React.useEffect(() => {
    try {
      localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(leaveRequests));
    } catch (e) {
      console.warn('Failed to save leave requests to localStorage:', e);
    }
  }, [leaveRequests]);

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'calendar'>('overview');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLeaveForDetail, setSelectedLeaveForDetail] = useState<LeaveRequest | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(0);

  // Supabase Initial Fetch & Realtime WebSocket Subscription
  React.useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchLeaveRequestsFromSupabase().then((data) => {
      if (data && data.length > 0) {
        setLeaveRequests((prev) => {
          // Merge remote Supabase data with local requests seamlessly (avoid overwriting unsynced local data)
          const map = new Map<string, LeaveRequest>();
          prev.forEach((req) => map.set(req.id, req));
          data.forEach((req) => map.set(req.id, req));
          return Array.from(map.values());
        });
      }
    }).catch((err) => {
      console.warn('Failed to load leave requests from Supabase:', err);
    });

    // Realtime WebSocket Subscription
    const unsubscribe = subscribeToTable('leave_requests', (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const updated = mapDbToLeaveRequest(payload.new as SupabaseLeaveRequestRow);
        setLeaveRequests((prev) => {
          const idx = prev.findIndex((r) => r.id === updated.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [updated, ...prev];
        });
      } else if (payload.eventType === 'DELETE') {
        const deletedId = payload.old?.id;
        if (deletedId) {
          setLeaveRequests((prev) => prev.filter((r) => r.id !== deletedId));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Active Sprint calculation
  const activeSprint = sprints.find((s) => s.status === 'active') || sprints[0];
  const activeSprintIssues = issues.filter((i) => i.sprintId === activeSprint?.id);

  // Form State
  const [applicantUserId, setApplicantUserId] = useState<string>(currentUser?.id || users[0]?.id || 'u1');
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('2026-08-15');
  const [endDate, setEndDate] = useState('2026-08-15');
  const [reason, setReason] = useState('');

  // ─── Working Days & Holiday Calculation Helpers ─────────────────────────────
  
  // 2026년 대한민국/글로벌 주요 공휴일 목록 (YYYY-MM-DD)
  const HOLIDAYS_2026 = new Set([
    '2026-01-01', // 신정
    '2026-02-16', '2026-02-17', '2026-02-18', // 설날 연휴
    '2026-03-01', '2026-03-02', // 삼일절 및 대체공휴일
    '2026-05-05', // 어린이날
    '2026-05-24', // 부처님오신날
    '2026-06-06', // 현충일
    '2026-08-15', '2026-08-17', // 광복절 및 대체공휴일
    '2026-09-24', '2026-09-25', '2026-09-26', // 추석 연휴
    '2026-10-03', // 개천절
    '2026-10-09', // 한글날
    '2026-12-25'  // 성탄절
  ]);

  const isWorkingDay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    if (HOLIDAYS_2026.has(dateStr)) return false;
    return true;
  };

  const calculateWorkingDays = (startDateStr: string, endDateStr: string) => {
    let count = 0;
    const cur = new Date(startDateStr + 'T00:00:00');
    const last = new Date(endDateStr + 'T00:00:00');

    while (cur <= last) {
      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (isWorkingDay(dateKey)) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const getUserLeaveHours = (userId: string) => {
    const userLeaves = leaveRequests.filter(
      (r) => r.userId === userId && r.status === 'APPROVED'
    );
    let totalHours = 0;
    userLeaves.forEach((leave) => {
      if (leave.leaveType === 'HALF_AM' || leave.leaveType === 'HALF_PM') {
        if (isWorkingDay(leave.startDate)) {
          totalHours += 4;
        }
      } else if (leave.leaveType === 'ANNUAL' || leave.leaveType === 'SICK' || leave.leaveType === 'OTHER') {
        const workingDays = calculateWorkingDays(leave.startDate, leave.endDate);
        totalHours += workingDays * 8;
      } else if (leave.leaveType === 'OUTSIDE') {
        if (isWorkingDay(leave.startDate)) {
          totalHours += 4;
        }
      }
    });
    return totalHours;
  };

  const memberCapacities = users.map((user) => {
    // User custom weekly capacity (default 40h/week -> 80h per 2-week sprint)
    const baseWeeklyCap = user.weeklyCapacityHours || 40;
    const sprintBaseHours = baseWeeklyCap * 2;
    const leaveHours = getUserLeaveHours(user.id);
    const availableHours = Math.max(0, sprintBaseHours - leaveHours);
    
    // Deep work cap ratio (5.5h / 8h = 68.75%)
    const maxRecommendedHours = Math.round(availableHours * 0.6875);

    // Get issues for active sprint, fallback to all project issues if sprint issues are empty
    const userProjectIssues = issues.filter((i) => i.assigneeId === user.id);
    const assignedIssues = activeSprintIssues.length > 0 
      ? activeSprintIssues.filter((i) => i.assigneeId === user.id)
      : userProjectIssues;

    const assignedHours = Math.round(assignedIssues.reduce((acc, i) => {
      const estimate = i.originalEstimate > 0 ? i.originalEstimate : (i.storyPoints ? i.storyPoints * 4 : 8);
      return acc + estimate;
    }, 0) * 10) / 10;
    
    const isOverloaded = assignedHours > maxRecommendedHours;
    const loadPercentage = maxRecommendedHours > 0 ? Math.round((assignedHours / maxRecommendedHours) * 100) : 100;

    return {
      user,
      sprintBaseHours,
      assignedIssues,
      assignedHours,
      leaveHours,
      availableHours,
      maxRecommendedHours,
      isOverloaded,
      loadPercentage
    };
  });

  const totalTeamAvailableHours = memberCapacities.reduce((acc, m) => acc + m.availableHours, 0);
  const totalTeamAssignedHours = memberCapacities.reduce((acc, m) => acc + m.assignedHours, 0);
  const overloadedMembersCount = memberCapacities.filter((m) => m.isOverloaded).length;

  // Trigger Overload System Notification if any member exceeds capacity
  React.useEffect(() => {
    const overloaded = memberCapacities.filter((m) => m.isOverloaded);
    if (overloaded.length > 0) {
      const names = overloaded.map((m) => m.user.name).join(', ');
      addNotification({
        kind: 'system',
        title: '팀원 업무 과부하(Burnout) 경고',
        text: `다음 팀원의 업무량이 개발 수용량을 초과했습니다: ${names}`
      });
    }
  }, [overloadedMembersCount]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    if (isViewer) {
      notifyPermissionDenied();
      setShowApplyModal(false);
      return;
    }

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      userId: applicantUserId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    syncLeaveRequestToSupabase(newRequest, (err: any) => {
      console.warn('Supabase sync warning (data persisted locally):', err?.message);
    });
    setShowApplyModal(false);
    setReason('');
  };

  const handleApprove = (id: string) => {
    if (isViewer) {
      notifyPermissionDenied();
      return;
    }

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const updated = { ...req, status: 'APPROVED' as const, approverId: currentUser?.id };
          syncLeaveRequestToSupabase(updated, (err: any) => {
            console.warn('Supabase sync warning (data persisted locally):', err?.message);
          });
          return updated;
        }
        return req;
      })
    );
  };

  const handleReject = (id: string) => {
    if (isViewer) {
      notifyPermissionDenied();
      return;
    }

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const updated = { ...req, status: 'REJECTED' as const, approverId: currentUser?.id };
          syncLeaveRequestToSupabase(updated);
          return updated;
        }
        return req;
      })
    );
  };

  // AI Estimation Engine: Multi-factor estimation logic (Story Points + Subtasks + Tech Complexity + PR/Commit History)
  const [activeAiUserId, setActiveAiUserId] = useState<string | null>(null);
  const [aiReportMap, setAiReportMap] = useState<Record<string, {
    userName: string;
    totalTasks: number;
    estimatedHours: number;
    currentAssignedHours: number;
    varianceHours: number;
    breakdown: {
      issueId: string;
      issueKey: string;
      title: string;
      currentEstimate: number;
      aiEstimatedHours: number;
      confidence: '높음' | '중간' | '낮음(고위험)';
      complexityFactors: string[];
    }[];
    rebalanceSuggestions: {
      issueKey: string;
      issueSummary: string;
      recommendAssigneeName: string;
      reason: string;
    }[];
  }>>({});

  const handleAiEstimateForUser = (userId: string, userName: string, userIssues: typeof activeSprintIssues) => {
    if (activeAiUserId === userId) {
      setActiveAiUserId(null);
      return;
    }

    if (userIssues.length === 0) {
      addNotification({
        kind: 'system',
        title: '개발 시간 자동 추정',
        text: `${userName} 개발자에게 할당된 작업이 없어 추정할 작업이 없습니다.`
      });
      return;
    }

    const breakdown = userIssues.map((issue) => {
      const titleLower = (issue.summary + ' ' + (issue.description || '')).toLowerCase();
      
      // Factor 1: Base Hours derived from Story Points or Priority
      let baseHours = issue.storyPoints ? issue.storyPoints * 3.5 : (issue.priority === 'highest' ? 12 : 6);
      
      // Factor 2: Subtask Granularity (+1.5h per subtask)
      if (issue.subtasks && issue.subtasks.length > 0) {
        baseHours += issue.subtasks.length * 1.5;
      }

      // Factor 3: Domain Keyword Complexity Multipliers
      const factors: string[] = [];
      if (titleLower.includes('auth') || titleLower.includes('security') || titleLower.includes('oauth') || titleLower.includes('jwt')) {
        baseHours *= 1.35;
        factors.push('보안/인증');
      }
      if (titleLower.includes('db') || titleLower.includes('migration') || titleLower.includes('sql') || titleLower.includes('schema')) {
        baseHours *= 1.25;
        factors.push('DB/스키마');
      }
      if (titleLower.includes('api') || titleLower.includes('refactor') || titleLower.includes('sync')) {
        baseHours *= 1.15;
        factors.push('API/동기화');
      }
      if (issue.subtasks && issue.subtasks.length > 3) {
        factors.push(`서브태스크 ${issue.subtasks.length}개`);
      }

      // Factor 4: Linked PRs/Commits history weight
      if (issue.linkedPRs && issue.linkedPRs.length > 0) {
        baseHours *= 1.1;
        factors.push('연동 PR 포함');
      }

      const currentEst = issue.originalEstimate > 0 ? issue.originalEstimate : (issue.storyPoints ? issue.storyPoints * 4 : 8);
      const aiEst = Math.round(baseHours * 10) / 10;
      
      let confidence: '높음' | '중간' | '낮음(고위험)' = '높음';
      if (aiEst > 16 || factors.length >= 3) {
        confidence = '낮음(고위험)';
      } else if (aiEst > 10 || factors.length >= 1) {
        confidence = '중간';
      }

      return {
        issueId: issue.id,
        issueKey: issue.key,
        title: `${issue.key}: ${issue.summary}`,
        currentEstimate: currentEst,
        aiEstimatedHours: aiEst,
        confidence,
        complexityFactors: factors.length > 0 ? factors : ['표준 난이도']
      };
    });

    const totalEstimated = Math.round(breakdown.reduce((acc, b) => acc + b.aiEstimatedHours, 0));
    const currentAssigned = Math.round(breakdown.reduce((acc, b) => acc + b.currentEstimate, 0));
    const varianceHours = Math.round((totalEstimated - currentAssigned) * 10) / 10;

    // AI Workload Rebalancing Recommendations (If overload predicted)
    const rebalanceSuggestions: {
      issueKey: string;
      issueSummary: string;
      recommendAssigneeName: string;
      reason: string;
    }[] = [];

    const targetUserCapacity = memberCapacities.find((m) => m.user.id === userId);
    if (targetUserCapacity && totalEstimated > targetUserCapacity.maxRecommendedHours) {
      // Find underutilized team members
      const helper = memberCapacities.find(
        (m) => m.user.id !== userId && !m.isOverloaded && m.assignedHours < m.maxRecommendedHours * 0.7
      );

      if (helper && breakdown.length > 0) {
        const heaviestTask = breakdown.reduce((prev, curr) => (curr.aiEstimatedHours > prev.aiEstimatedHours ? curr : prev));
        rebalanceSuggestions.push({
          issueKey: heaviestTask.issueKey,
          issueSummary: heaviestTask.title,
          recommendAssigneeName: helper.user.name,
          reason: `${userName} 개발자 예상 소요시간(${totalEstimated}h)이 수용량(${targetUserCapacity.maxRecommendedHours}h)을 초과함. ${helper.user.name}(여유시간 ${Math.round(helper.maxRecommendedHours - helper.assignedHours)}h)에게 재할당 추천`
        });
      }
    }

    setAiReportMap((prev) => ({
      ...prev,
      [userId]: {
        userName,
        totalTasks: userIssues.length,
        estimatedHours: totalEstimated,
        currentAssignedHours: currentAssigned,
        varianceHours,
        breakdown,
        rebalanceSuggestions
      }
    }));
    setActiveAiUserId(userId);
  };

  // 1-Click Single Task AI Estimate Apply Handler
  const handleApplySingleAiEstimate = (issueId: string, issueKey: string, aiEstimatedHours: number) => {
    if (isViewer) {
      notifyPermissionDenied();
      return;
    }

    updateIssue(issueId, {
      originalEstimate: aiEstimatedHours
    });

    addNotification({
      kind: 'issue',
      title: ' 개발 시간 추정 반영',
      text: `${issueKey} 작업의 산출 소요시간이 ${aiEstimatedHours}시간으로 반영되었습니다.`
    });
  };

  // 1-Click Workload Rebalance Auto Execution Handler
  const handleExecuteRebalance = (issueKey: string, targetAssigneeName: string) => {
    if (isViewer) {
      notifyPermissionDenied();
      return;
    }

    const targetIssue = issues.find((i) => i.key === issueKey);
    const targetUser = users.find((u) => u.name === targetAssigneeName);
    if (!targetIssue || !targetUser) return;

    updateIssue(targetIssue.id, {
      assigneeId: targetUser.id
    });

    addNotification({
      kind: 'system',
      title: '워크로드 재배치 완료',
      text: `${issueKey} 작업이 ${targetUser.name} 개발자에게 실시간 재할당되었습니다.`
    });

    // Close open AI popover so UI refreshes with new workloads
    setActiveAiUserId(null);
  };

  // 1-Click AI Estimation Batch Apply Handler
  const handleApplyAllAiEstimates = (userId: string) => {
    if (isViewer) {
      notifyPermissionDenied();
      return;
    }

    const report = aiReportMap[userId];
    if (!report) return;

    report.breakdown.forEach((item) => {
      updateIssue(item.issueId, {
        originalEstimate: item.aiEstimatedHours
      });
    });

    addNotification({
      kind: 'system',
      title: '개발 시간 일괄 적용 완료',
      text: `${report.userName} 개발자의 작업 ${report.totalTasks}개에 추정 소요시간(${report.estimatedHours}h)이 실제 이슈 데이터에 실시간 반영되었습니다.`
    });
    setActiveAiUserId(null);
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = ['신청자', '유형', '시작일', '종료일', '사유', '상태', '생성일'];
    const rows = leaveRequests.map((req) => {
      const u = users.find((usr) => usr.id === req.userId);
      return [
        u?.name || req.userId,
        req.leaveType,
        req.startDate,
        req.endDate,
        `"${req.reason.replace(/"/g, '""')}"`,
        req.status,
        req.createdAt.split('T')[0]
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `team_leave_capacity_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      kind: 'system',
      title: '📊 내보내기 완료',
      text: '팀 가동률 및 휴가 내역 리포트가 CSV로 다운로드되었습니다.'
    });
  };

  const filteredRequests = leaveRequests.filter((req) => {
    if (filterType === 'ALL') return true;
    return req.status === filterType;
  });

  return (
    <div className="capacity-view">
      {/* Header */}
      <div className="cap-header">
        <div>
          <h1 className="cap-title">
            <IconCalendar size={24} /> 휴가 및 개발 인원 관리
          </h1>
          <p className="cap-subtitle">
            스프린트 개발 가능 시간을 자동 측정하고 Deep Work 한계를 기반으로 하여 과도한 업무(Burnout)를 예방합니다.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-export-sparkle" onClick={handleExportCsv} title="가동률 및 휴가 리포트 다운로드">
            <IconDownload size={15} /> 리포트 내보내기
          </button>
          <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
            <IconPlus size={16} /> 휴가 / 외근 신청
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="cap-metrics-grid">
        <div className="cap-metric-card">
          <span className="metric-icon blue"><IconClock size={20} /></span>
          <div>
            <div className="metric-label">총 팀원 순수 개발 시간</div>
            <div className="metric-value">{totalTeamAvailableHours} 시간 <span className="sub-val">({activeSprint?.name || 'Active Sprint'})</span></div>
          </div>
        </div>

        <div className="cap-metric-card">
          <span className="metric-icon purple"><IconUser size={20} /></span>
          <div>
            <div className="metric-label">현재 스프린트 할당 시간</div>
            <div className="metric-value">{totalTeamAssignedHours} 시간</div>
          </div>
        </div>

        <div className={`cap-metric-card ${overloadedMembersCount > 0 ? 'warning' : 'success'}`}>
          <span className={`metric-icon ${overloadedMembersCount > 0 ? 'red' : 'green'}`}>
            <IconAlertTriangle size={20} />
          </span>
          <div>
            <div className="metric-label">업무 과부하 위험 인원</div>
            <div className="metric-value">
              {overloadedMembersCount > 0 ? (
                <span className="text-red">{overloadedMembersCount} 명 과부하!</span>
              ) : (
                <span className="text-green">전원 적정 부하</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="cap-tabs">
        <button
          className={`cap-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          팀 가동률 & 과부하 현황
        </button>
        <button
          className={`cap-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          휴가 / 외근 신청 및 승인 ({leaveRequests.filter((r) => r.status === 'PENDING').length})
        </button>
        <button
          className={`cap-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          휴가 캘린더
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="cap-content-section">
          <div className="section-header">
            <h3> 개발자 별 실질 개발 시간 (Capacity vs Commitment)</h3>
          </div>

          <div className="member-capacity-list">
            {memberCapacities.map(({ user, assignedIssues, assignedHours, leaveHours, availableHours, maxRecommendedHours, isOverloaded, loadPercentage }) => (
              <div key={user.id} className={`member-capacity-card ${isOverloaded ? 'overloaded' : ''}`}>
                <div className="member-info">
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                  <div>
                    <div className="user-name">
                      {user.name} <span className="user-role">({user.role})</span>
                      {isOverloaded && <span className="badge-overload"> 업무 과부하!</span>}
                    </div>
                    <div className="user-stats">
                      승인된 휴가: <strong className="text-orange">{leaveHours}h</strong> | 개발 가능: <strong>{availableHours}h</strong> (권장 최대: {maxRecommendedHours}h)
                    </div>
                  </div>
                </div>

                <div className="capacity-bar-wrapper">
                  <div className="cap-bar-labels">
                    <span>할당된 업무: <strong>{assignedHours}시간</strong></span>
                    <span className={isOverloaded ? 'text-red' : 'text-green'}>부하율: {loadPercentage}%</span>
                  </div>
                  <div className="cap-bar-track">
                    <div
                      className={`cap-bar-fill ${isOverloaded ? 'bg-red' : loadPercentage > 85 ? 'bg-orange' : 'bg-green'}`}
                      style={{ width: `${Math.min(100, loadPercentage)}%` }}
                    />
                  </div>
                  <div style={{ marginTop: '10px', textAlign: 'right', position: 'relative' }}>
                    <button
                      className="btn-ai-sparkle"
                      onClick={() => handleAiEstimateForUser(user.id, user.name, assignedIssues)}
                    >
                      <IconAiSpark size={14} /> {activeAiUserId === user.id ? '리포트 닫기 ▲' : '개발 소요시간 자동추정 ▼'}
                    </button>

                    {/* Contextual Popover: AI Time Estimation Result */}
                    {activeAiUserId === user.id && aiReportMap[user.id] && (
                      <div className="ai-popover-card">
                        <div className="ai-popover-header">
                          <h4><IconAiSpark size={16} color="#c084fc" /> {user.name} 개발 소요시간 추정 & 분석 리포트</h4>
                          <button className="close-btn-sm" onClick={() => setActiveAiUserId(null)}>✕</button>
                        </div>

                        <div className="ai-metrics-banner">
                          <div className="metric-box">
                            <span className="metric-label">현재 할당시간</span>
                            <strong className="metric-val">{aiReportMap[user.id].currentAssignedHours}h</strong>
                          </div>
                          <div className="metric-arrow"><IconArrowRight size={14} color="#818cf8" /></div>
                          <div className="metric-box highlight">
                            <span className="metric-label">개발 추정 소요시간</span>
                            <strong className="metric-val ai">{aiReportMap[user.id].estimatedHours}h</strong>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">추정 오차 (Variance)</span>
                            <strong className={`metric-val ${aiReportMap[user.id].varianceHours > 0 ? 'text-red' : 'text-green'}`}>
                              {aiReportMap[user.id].varianceHours > 0 ? `+${aiReportMap[user.id].varianceHours}h` : `${aiReportMap[user.id].varianceHours}h`}
                            </strong>
                          </div>
                        </div>

                        {/* AI Workload Rebalance Suggestion Card */}
                        {aiReportMap[user.id].rebalanceSuggestions.length > 0 && (
                          <div className="ai-rebalance-card">
                            <div className="rebalance-title">
                              <IconAlertTriangle size={14} color="#f97316" /> 개발 워크로드 재배치 추천
                            </div>
                            {aiReportMap[user.id].rebalanceSuggestions.map((sug, sIdx) => (
                              <div key={sIdx} className="rebalance-item">
                                <div className="rebalance-item-header">
                                  <span><strong>{sug.issueKey}</strong> <IconArrowRight size={12} color="#fb923c" /> {sug.recommendAssigneeName}에게 재할당 권장</span>
                                  <button
                                    className="btn-xs btn-rebalance-exec"
                                    onClick={() => handleExecuteRebalance(sug.issueKey, sug.recommendAssigneeName)}
                                  >
                                    재할당 실행
                                  </button>
                                </div>
                                <p>{sug.reason}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="ai-task-list-sm">
                          {aiReportMap[user.id].breakdown.map((item, idx) => (
                            <div key={idx} className="ai-task-item-sm">
                              <div className="ai-task-main-info">
                                <span className="ai-task-title-sm">{item.title}</span>
                                <div className="ai-factor-tags">
                                  {item.complexityFactors.map((fac, fIdx) => (
                                    <span key={fIdx} className="factor-tag">{fac}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="ai-task-meta-sm">
                                <span className="est-compare font-mono">
                                  {item.currentEstimate}h <IconArrowRight size={11} color="#94a3b8" /> <strong>{item.aiEstimatedHours}h</strong>
                                </span>
                                <span className={`ai-confidence-badge ${item.confidence === '높음' ? 'high' : item.confidence === '중간' ? 'medium' : 'low'}`}>
                                  {item.confidence}
                                </span>
                                <button
                                  className="btn-xs btn-apply-single"
                                  onClick={() => handleApplySingleAiEstimate(item.issueId, item.issueKey, item.aiEstimatedHours)}
                                  title="이 작업만 추정 시간 반영"
                                >
                                  적용
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="ai-popover-footer">
                          <button
                            className="btn btn-sm btn-primary btn-apply-ai"
                            onClick={() => handleApplyAllAiEstimates(user.id)}
                          >
                            <IconAiSpark size={14} /> 개발 소요 시간 일괄 적용 ({aiReportMap[user.id].estimatedHours}h)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Requests */}
      {activeTab === 'requests' && (
        <div className="cap-content-section">
          <div className="section-header requests-header-bar">
            <h3><IconCalendar size={18} color="#818cf8" /> 휴가 및 외근 신청 내역</h3>
            <div className="filter-pill-group">
              {[
                { type: 'ALL', label: '전체', count: leaveRequests.length, icon: null },
                { type: 'PENDING', label: '승인 대기', count: leaveRequests.filter(r => r.status === 'PENDING').length, icon: <IconClock size={12} color="#eab308" /> },
                { type: 'APPROVED', label: '승인 완료', count: leaveRequests.filter(r => r.status === 'APPROVED').length, icon: <IconCheckCircle size={12} color="#22c55e" /> },
                { type: 'REJECTED', label: '반려됨', count: leaveRequests.filter(r => r.status === 'REJECTED').length, icon: <IconXCircle size={12} color="#ef4444" /> },
              ].map((item) => (
                <button
                  key={item.type}
                  className={`filter-pill-btn ${filterType === item.type ? 'active' : ''}`}
                  onClick={() => setFilterType(item.type)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <span className="pill-count">{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          <table className="requests-table">
            <thead>
              <tr>
                <th>신청자</th>
                <th>유형</th>
                <th>기간</th>
                <th>사유</th>
                <th>상태</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const user = users.find((u) => u.id === req.userId);
                return (
                  <tr key={req.id} className="clickable-row" onClick={() => setSelectedLeaveForDetail(req)}>
                    <td>
                      <div className="table-user">
                        <img src={user?.avatar} alt="" className="avatar-sm" />
                        <span>{user?.name || req.userId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-type ${req.leaveType}`}>
                        {req.leaveType === 'ANNUAL' && <><IconPalmtree size={13} color="#34d399" /> 연차</>}
                        {req.leaveType === 'HALF_AM' && <><IconSun size={13} color="#fbbf24" /> 오전반차</>}
                        {req.leaveType === 'HALF_PM' && <><IconMoon size={13} color="#c084fc" /> 오후반차</>}
                        {req.leaveType === 'OUTSIDE' && <><IconBriefcase size={13} color="#60a5fa" /> 외근</>}
                        {req.leaveType === 'SICK' && <><IconStethoscope size={13} color="#f87171" /> 병가</>}
                        {req.leaveType === 'OTHER' && <><IconStory size={13} color="#9ca3af" /> 기타</>}
                      </span>
                    </td>
                    <td className="font-mono">{req.startDate} ~ {req.endDate}</td>
                    <td className="reason-cell">{req.reason}</td>
                    <td>
                      <span className={`badge-status ${req.status}`}>
                        {req.status === 'APPROVED' && <><IconCheckCircle size={13} color="#22c55e" /> 승인 완료</>}
                        {req.status === 'PENDING' && <><IconClock size={13} color="#eab308" /> 승인 대기중</>}
                        {req.status === 'REJECTED' && <><IconXCircle size={13} color="#ef4444" /> 반려됨</>}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {req.status === 'PENDING' && (
                        isManager ? (
                          <div className="action-buttons">
                            <button className="btn-sm btn-success" onClick={() => handleApprove(req.id)}>
                              <IconCheckCircle size={14} /> 승인
                            </button>
                            <button className="btn-sm btn-danger" onClick={() => handleReject(req.id)}>
                              <IconX size={14} /> 반려
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem', color: '#9ca3af' }}>매니저 승인 대기중</span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Calendar View */}
      {activeTab === 'calendar' && (
        <div className="cap-content-section">
          {(() => {
            const baseDate = new Date();
            baseDate.setDate(1);
            baseDate.setMonth(baseDate.getMonth() + calendarMonthOffset);
            const currentYear = baseDate.getFullYear();
            const currentMonth = baseDate.getMonth() + 1;

            return (
              <>
                <div className="section-header calendar-nav-header">
                  <div className="calendar-title-group">
                    <h3><IconCalendar size={18} color="#818cf8" /> 휴가 캘린더</h3>
                    <div className="month-navigator">
                      <button
                        className="btn-icon month-nav-btn"
                        onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                        title="이전 달"
                      >
                        <IconChevronLeft size={16} />
                      </button>
                      <span className="current-month-display">{currentYear}년 {currentMonth}월</span>
                      <button
                        className="btn-icon month-nav-btn"
                        onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                        title="다음 달"
                      >
                        <IconChevronRight size={16} />
                      </button>
                      {calendarMonthOffset !== 0 && (
                        <button
                          className="btn-sm btn-today-reset"
                          onClick={() => setCalendarMonthOffset(0)}
                        >
                          이번 달로 이동
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="calendar-legend-bar">
                    <span className="legend-item"><IconPalmtree size={12} color="#34d399" /> 연차</span>
                    <span className="legend-item"><IconSun size={12} color="#fbbf24" /> 오전반차</span>
                    <span className="legend-item"><IconMoon size={12} color="#c084fc" /> 오후반차</span>
                    <span className="legend-item"><IconBriefcase size={12} color="#60a5fa" /> 외근</span>
                    <span className="legend-item"><IconStethoscope size={12} color="#f87171" /> 병가</span>
                  </div>
                </div>

                <div className="calendar-grid-clean">
                  {['월', '화', '수', '목', '금'].map((day) => (
                    <div key={day} className="cal-header-cell">{day}</div>
                  ))}
                  {(() => {
                    const days = [];
                    const todayStr = new Date().toISOString().split('T')[0];

                    // First working day of target month
                    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
                    const current = new Date(firstDayOfMonth);

                    // Render up to 20 working days for the full month view
                    for (let i = 0; i < 20; i++) {
                      while (current.getDay() === 0 || current.getDay() === 6) {
                        current.setDate(current.getDate() + 1);
                      }
                      // Break if moved into next month after rendering 3 weeks
                      if (current.getMonth() !== currentMonth - 1 && i >= 15) break;

                      const yyyy = current.getFullYear();
                      const mm = String(current.getMonth() + 1).padStart(2, '0');
                      const dd = String(current.getDate()).padStart(2, '0');
                      const dateStr = `${yyyy}-${mm}-${dd}`;

                      const dayNum = current.getDate();
                      const monthNum = current.getMonth() + 1;
                      const isToday = dateStr === todayStr;
                      const isDifferentMonth = current.getMonth() !== currentMonth - 1;

                      const dayLeaves = leaveRequests.filter(
                        (r) => r.status === 'APPROVED' && r.startDate <= dateStr && r.endDate >= dateStr
                      );

                      days.push(
                        <div
                          key={dateStr}
                          className={`cal-day-card ${isToday ? 'is-today' : ''} ${dayLeaves.length > 0 ? 'has-leaves' : ''} ${isDifferentMonth ? 'diff-month' : ''}`}
                        >
                          <div className="cal-date-header">
                            <span className="cal-date-text">
                              {isDifferentMonth || monthNum !== currentMonth ? `${monthNum}/${dayNum}` : `${dayNum}일`}
                            </span>
                            {isToday && <span className="today-badge">오늘</span>}
                          </div>

                          <div className="cal-leaves-container">
                            {dayLeaves.length === 0 ? (
                              <div className="cal-empty-state">부재 없음</div>
                            ) : (
                              dayLeaves.map((leave) => {
                                const u = users.find((usr) => usr.id === leave.userId);
                                return (
                                  <div
                                    key={leave.id}
                                    className={`cal-compact-chip type-${leave.leaveType}`}
                                    onClick={() => setSelectedLeaveForDetail(leave)}
                                    title={`${u?.name} (${leave.leaveType}): ${leave.reason} [${leave.startDate}~${leave.endDate}]`}
                                  >
                                    <img src={u?.avatar} alt="" className="chip-user-avatar" />
                                    <span className="chip-user-name">{u?.name}</span>
                                    <span className="chip-icon-wrapper">
                                      {leave.leaveType === 'ANNUAL' && <IconPalmtree size={12} color="#34d399" />}
                                      {leave.leaveType === 'HALF_AM' && <IconSun size={12} color="#fbbf24" />}
                                      {leave.leaveType === 'HALF_PM' && <IconMoon size={12} color="#c084fc" />}
                                      {leave.leaveType === 'OUTSIDE' && <IconBriefcase size={12} color="#60a5fa" />}
                                      {leave.leaveType === 'SICK' && <IconStethoscope size={12} color="#f87171" />}
                                      {leave.leaveType === 'OTHER' && <IconStory size={12} color="#9ca3af" />}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                      current.setDate(current.getDate() + 1);
                    }
                    return days;
                  })()}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Modal: Apply Leave (Rendered via Portal to blur full viewport seamlessly) */}
      {showApplyModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><IconCalendar size={20} color="#818cf8" /> 휴가 및 외근 신청</h2>
              <button className="close-btn" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <form onSubmit={handleApplyLeave} className="leave-form">
              <div className="form-group">
                <label className="form-label">
                  <IconUser size={14} /> 신청 대상 개발자
                </label>
                <select className="form-input" value={applicantUserId} onChange={(e) => setApplicantUserId(e.target.value)}>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <IconClock size={14} /> 신청 유형 선택
                </label>
                <div className="leave-type-tile-grid">
                  {[
                    { type: 'ANNUAL', label: '연차 (8h)', icon: <IconPalmtree size={18} color="#34d399" />, desc: '전일 휴가' },
                    { type: 'HALF_AM', label: '오전 반차 (4h)', icon: <IconSun size={18} color="#fbbf24" />, desc: '오전 부재' },
                    { type: 'HALF_PM', label: '오후 반차 (4h)', icon: <IconMoon size={18} color="#c084fc" />, desc: '오후 부재' },
                    { type: 'OUTSIDE', label: '외근 (4h)', icon: <IconBriefcase size={18} color="#60a5fa" />, desc: '외부 업무' },
                    { type: 'SICK', label: '병가 (8h)', icon: <IconStethoscope size={18} color="#f87171" />, desc: '질병/치료' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      className={`leave-type-tile ${leaveType === item.type ? 'active' : ''}`}
                      onClick={() => setLeaveType(item.type as LeaveType)}
                    >
                      <div className="tile-icon-box">{item.icon}</div>
                      <div className="tile-info">
                        <span className="tile-label">{item.label}</span>
                        <span className="tile-desc">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">시작일</label>
                  <input className="form-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">종료일</label>
                  <input className="form-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">신청 사유 및 목적</label>
                <textarea
                  className="form-input textarea"
                  placeholder="휴가 사유 또는 외근 세부 목적을 입력하세요..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  <IconPlus size={16} /> 신청 완료
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Leave Request Details */}
      {selectedLeaveForDetail && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedLeaveForDetail(null)}>
          <div className="modal-content modal-content-lg leave-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <IconCalendar size={20} color="#818cf8" /> 휴가 / 부재 상세 정보
              </h2>
              <button className="close-btn" onClick={() => setSelectedLeaveForDetail(null)}>✕</button>
            </div>

            <div className="modal-body leave-detail-body">
              {(() => {
                const targetUser = users.find((u) => u.id === selectedLeaveForDetail.userId);
                const approverUser = selectedLeaveForDetail.approverId
                  ? users.find((u) => u.id === selectedLeaveForDetail.approverId)
                  : null;

                return (
                  <>
                    <div className="detail-user-banner">
                      <img src={targetUser?.avatar} alt="" className="detail-user-avatar" />
                      <div>
                        <div className="detail-user-name">{targetUser?.name || selectedLeaveForDetail.userId}</div>
                        <div className="detail-user-role">{targetUser?.role} • {targetUser?.email}</div>
                      </div>
                      <span className={`badge-status ${selectedLeaveForDetail.status}`} style={{ marginLeft: 'auto' }}>
                        {selectedLeaveForDetail.status === 'APPROVED' && <><IconCheckCircle size={14} color="#22c55e" /> 승인 완료</>}
                        {selectedLeaveForDetail.status === 'PENDING' && <><IconClock size={14} color="#eab308" /> 승인 대기중</>}
                        {selectedLeaveForDetail.status === 'REJECTED' && <><IconXCircle size={14} color="#ef4444" /> 반려됨</>}
                      </span>
                    </div>

                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">신청 유형</span>
                        <div className="detail-value">
                          <span className={`badge-type ${selectedLeaveForDetail.leaveType}`}>
                            {selectedLeaveForDetail.leaveType === 'ANNUAL' && <><IconPalmtree size={14} color="#34d399" /> 연차 (전일 8h)</>}
                            {selectedLeaveForDetail.leaveType === 'HALF_AM' && <><IconSun size={14} color="#fbbf24" /> 오전 반차 (4h)</>}
                            {selectedLeaveForDetail.leaveType === 'HALF_PM' && <><IconMoon size={14} color="#c084fc" /> 오후 반차 (4h)</>}
                            {selectedLeaveForDetail.leaveType === 'OUTSIDE' && <><IconBriefcase size={14} color="#60a5fa" /> 외근 (4h)</>}
                            {selectedLeaveForDetail.leaveType === 'SICK' && <><IconStethoscope size={14} color="#f87171" /> 병가 (전일 8h)</>}
                            {selectedLeaveForDetail.leaveType === 'OTHER' && <><IconStory size={14} color="#9ca3af" /> 기타</>}
                          </span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">기간 및 일시</span>
                        <div className="detail-value font-mono">
                          {selectedLeaveForDetail.startDate} ~ {selectedLeaveForDetail.endDate}
                        </div>
                      </div>

                      <div className="detail-item full-width">
                        <span className="detail-label">신청 사유</span>
                        <div className="detail-value reason-box">
                          {selectedLeaveForDetail.reason}
                        </div>
                      </div>

                      {approverUser && (
                        <div className="detail-item full-width">
                          <span className="detail-label">결재자 정보</span>
                          <div className="detail-value approver-info">
                            <img src={approverUser.avatar} alt="" className="avatar-xs" />
                            <span>{approverUser.name} ({approverUser.role})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {selectedLeaveForDetail.status === 'PENDING' && isManager && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleApprove(selectedLeaveForDetail.id);
                        setSelectedLeaveForDetail(null);
                      }}
                    >
                      <IconCheckCircle size={15} /> 승인하기
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleReject(selectedLeaveForDetail.id);
                        setSelectedLeaveForDetail(null);
                      }}
                    >
                      <IconX size={15} /> 반려하기
                    </button>
                  </div>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => setSelectedLeaveForDetail(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
