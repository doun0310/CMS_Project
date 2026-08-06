import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAether } from '../../context/AetherContextValue';
import type { LeaveRequest, LeaveType } from '../../types/Aether';
import { canApproveLeave } from '../../utils/permissions';
import {
  IconCalendar,
  IconCheckCircle,
  IconX,
  IconUser,
  IconClock,
  IconAlertTriangle,
  IconPlus,
  IconFilter,
  IconDownload,
  IconAiSpark
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
  const { users, sprints, issues, currentUser, addNotification } = useAether();

  const isManager = currentUser ? canApproveLeave(currentUser) : true;

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'calendar'>('overview');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Supabase Initial Fetch & Realtime WebSocket Subscription
  React.useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchLeaveRequestsFromSupabase().then((data) => {
      if (data && data.length > 0) {
        setLeaveRequests(data);
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

    const assignedIssues = activeSprintIssues.filter((i) => i.assigneeId === user.id);
    const assignedHours = assignedIssues.reduce((acc, i) => {
      const estimate = i.originalEstimate > 0 ? i.originalEstimate : (i.storyPoints ? i.storyPoints * 4 : 8);
      return acc + estimate;
    }, 0);
    
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
        title: '⚠️ 팀원 업무 과부하(Burnout) 경고',
        text: `다음 팀원의 업무량이 가동 수용량을 초과했습니다: ${names}`
      });
    }
  }, [overloadedMembersCount]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

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
    syncLeaveRequestToSupabase(newRequest);
    setShowApplyModal(false);
    setReason('');
  };

  const handleApprove = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const updated = { ...req, status: 'APPROVED' as const, approverId: currentUser?.id };
          syncLeaveRequestToSupabase(updated);
          return updated;
        }
        return req;
      })
    );
  };

  const handleReject = (id: string) => {
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

  // AI Estimation State & Handler (Toggles per user)
  const [activeAiUserId, setActiveAiUserId] = useState<string | null>(null);
  const [aiReportMap, setAiReportMap] = useState<Record<string, {
    userName: string;
    totalTasks: number;
    estimatedHours: number;
    breakdown: { title: string; hours: number; confidence: string }[];
  }>>({});

  const handleAiEstimateForUser = (userId: string, userName: string, userIssues: typeof activeSprintIssues) => {
    if (activeAiUserId === userId) {
      setActiveAiUserId(null);
      return;
    }

    if (userIssues.length === 0) {
      addNotification({
        kind: 'system',
        title: '🤖 AI 시간 추정',
        text: `${userName} 개발자에게 할당된 작업이 없어 추정할 작업이 없습니다.`
      });
      return;
    }

    const breakdown = userIssues.map((issue) => {
      const titleLower = issue.summary.toLowerCase();
      let baseHours = issue.storyPoints ? issue.storyPoints * 3.5 : 6;
      if (titleLower.includes('auth') || titleLower.includes('security') || titleLower.includes('db')) {
        baseHours *= 1.3;
      }
      const calculatedHours = Math.round(baseHours * 10) / 10;
      return {
        title: `${issue.key}: ${issue.summary}`,
        hours: calculatedHours,
        confidence: calculatedHours > 12 ? '중간(복잡성 높음)' : '높음'
      };
    });

    const totalHours = Math.round(breakdown.reduce((acc, b) => acc + b.hours, 0));

    setAiReportMap((prev) => ({
      ...prev,
      [userId]: {
        userName,
        totalTasks: userIssues.length,
        estimatedHours: totalHours,
        breakdown
      }
    }));
    setActiveAiUserId(userId);
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
            <IconCalendar size={24} /> 휴가 및 가동 인원 관리
          </h1>
          <p className="cap-subtitle">
            스프린트 가동 가능 시간을 자동 측정하고 Deep Work 한계 기반으로 과도한 업무(Burnout)를 예방합니다.
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
            <div className="metric-label">팀 총 순수 가동시간</div>
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
          휴가 캘린더 View
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="cap-content-section">
          <div className="section-header">
            <h3>👨‍💻 개발자별 실질 가동 시간 (Capacity vs Commitment)</h3>
            <span className="badge-info">Deep Work 권장 한계: 일 5.5시간 기준</span>
          </div>

          <div className="member-capacity-list">
            {memberCapacities.map(({ user, assignedIssues, assignedHours, leaveHours, availableHours, maxRecommendedHours, isOverloaded, loadPercentage }) => (
              <div key={user.id} className={`member-capacity-card ${isOverloaded ? 'overloaded' : ''}`}>
                <div className="member-info">
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                  <div>
                    <div className="user-name">
                      {user.name} <span className="user-role">({user.role})</span>
                      {isOverloaded && <span className="badge-overload">🔴 업무 과부하!</span>}
                    </div>
                    <div className="user-stats">
                      승인된 휴가: <strong className="text-orange">{leaveHours}h</strong> | 가동 가능: <strong>{availableHours}h</strong> (권장 최대: {maxRecommendedHours}h)
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
                      <IconAiSpark size={14} /> {activeAiUserId === user.id ? '리포트 닫기 ▲' : 'AI 소요시간 자동추정 ▼'}
                    </button>

                    {/* Contextual Popover: AI Time Estimation Result */}
                    {activeAiUserId === user.id && aiReportMap[user.id] && (
                      <div className="ai-popover-card">
                        <div className="ai-popover-header">
                          <h4><IconAiSpark size={16} color="#c084fc" /> {user.name} AI 추정 리포트</h4>
                          <button className="close-btn-sm" onClick={() => setActiveAiUserId(null)}>✕</button>
                        </div>
                        <div className="ai-summary-banner-sm">
                          <span>총 AI 추정 소요시간</span>
                          <strong>약 {aiReportMap[user.id].estimatedHours}시간</strong>
                        </div>
                        <div className="ai-task-list-sm">
                          {aiReportMap[user.id].breakdown.map((item, idx) => (
                            <div key={idx} className="ai-task-item-sm">
                              <span className="ai-task-title-sm">{item.title}</span>
                              <div className="ai-task-meta-sm">
                                <strong>{item.hours}h</strong>
                                <span className={`ai-confidence-badge ${item.confidence.includes('중간') ? 'medium' : 'high'}`}>
                                  {item.confidence}
                                </span>
                              </div>
                            </div>
                          ))}
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
          <div className="section-header">
            <h3>📑 휴가 및 외근 신청 내역</h3>
            <div className="filter-group">
              <IconFilter size={16} />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="ALL">전체 상태</option>
                <option value="PENDING">승인 대기중</option>
                <option value="APPROVED">승인 완료</option>
                <option value="REJECTED">반려됨</option>
              </select>
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
                  <tr key={req.id}>
                    <td>
                      <div className="table-user">
                        <img src={user?.avatar} alt="" className="avatar-sm" />
                        <span>{user?.name || req.userId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-type ${req.leaveType}`}>
                        {req.leaveType === 'ANNUAL' && '🏖️ 연차'}
                        {req.leaveType === 'HALF_AM' && '🌅 오전반차'}
                        {req.leaveType === 'HALF_PM' && '🌇 오후반차'}
                        {req.leaveType === 'OUTSIDE' && '💼 외근'}
                        {req.leaveType === 'SICK' && '🤒 병가'}
                        {req.leaveType === 'OTHER' && '📋 기타'}
                      </span>
                    </td>
                    <td className="font-mono">{req.startDate} ~ {req.endDate}</td>
                    <td>{req.reason}</td>
                    <td>
                      <span className={`badge-status ${req.status}`}>
                        {req.status === 'APPROVED' && '승인됨'}
                        {req.status === 'PENDING' && '대기중'}
                        {req.status === 'REJECTED' && '반려됨'}
                      </span>
                    </td>
                    <td>
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
          <div className="section-header">
            <h3>📅 스프린트 부재 일정 캘린더 ({activeSprint?.name || 'Active Sprint'})</h3>
          </div>
          <div className="calendar-grid-mock">
            {['월', '화', '수', '목', '금'].map((day) => (
              <div key={day} className="cal-header-cell">{day}요일</div>
            ))}
            {(() => {
              // Generate days dynamically from activeSprint or current date range
              const days = [];
              const start = activeSprint?.startDate ? new Date(activeSprint.startDate) : new Date('2026-08-03T00:00:00');
              const current = new Date(start);

              for (let i = 0; i < 15; i++) {
                while (current.getDay() === 0 || current.getDay() === 6) {
                  current.setDate(current.getDate() + 1);
                }
                const dateStr = current.toISOString().split('T')[0];
                const dayNum = current.getDate();
                const monthNum = current.getMonth() + 1;

                const dayLeaves = leaveRequests.filter(
                  (r) => r.status === 'APPROVED' && r.startDate <= dateStr && r.endDate >= dateStr
                );

                days.push(
                  <div key={dateStr} className="cal-day-cell">
                    <div className="cal-date-num">{monthNum}/{dayNum}</div>
                    {dayLeaves.map((leave) => {
                      const u = users.find((usr) => usr.id === leave.userId);
                      return (
                        <div key={leave.id} className={`cal-leave-tag ${leave.leaveType}`}>
                          {u?.name}: {leave.reason}
                        </div>
                      );
                    })}
                  </div>
                );
                current.setDate(current.getDate() + 1);
              }
              return days;
            })()}
          </div>
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
                  <IconClock size={14} /> 신청 유형
                </label>
                <select className="form-input" value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)}>
                  <option value="ANNUAL">🏖️ 연차 (전일 8시간)</option>
                  <option value="HALF_AM">🌅 오전 반차 (4시간)</option>
                  <option value="HALF_PM">🌇 오후 반차 (4시간)</option>
                  <option value="OUTSIDE">💼 외근 (4시간)</option>
                  <option value="SICK">🤒 병가 (전일 8시간)</option>
                </select>
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
    </div>
  );
};
