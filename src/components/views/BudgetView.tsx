import React, { useEffect, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { ProjectBudget, MemberHourlyRate, ProjectExpense, BudgetSummary } from '../../types/Aether';
import {
  fetchProjectBudget,
  saveProjectBudget,
  fetchMemberHourlyRates,
  saveMemberHourlyRate,
  fetchProjectExpenses,
  addProjectExpense,
  deleteProjectExpense
} from '../../services/budgetService';
import { calculateBudgetSummary, formatCurrency } from '../../utils/budgetCalculator';
import { BudgetSetupModal } from '../modals/BudgetSetupModal';
import { MemberRateModal } from '../modals/MemberRateModal';
import { ExpenseModal } from '../modals/ExpenseModal';
import {
  IconBudget,
  IconShield,
  IconAlertTriangle,
  IconPlus,
  IconTrash,
  IconUser,
  IconBriefcase,
  IconCreditCard,
  IconCheckCircle,
  IconTarget,
  IconClock,
  IconZap,
  IconPieChart,
  IconActivity,
  IconServer,
  IconCode,
  IconHandshake,
  IconPackage,
  IconSettings,
  IconCalendar
} from '../common/Icons';
import '../../styles/budgetView.css';

export const BudgetView: React.FC = () => {
  const { currentProject, currentUser, users, issues } = useAether();

  const [budget, setBudget] = useState<ProjectBudget | null>(null);
  const [rates, setRates] = useState<MemberHourlyRate[]>([]);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Check Role-Based Access Control
  const userRole = currentUser.projectRole || currentUser.role || 'Project Member';
  const isAuthorized =
    userRole === 'Project Owner' ||
    userRole === 'Project Manager' ||
    userRole === 'Executive' ||
    userRole === 'Developer' ||
    currentUser.id === 'u1';

  useEffect(() => {
    let isMounted = true;
    async function loadBudgetData() {
      setLoading(true);
      try {
        const [bgt, rts, exps] = await Promise.all([
          fetchProjectBudget(currentProject.id),
          fetchMemberHourlyRates(currentProject.id),
          fetchProjectExpenses(currentProject.id)
        ]);
        if (isMounted) {
          setBudget(bgt);
          setRates(rts);
          setExpenses(exps);
        }
      } catch (err) {
        console.error('Failed to load budget data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBudgetData();
    return () => {
      isMounted = false;
    };
  }, [currentProject.id]);

  if (!isAuthorized) {
    return (
      <div className="budget-view-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(220, 38, 38, 0.08) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          marginBottom: 14,
          boxShadow: '0 6px 18px rgba(239, 68, 68, 0.12)'
        }}>
          <IconShield size={28} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>접근 권한 제한 (Secured View)</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 440, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          프로젝트 예산 및 시급 관리 화면은 보안 관리를 위해 <strong>Project Owner</strong> 및 <strong>Project Manager</strong> 권한 보유자에게만 제공됩니다.
        </p>
      </div>
    );
  }

  if (loading || !budget) {
    return (
      <div className="budget-view-container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, gap: 10, color: 'var(--text-secondary)' }}>
        <div className="auth-spinner" style={{ width: 22, height: 22, borderWidth: 2.5 }} />
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>예산 지표 데이터 불러오는 중...</span>
      </div>
    );
  }

  const summary: BudgetSummary = calculateBudgetSummary(budget, rates, expenses, issues);

  const handleSaveBudget = async (updated: ProjectBudget) => {
    setBudget(updated);
    await saveProjectBudget(updated);
  };

  const handleSaveRate = async (updatedRate: MemberHourlyRate) => {
    const updatedRates = await saveMemberHourlyRate(updatedRate);
    setRates(updatedRates);
  };

  const handleAddExpense = async (exp: Omit<ProjectExpense, 'id'>) => {
    const updatedExps = await addProjectExpense(exp);
    setExpenses(updatedExps);
  };

  const handleDeleteExpense = async (id: string) => {
    const updatedExps = await deleteProjectExpense(currentProject.id, id);
    setExpenses(updatedExps);
  };

  const categoryLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    infrastructure: { label: '서버 & 인프라', color: '#6366f1', icon: <IconServer size={13} color="#6366f1" /> },
    software: { label: '소프트웨어 툴', color: '#10b981', icon: <IconCode size={13} color="#10b981" /> },
    outsourcing: { label: '외주 용역비', color: '#f59e0b', icon: <IconHandshake size={13} color="#f59e0b" /> },
    other: { label: '기타 지출', color: '#64748b', icon: <IconPackage size={13} color="#64748b" /> }
  };

  return (
    <div className="budget-view-container animate-fade-in">
      {/* Compact View Header Bar */}
      <div className="board-header budget-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            boxShadow: '0 3px 12px rgba(99, 102, 241, 0.15)',
            flexShrink: 0
          }}>
            <IconBudget size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="view-title" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                프로젝트 예산 및 소요 금액 관리
              </h1>
              <span className="link-badge" style={{ fontSize: 10.5, background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '2px 7px' }}>
                EXECUTIVE / PO ONLY
              </span>
            </div>
            <p className="view-subtitle" style={{ fontSize: 12, margin: '2px 0 0' }}>
              {currentProject.name} 수주 예산, 실시간 인건비(시급) 및 고정 운영 지출을 추적하고 소진 곡선을 모니터링합니다.
            </p>
          </div>
        </div>

        <div className="board-controls" style={{ gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setIsBudgetModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, fontSize: 12.5 }}>
            <IconSettings size={14} color="#6366f1" />
            예산 설정
          </button>
          <button className="btn btn-secondary" onClick={() => setIsRateModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, fontSize: 12.5 }}>
            <IconUser size={14} color="#6366f1" />
            시급 설정
          </button>
          <button className="btn btn-primary" onClick={() => setIsExpenseModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 8, fontSize: 12.5 }}>
            <IconPlus size={14} />
            지출 항목 추가
          </button>
        </div>
      </div>

      {/* Risk Alert Banner */}
      {summary.riskMessage && (
        <div className={`budget-risk-banner ${summary.riskLevel}`}>
          <IconAlertTriangle size={20} color={summary.riskLevel === 'danger' ? '#ef4444' : '#f59e0b'} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 1 }}>
              {summary.riskLevel === 'danger' ? '예산 초과 위험 경고 (Budget Overrun Warning)' : '예산 빠른 소진 주의'}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{summary.riskMessage}</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5, borderColor: summary.riskLevel === 'danger' ? '#ef4444' : '#f59e0b', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}
            onClick={() => setIsBudgetModalOpen(true)}
          >
            <IconSettings size={12} color="currentColor" />
            예산 조정
          </button>
        </div>
      )}

      {/* Compact KPI Summary Cards */}
      <div className="budget-kpi-grid">
        {/* Total Budget Card */}
        <div className="budget-card">
          <div className="budget-card-title">
            <span>총 수주 예산</span>
            <div className="budget-card-icon-box" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <IconCreditCard size={15} />
            </div>
          </div>
          <div className="budget-card-value">
            {formatCurrency(summary.totalBudget, summary.currency)}
          </div>
          <div className="budget-card-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <IconCalendar size={13} color="var(--text-tertiary)" />
            <span>계획 기간: {budget.startDate} ~ {budget.endDate}</span>
          </div>
        </div>

        {/* Actual Spend Card */}
        <div className="budget-card">
          <div className="budget-card-title">
            <span>실제 소요 금액 (Current Spend)</span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              background: summary.burnRatePercent > 100 ? 'rgba(239, 68, 68, 0.16)' : 'rgba(99, 102, 241, 0.16)',
              color: summary.burnRatePercent > 100 ? '#ef4444' : '#6366f1',
              border: summary.burnRatePercent > 100 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              소진율 {summary.burnRatePercent}%
            </span>
          </div>
          <div className="budget-card-value" style={{ color: summary.burnRatePercent > 100 ? '#ef4444' : 'var(--text-primary)' }}>
            {formatCurrency(summary.totalSpend, summary.currency)}
          </div>
          <div className="budget-card-sub" style={{ gap: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <IconUser size={13} color="#6366f1" /> 인건비: <strong>{formatCurrency(summary.laborSpend, summary.currency)}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <IconBriefcase size={13} color="#f59e0b" /> 고정비: <strong>{formatCurrency(summary.operationalSpend, summary.currency)}</strong>
            </span>
          </div>
        </div>

        {/* Remaining Budget Card */}
        <div className="budget-card">
          <div className="budget-card-title">
            <span>잔여 예산 (Remaining)</span>
            <div className="budget-card-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <IconCheckCircle size={15} />
            </div>
          </div>
          <div className="budget-card-value" style={{ color: summary.remainingBudget < 0 ? '#ef4444' : '#10b981' }}>
            {formatCurrency(summary.remainingBudget, summary.currency)}
          </div>
          <div style={{ width: '100%', height: 5, background: 'var(--bg-tertiary)', borderRadius: 999, marginTop: 8, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(0, summary.burnRatePercent))}%`,
                height: '100%',
                background: summary.burnRatePercent > 90 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : summary.burnRatePercent > 70 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #10b981, #059669)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* Projected Spend Card */}
        <div className="budget-card">
          <div className="budget-card-title">
            <span>최종 예측 집행액 (Projected)</span>
            <div className="budget-card-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <IconTarget size={15} />
            </div>
          </div>
          <div className="budget-card-value" style={{ color: summary.projectedTotalSpend > summary.totalBudget ? '#ef4444' : '#3b82f6' }}>
            {formatCurrency(summary.projectedTotalSpend, summary.currency)}
          </div>
          <div className="budget-card-sub" style={{ color: summary.projectedTotalSpend > summary.totalBudget ? '#ef4444' : '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {summary.projectedTotalSpend > summary.totalBudget ? (
              <>
                <IconAlertTriangle size={13} color="#ef4444" />
                <span>수주 예산 대비 +{formatCurrency(summary.projectedTotalSpend - summary.totalBudget, summary.currency)} 초과</span>
              </>
            ) : (
              <>
                <IconCheckCircle size={13} color="#10b981" />
                <span>수주 예산 내 안착 예상</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Spend Curve Chart & Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
        {/* Planned vs Actual Spend Curve Chart */}
        <div className="budget-section-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 className="section-title-with-icon" style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>
                <IconActivity size={16} color="#6366f1" />
                <span>목표 예산 소진 곡선 (Spend Burn-down Curve)</span>
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-secondary)' }}>
                계획 곡선(Planned) 대 실 집행액(Actual) 및 추정 곡선(Projected) 비교
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }} /> 계획
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6366f1' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} /> 실제
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#ef4444' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> 예측
              </span>
            </div>
          </div>

          {/* Compact SVG Line Chart */}
          <div style={{ width: '100%', height: 170, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="spendGradientCompact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="15" x2="500" y2="15" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="55" x2="500" y2="55" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="95" x2="500" y2="95" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="135" x2="500" y2="135" stroke="var(--border-color)" strokeWidth="1" />

              {/* Area Fill under Curve */}
              <polygon
                fill="url(#spendGradientCompact)"
                points={`0,135 ${summary.targetSpendCurve
                  .map((p, idx) => {
                    const x = (idx / (summary.targetSpendCurve.length - 1)) * 500;
                    const val = p.projected !== undefined ? p.projected : p.actual;
                    const y = 135 - (val / (budget.totalBudget || 1)) * 115;
                    return `${x},${Math.max(10, y)}`;
                  })
                  .join(' ')} 500,135`}
              />

              {/* Planned Line (Dashed) */}
              <polyline
                fill="none"
                stroke="var(--text-tertiary, #cbd5e1)"
                strokeWidth="2"
                strokeDasharray="5,4"
                points={summary.targetSpendCurve
                  .map((p, idx) => {
                    const x = (idx / (summary.targetSpendCurve.length - 1)) * 500;
                    const y = 135 - (p.planned / (budget.totalBudget || 1)) * 115;
                    return `${x},${Math.max(10, y)}`;
                  })
                  .join(' ')}
              />

              {/* Actual & Projected Line (Solid) */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={summary.targetSpendCurve
                  .map((p, idx) => {
                    const x = (idx / (summary.targetSpendCurve.length - 1)) * 500;
                    const val = p.projected !== undefined ? p.projected : p.actual;
                    const y = 135 - (val / (budget.totalBudget || 1)) * 115;
                    return `${x},${Math.max(10, y)}`;
                  })
                  .join(' ')}
              />

              {/* Data Points */}
              {summary.targetSpendCurve.map((p, idx) => {
                const x = (idx / (summary.targetSpendCurve.length - 1)) * 500;
                const val = p.projected !== undefined ? p.projected : p.actual;
                const y = Math.max(10, 135 - (val / (budget.totalBudget || 1)) * 115);
                const isProjected = p.projected !== undefined;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={isProjected ? '#ef4444' : '#6366f1'}
                    stroke="var(--card-bg, #ffffff)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: 'var(--text-secondary)', fontSize: 10.5, fontWeight: 600 }}>
              {summary.targetSpendCurve.map((p, idx) => (
                <span key={idx}>{p.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className="budget-section-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 className="section-title-with-icon" style={{ margin: '0 0 3px', fontSize: 14.5, fontWeight: 700 }}>
            <IconPieChart size={16} color="#6366f1" />
            <span>비용 항목별 분배</span>
          </h3>
          <p style={{ margin: '0 0 14px', fontSize: 11.5, color: 'var(--text-secondary)' }}>인건비 및 운영비 지출 비율</p>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
            {/* Labor Spend Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, color: 'var(--text-primary)' }}>
                  <IconUser size={13} color="#6366f1" /> 팀원 인건비
                </span>
                <span style={{ fontWeight: 700, color: '#6366f1' }}>{formatCurrency(summary.laborSpend, summary.currency)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${summary.totalSpend > 0 ? (summary.laborSpend / summary.totalSpend) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: 4 }} />
              </div>
            </div>

            {/* Expenses Categories */}
            {Object.entries(categoryLabels).map(([catKey, config]) => {
              const catTotal = expenses
                .filter(e => e.category === catKey)
                .reduce((acc, curr) => acc + curr.amount, 0);
              const pct = summary.totalSpend > 0 ? (catTotal / summary.totalSpend) * 100 : 0;

              return (
                <div key={catKey}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {config.icon} {config.label}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(catTotal, summary.currency)}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: config.color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Member Hourly Rates Table */}
      <div className="budget-section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 className="section-title-with-icon" style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>
              <IconUser size={16} color="#6366f1" />
              <span>팀원별 시급 & 투입 소요 금액 현황</span>
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-secondary)' }}>
              팀원 시간 기록(`loggedHours`)에 기반한 인건비 집행 상세 내역
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsRateModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, borderRadius: 7, padding: '5px 12px', fontSize: 12 }}>
            <IconUser size={13} color="#6366f1" />
            시급 설정
          </button>
        </div>

        <div className="budget-table-container">
          <table className="budget-table">
            <thead>
              <tr>
                <th>팀원</th>
                <th>역할</th>
                <th>시간당 인건비 (시급)</th>
                <th>로그 기록 시간</th>
                <th style={{ textAlign: 'right' }}>누적 집행 인건비</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const r = rates.find(rate => rate.userId === u.id);
                const hourlyRate = r ? r.hourlyRate : 50000;
                const loggedHours = issues
                  .filter(i => i.assigneeId === u.id)
                  .reduce((acc, curr) => acc + (curr.timeLogged || (curr.status === 'done' ? curr.originalEstimate || 8 : 0)), 0);
                const memberCost = loggedHours * hourlyRate;

                return (
                  <tr key={u.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                      ) : (
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11.5 }}>
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{u.name}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>{u.email}</div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{u.role}</td>
                    <td style={{ fontWeight: 600, color: '#3b82f6', fontSize: 12.5 }}>
                      {formatCurrency(hourlyRate, summary.currency)} / hr
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 12.5 }}>
                      {loggedHours} 시간
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
                      {formatCurrency(memberCost, summary.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Expenses Table */}
      <div className="budget-section-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 className="section-title-with-icon" style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>
              <IconBriefcase size={16} color="#6366f1" />
              <span>운영비 및 고정 지출 내역 (Operational Expenses)</span>
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-secondary)' }}>
              서버, SaaS 툴 구독, 외주 컨설팅 지출 항목
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsExpenseModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, borderRadius: 7, padding: '5px 14px', fontSize: 12 }}>
            <IconPlus size={13} /> 지출 항목 추가
          </button>
        </div>

        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
            등록된 고정 지출 내역이 없습니다.
          </div>
        ) : (
          <div className="budget-table-container">
            <table className="budget-table">
              <thead>
                <tr>
                  <th>항목명</th>
                  <th>카테고리</th>
                  <th>발생 방식</th>
                  <th>발생/등록일</th>
                  <th style={{ textAlign: 'right' }}>금액</th>
                  <th style={{ width: 54, textAlign: 'center' }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => {
                  const catInfo = categoryLabels[exp.category] || categoryLabels.other;
                  return (
                    <tr key={exp.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{exp.title}</div>
                        {exp.description && <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{exp.description}</div>}
                      </td>
                      <td>
                        <span className="budget-category-badge" style={{ background: `${catInfo.color}15`, color: catInfo.color, border: `1px solid ${catInfo.color}30` }}>
                          {catInfo.icon} {catInfo.label}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {exp.recurringType === 'monthly' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 500 }}>
                            <IconClock size={12} color="#6366f1" /> 매월 정기
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 500 }}>
                            <IconZap size={12} color="#f59e0b" /> 1회성
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 11.5 }}>{exp.expenseDate}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
                        {formatCurrency(exp.amount, summary.currency)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="budget-trash-btn"
                          onClick={() => handleDeleteExpense(exp.id)}
                          title="지출 항목 삭제"
                          aria-label="Delete expense"
                        >
                          <IconTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <BudgetSetupModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budget={budget}
        onSave={handleSaveBudget}
      />
      <MemberRateModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        users={users}
        rates={rates}
        onSaveRate={handleSaveRate}
      />
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        projectId={currentProject.id}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
};
