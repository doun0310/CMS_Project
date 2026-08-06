import React, { useState } from 'react';
import type { ExpenseCategory, RecurringType, ProjectExpense } from '../../types/Aether';
import { IconX, IconCheck } from '../common/Icons';
import '../../styles/budgetView.css';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onAddExpense: (expense: Omit<ProjectExpense, 'id'>) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onAddExpense
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('infrastructure');
  const [amount, setAmount] = useState<number>(1000000);
  const [recurringType, setRecurringType] = useState<RecurringType>('monthly');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    onAddExpense({
      projectId,
      title: title.trim(),
      category,
      amount: Number(amount),
      recurringType,
      expenseDate,
      description: description.trim()
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f59e0b1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              🧾
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>운영비 및 고정 지출 추가</h3>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>서버, 툴 구독료, 외주 비용 항목을 등록합니다.</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="budget-form-group">
            <label className="budget-form-label">지출 항목명</label>
            <input
              type="text"
              className="budget-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예: AWS EKS & Database Cluster 운영비"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="budget-form-group">
              <label className="budget-form-label">카테고리</label>
              <select
                className="budget-select"
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
              >
                <option value="infrastructure">☁️ 서버 및 인프라</option>
                <option value="software">💻 소프트웨어 툴 / SaaS</option>
                <option value="outsourcing">🤝 외주 및 전문 용역</option>
                <option value="other">📦 기타 지출</option>
              </select>
            </div>

            <div className="budget-form-group">
              <label className="budget-form-label">발생 방식</label>
              <select
                className="budget-select"
                value={recurringType}
                onChange={e => setRecurringType(e.target.value as RecurringType)}
              >
                <option value="monthly">🔄 매월 정기 지출</option>
                <option value="one_time">⚡ 1회성 지출</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="budget-form-group">
              <label className="budget-form-label">지출 금액 (KRW)</label>
              <input
                type="number"
                className="budget-input"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                min={0}
                step={100000}
                required
              />
            </div>

            <div className="budget-form-group">
              <label className="budget-form-label">지출/시작 일자</label>
              <input
                type="date"
                className="budget-input"
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="budget-form-group">
            <label className="budget-form-label">상세 설명 (선택)</label>
            <textarea
              className="budget-textarea"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="관련 계약서, 용지 및 비용 목적 메모"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCheck size={16} />
              지출 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

