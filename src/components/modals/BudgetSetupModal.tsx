import React, { useState } from 'react';
import type { ProjectBudget } from '../../types/Aether';
import { IconX, IconCheck, IconCreditCard } from '../common/Icons';
import '../../styles/budgetView.css';

interface BudgetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: ProjectBudget;
  onSave: (updated: ProjectBudget) => void;
}

export const BudgetSetupModal: React.FC<BudgetSetupModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSave
}) => {
  const [totalBudget, setTotalBudget] = useState(budget.totalBudget);
  const [currency, setCurrency] = useState(budget.currency || 'KRW');
  const [startDate, setStartDate] = useState(budget.startDate || '2026-06-01');
  const [endDate, setEndDate] = useState(budget.endDate || '2026-12-31');
  const [alertThresholdPercent, setAlertThresholdPercent] = useState(budget.alertThresholdPercent || 10);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...budget,
      totalBudget: Number(totalBudget),
      currency,
      startDate,
      endDate,
      alertThresholdPercent: Number(alertThresholdPercent)
    });
    onClose();
  };

  return (
    <div className="budget-drawer-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="budget-drawer-content">
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
              border: '1px solid rgba(99, 102, 241, 0.25)'
            }}>
              <IconCreditCard size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>프로젝트 수주 예산 설정</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>수주 예산 금액 및 프로젝트 운영 기한을 지정합니다.</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          <div className="budget-form-group">
            <label className="budget-form-label">총 수주 / 할당 예산</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                className="budget-input"
                style={{ flex: 1 }}
                value={totalBudget}
                onChange={e => setTotalBudget(Number(e.target.value))}
                placeholder="예: 150000000"
                required
                min={0}
                step={1000000}
              />
              <select
                className="budget-select"
                style={{ width: 110 }}
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="KRW">KRW (₩)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="budget-form-group">
              <label className="budget-form-label">프로젝트 시작일</label>
              <input
                type="date"
                className="budget-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="budget-form-group">
              <label className="budget-form-label">프로젝트 종료일</label>
              <input
                type="date"
                className="budget-input"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="budget-form-group" style={{ background: 'var(--bg-tertiary)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <label className="budget-form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>목표 곡선 대비 경고 임계치 (%)</span>
              <span style={{ color: '#6366f1', fontWeight: 700 }}>+{alertThresholdPercent}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={alertThresholdPercent}
              onChange={e => setAlertThresholdPercent(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginTop: 6, lineHeight: 1.4 }}>
              이상적 소진 곡선보다 실 집행액이 {alertThresholdPercent}% 이상 초과할 시 위험 경고 배너를 발송합니다.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCheck size={16} />
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
