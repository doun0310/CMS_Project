import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconCalendar, IconUser } from '../common/Icons';

interface CapacityCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CapacityCalendarModal: React.FC<CapacityCalendarModalProps> = ({ isOpen, onClose }) => {
  const { users, t } = useAether();

  const [ptoList, setPtoList] = useState([
    { userId: users[0]?.id || 'u1', userName: users[0]?.name || 'Alex Rivera', dateStr: '2026-07-28', reason: 'Vacation' },
    { userId: users[1]?.id || 'u2', userName: users[1]?.name || 'Sarah Chen', dateStr: '2026-07-30', reason: 'Conference' },
  ]);

  const [newUserId, setNewUserId] = useState(users[0]?.id || 'u1');
  const [newDate, setNewDate] = useState('2026-07-29');
  const [newReason, setNewReason] = useState('Personal PTO');
  const [synced, setSynced] = useState(false);

  if (!isOpen) return null;

  const grossCapacitySp = 45;
  const ptoDeductionSp = ptoList.length * 4; // 4 SP deduction per PTO day
  const netCapacitySp = Math.max(10, grossCapacitySp - ptoDeductionSp);

  const handleAddPto = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = users.find((u) => u.id === newUserId) || users[0];
    setPtoList((prev) => [
      ...prev,
      { userId: user.id, userName: user.name, dateStr: newDate, reason: newReason },
    ]);
    setNewReason('Personal PTO');
  };

  const handleRemovePto = (idx: number) => {
    setPtoList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSyncToSprint = () => {
    setSynced(true);
    setTimeout(() => {
      setSynced(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content capacity-calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconCalendar size={20} /></span>
            <div>
              <h2 className="modal-title">{t('ptoCalendarModalTitle')}</h2>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body cap-modal-body">
          {/* Net Capacity Bar */}
          <div className="capacity-summary-card">
            <div className="cap-summary-item">
              <span className="cap-lbl">{t('grossTeamCapacity')}</span>
              <span className="cap-val font-mono">{grossCapacitySp} SP</span>
            </div>
            <div className="cap-summary-item deduction">
              <span className="cap-lbl">{t('ptoDeduction')}</span>
              <span className="cap-val font-mono">-{ptoDeductionSp} SP</span>
            </div>
            <div className="cap-summary-item net">
              <span className="cap-lbl">{t('netRecommendedCommitment')}</span>
              <span className="cap-val font-mono green">{netCapacitySp} SP</span>
            </div>
          </div>

          {/* Add PTO Form */}
          <form onSubmit={handleAddPto} className="add-pto-form">
            <div className="form-group-inline">
              <label>{t('engineer')}:</label>
              <select value={newUserId} onChange={(e) => setNewUserId(e.target.value)}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-inline">
              <label>{t('ptoDate')}:</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group-inline flex-1">
              <label>{t('reason')}:</label>
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder={t('reason')}
                required
              />
            </div>

            <button type="submit" className="btn-primary-sm">
              {t('addPtoDay')}
            </button>
          </form>

          {/* PTO & Holidays Table */}
          <div className="pto-list-section">
            <h3>{t('activeSprintPtoSchedule')}</h3>

            <div className="pto-table-wrap">
              <table className="pto-table">
                <thead>
                  <tr>
                    <th>{t('engineer')}</th>
                    <th>{t('ptoDate')}</th>
                    <th>{t('reason')}</th>
                    <th>{t('workload')}</th>
                    <th>{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ptoList.map((pto, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="user-info-flex">
                          <IconUser size={14} />
                          <span className="font-semibold">{pto.userName}</span>
                        </div>
                      </td>
                      <td className="font-mono text-indigo">{pto.dateStr}</td>
                      <td>{pto.reason}</td>
                      <td className="font-bold text-red">-4 SP</td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete-retro"
                          onClick={() => handleRemovePto(idx)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="btn-primary" onClick={handleSyncToSprint} disabled={synced}>
            {synced ? (
              <>
                <IconCheckCircle /> {t('syncedCapacitySuccess')} ({netCapacitySp} SP)!
              </>
            ) : (
              <>
                <IconCalendar /> {t('syncNetCapacityToSprint')} ({netCapacitySp} SP)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
