import React, { useState } from 'react';
import type { User, MemberHourlyRate } from '../../types/Aether';
import { IconX, IconCheck, IconUser } from '../common/Icons';
import '../../styles/budgetView.css';

interface MemberRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  rates: MemberHourlyRate[];
  onSaveRate: (rate: MemberHourlyRate) => void;
}

export const MemberRateModal: React.FC<MemberRateModalProps> = ({
  isOpen,
  onClose,
  users,
  rates,
  onSaveRate
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const existingRate = rates.find(r => r.userId === selectedUserId);
  const [hourlyRate, setHourlyRate] = useState<number>(existingRate?.hourlyRate || 50000);

  if (!isOpen) return null;

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const r = rates.find(rate => rate.userId === userId);
    setHourlyRate(r ? r.hourlyRate : 50000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const rateObj: MemberHourlyRate = {
      id: existingRate?.id || `rate-${selectedUserId}`,
      projectId: existingRate?.projectId || 'proj-1',
      userId: selectedUserId,
      hourlyRate: Number(hourlyRate),
      currency: 'KRW'
    };

    onSaveRate(rateObj);
    onClose();
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="budget-drawer-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="budget-drawer-content">
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <IconUser size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>팀원 시급 (인건비) 설정</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>개발자/디자이너별 시간당 인건비를 지정합니다.</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          <div className="budget-form-group">
            <label className="budget-form-label">팀원 선택</label>
            <select
              className="budget-select"
              value={selectedUserId}
              onChange={e => handleUserSelect(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="budget-user-card" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14 }}>
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt={selectedUser.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6366f120', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {selectedUser.name.charAt(0)}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{selectedUser.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedUser.email} · {selectedUser.role}</div>
              </div>
            </div>
          )}

          <div className="budget-form-group">
            <label className="budget-form-label">시간당 인건비 (시급, KRW)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                className="budget-input"
                style={{ flex: 1 }}
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                placeholder="예: 50000"
                min={0}
                step={5000}
                required
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>원 / 시간</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, background: 'rgba(99, 102, 241, 0.06)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(99, 102, 241, 0.15)' }}>
              💡 하루 8시간 작업 기준 일일 산정 인건비: <strong style={{ color: '#6366f1' }}>{(hourlyRate * 8).toLocaleString()}원</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCheck size={16} />
              시급 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
