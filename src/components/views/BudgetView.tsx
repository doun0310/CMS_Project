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
import { IconShield, IconAlertTriangle, IconPlus, IconTrash } from '../common/Icons';
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

  // Check Role-Based Access Control (PO or PM or Dev/Demo)
  const userRole = currentUser.projectRole || currentUser.role || 'Project Member';
  const isAuthorized =
    userRole === 'Project Owner' ||
    userRole === 'Project Manager' ||
    userRole === 'Executive' ||
    userRole === 'Developer' || // Enabled for demo mode accessibility
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
      <div className="budget-view-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#ef444415', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: 16 }}>
          <IconShield size={32} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>접근 권한 제한 (Secured View)</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 460, textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
          프로젝트 예산 및 시급 관리 화면은 보안 관리를 위해 <strong>Project Owner</strong> 및 <strong>Project Manager</strong> 역할 권한 보유자에게만 공개됩니다.
        </p>
      </div>
    );
  }

  if (loading || !budget) {
    return (
      <div className="budget-view-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: 'var(--text-secondary)' }}>
        <div className="auth-spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
        <span>예산 데이터 로딩 중...</span>
      </div>
    );
  }

  const summary: BudgetSummary = calculateBudgetSummary(budget, rates, expenses, issues);

  // Handlers for modal saves
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

  // Category Colors
  const categoryLabels: Record<string, { label: string; color: string; icon: string }> = {
    infrastructure: { label: '서버 & 인프라', color: '#6366f1', icon: '☁️' },
    software: { label: '소프트웨어 툴', color: '#10b981', icon: '💻' },
    outsourcing: { label: '외주 용역비', color: '#f59e0b', icon: '🤝' },
    other: { label: '기타 지출', color: '#64748b', icon: '📦' }
  };

  return (
    <div className="budget-view-container animate-fade-in">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="budget-header-title">
              프로젝트 예산 및 소요 금액 관리
            </h1>
            <span style={{ padding: '3px 8px', borderRadius: 6, background: '#6366f115', color: '#6366f1', fontSize: 12, fontWeight: 600 }}>
              EXECUTIVE / PO ONLY
            </span>
          </div>
          <p className="budget-header-sub">
            {currentProject.name} 수주 예산, 실시간 인건비(시급) 및 고정 운영 지출을 추적하고 소진 곡선을 모니터링합니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setIsBudgetModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            ⚙️ 예산 설정
          </button>
          <button className="btn btn-secondary" onClick={() => setIsRateModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            👤 시급 관리
          </button>
          <button className="btn btn-primary" onClick={() => setIsExpenseModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPlus size={16} />
            지출 추가
          </button>
        </div>
      </div>

      {/* ─── Risk Alert Banner (If Warning / Danger) ───────────────────────── */}
      {summary.riskMessage && (
        <div className={`budget-risk-banner ${summary.riskLevel}`}>
          <IconAlertTriangle size={24} color={summary.riskLevel === 'danger' ? '#ef4444' : '#f59e0b'} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
              {summary.riskLevel === 'danger' ? '🚨 예산 초과 위험 경고 (Budget Overrun Warning)' : '⚠️ 예산 빠른 소진 주의'}
            </div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{summary.riskMessage}</div>
          </div>
          <button
            className="btn"
            style={{
              background: summary.riskLevel === 'danger' ? '#ef4444' : '#f59e0b',
              color: '#fff',
              fontSize: 12,
              padding: '6px 12px',
              borderRadius: 6
            }}
            onClick={() => setIsBudgetModalOpen(true)}
          >
            예산 조정
          </button>
        </div>
      )}

      {/* ─── KPI Summary Cards ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Total Budget Card */}
        <div className="budget-card">
          <div className="budget-card-title">
            <span>총 수주 예산</span>
            <span style={{ fontSize: 16 }}>💰</span>
          </div>
          <div className="budget-card-value">
            {formatCurrency(summary.totalBudget, summary.currency)}
          </div>
          <div className="budget-card-sub">
            기간: {budget.startDate} ~ {budget.endDate}
          </div>
        </div>

        {/* Actual Spend Card */}
        <div className="budget-card">
          <div className="budget-card-title">
            <span>실제 소요 금액 (Current Spend)</span>
            <span style={{ fontSize: 13, color: summary.burnRatePercent > 100 ? '#ef4444' : '#6366f1', fontWeight: 700 }}>
              소진율 {summary.burnRatePercent}%
            </span>
          </div>
          <div className="budget-card-value" style={{ color: summary.burnRatePercent > 100 ? '#ef4444' : 'var(--text-primary)' }}>
            {formatCurrency(summary.totalSpend, summary.currency)}
          </div>
          <div className="budget-card-sub" style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)' }}>
            <span>인건비: {formatCurrency(summary.laborSpend, summary.currency)}</span>
            <span>고정비: {formatCurrency(summary.operationalSpend, summary.currency)}</span>
          </div>
        </div>

        {/* Remaining Budget Card */}
        <div className="budget-card">
          <div className="budget-card-title">
            <span>잔여 예산 (Remaining)</span>
            <span style={{ fontSize: 16 }}>📊</span>
          </div>
          <div className="budget-card-value" style={{ color: summary.remainingBudget < 0 ? '#ef4444' : '#10b981' }}>
            {formatCurrency(summary.remainingBudget, summary.currency)}
          </div>
          <div style={{ width: '100%', height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(0, summary.burnRatePercent))}%`,
                height: '100%',
                background: summary.burnRatePercent > 90 ? '#ef4444' : summary.burnRatePercent > 70 ? '#f59e0b' : '#10b981',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Projected Spend Card */}
        <div className="budget-card">
          <div className="budget-card-title">
            <span>최종 예측 집행액 (Projected)</span>
            <span style={{ fontSize: 16 }}>🔮</span>
          </div>
          <div className="budget-card-value" style={{ color: summary.projectedTotalSpend > summary.totalBudget ? '#ef4444' : '#3b82f6' }}>
            {formatCurrency(summary.projectedTotalSpend, summary.currency)}
          </div>
          <div className="budget-card-sub" style={{ color: summary.projectedTotalSpend > summary.totalBudget ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {summary.projectedTotalSpend > summary.totalBudget
              ? `예산 대비 +${formatCurrency(summary.projectedTotalSpend - summary.totalBudget, summary.currency)} 초과 예상`
              : `예산 내 안착 예상 (잔여 여유)`}
          </div>
        </div>
      </div>

      {/* ─── Spend Curve Chart & Category Breakdown ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Planned vs Actual Spend Curve Chart */}
        <div className="budget-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                목표 예산 소진 곡선 (Spend Burn-down Curve)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                계획 곡선(Planned) 대 실 집행액(Actual) 및 추정 곡선(Projected) 비교
              </p>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#94a3b8' }} /> 계획 (Planned)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6366f1' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1' }} /> 실제 (Actual)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} /> 예측 (Projected)
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div style={{ width: '100%', height: 220, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border-color)" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="var(--border-color)" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border-color)" strokeWidth="1" />
              <line x1="0" y1="170" x2="500" y2="170" stroke="var(--border-color)" strokeWidth="1" />

              {/* Planned Line (Dashed) */}
              <polyline
                fill="none"
                stroke="var(--text-tertiary, #cbd5e1)"
                strokeWidth="2.5"
                strokeDasharray="6,4"
                points={summary.targetSpendCurve
                  .map((p, idx) => {
                    const x = (idx / (summary.targetSpendCurve.length - 1)) * 500;
                    const y = 170 - (p.planned / (budget.totalBudget || 1)) * 150;
                    return `${x},${Math.max(10, y)}`;
                  })
                  .join(' ')}
              />

              {/* Actual & Projected Lines */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                points={summary.targetSpendCurve
                  .map((p, idx) => {
                    const x = (idx / (summary.targetSpendCurve.length - 1)) * 500;
                    const val = p.projected !== undefined ? p.projected : p.actual;
                    const y = 170 - (val / (budget.totalBudget || 1)) * 150;
                    return `${x},${Math.max(10, y)}`;
                  })
                  .join(' ')}
              />

              {/* Data Points */}
              {summary.targetSpendCurve.map((p, idx) => {
                const x = (idx / (summary.targetSpendCurve.length - 1)) * 500;
                const val = p.projected !== undefined ? p.projected : p.actual;
                const y = Math.max(10, 170 - (val / (budget.totalBudget || 1)) * 150);
                const isProjected = p.projected !== undefined;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill={isProjected ? '#ef4444' : '#6366f1'}
                    stroke="var(--card-bg, #ffffff)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}>
              {summary.targetSpendCurve.map((p, idx) => (
                <span key={idx}>{p.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className="budget-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            비용 항목별 분배
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-secondary)' }}>인건비 및 운영비 지출 비율</p>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
            {/* Labor Spend Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>👥 팀원 인건비</span>
                <span style={{ fontWeight: 700, color: '#6366f1' }}>{formatCurrency(summary.laborSpend, summary.currency)}</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${summary.totalSpend > 0 ? (summary.laborSpend / summary.totalSpend) * 100 : 0}%`, height: '100%', background: '#6366f1' }} />
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{config.icon} {config.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(catTotal, summary.currency)}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: config.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Member Hourly Rates Table ──────────────────────────────────────── */}
      <div className="budget-card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              팀원별 시급 & 투입 소요 금액 현황
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
              팀원 시간 기록(`loggedHours`)에 기반한 인건비 집행 상세 내역
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsRateModalOpen(true)}>
            + 시급 수정
          </button>
        </div>

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
                      <img src={u.avatar} alt={u.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f120', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{u.email}</div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.role}</td>
                  <td style={{ fontWeight: 600, color: '#3b82f6' }}>
                    {formatCurrency(hourlyRate, summary.currency)} / hr
                  </td>
                  <td style={{ color: 'var(--text-primary)' }}>
                    {loggedHours} 시간
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(memberCost, summary.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Project Expenses Table ─────────────────────────────────────────── */}
      <div className="budget-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              운영비 및 고정 지출 내역 (Operational Expenses)
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
              서버, SaaS 툴 구독, 외주 컨설팅 지출 항목
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsExpenseModalOpen(true)}>
            <IconPlus size={14} /> 지출 항목 추가
          </button>
        </div>

        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
            등록된 고정 지출 내역이 없습니다.
          </div>
        ) : (
          <table className="budget-table">
            <thead>
              <tr>
                <th>항목명</th>
                <th>카테고리</th>
                <th>발생 방식</th>
                <th>발생/등록일</th>
                <th style={{ textAlign: 'right' }}>금액</th>
                <th style={{ width: 60, textAlign: 'center' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => {
                const catInfo = categoryLabels[exp.category] || categoryLabels.other;
                return (
                  <tr key={exp.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.title}</div>
                      {exp.description && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{exp.description}</div>}
                    </td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, background: `${catInfo.color}20`, color: catInfo.color, fontWeight: 600 }}>
                        {catInfo.icon} {catInfo.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {exp.recurringType === 'monthly' ? '🔄 매월 정기' : '⚡ 1회성'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{exp.expenseDate}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(exp.amount, summary.currency)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="icon-button"
                        style={{ color: '#ef4444' }}
                        onClick={() => handleDeleteExpense(exp.id)}
                        title="지출 삭제"
                        aria-label="Delete expense"
                      >
                        <IconTrash size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}
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

