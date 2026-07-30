import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconCalendar, IconUser } from '../common/Icons';

interface CapacityCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CapacityCalendarModal: React.FC<CapacityCalendarModalProps> = ({ isOpen, onClose }) => {
  const { users, sprints, t } = useAether();

  const activeSprint = sprints.find((s) => s.status === 'active') || sprints[0];

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
              <p className="modal-subtitle">
                Manage PTO & holidays to calculate net committed capacity for [{activeSprint?.name || 'Active Sprint'}]
              </p>
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
              <span className="cap-lbl">Gross Team Capacity</span>
              <span className="cap-val font-mono">{grossCapacitySp} SP</span>
            </div>
            <div className="cap-summary-item deduction">
              <span className="cap-lbl">PTO & Holiday Deduction</span>
              <span className="cap-val font-mono">-{ptoDeductionSp} SP</span>
            </div>
            <div className="cap-summary-item net">
              <span className="cap-lbl">Net Recommended Commitment</span>
              <span className="cap-val font-mono green">{netCapacitySp} SP</span>
            </div>
          </div>

          {/* Add PTO Form */}
          <form onSubmit={handleAddPto} className="add-pto-form">
            <div className="form-group-inline">
              <label>Engineer:</label>
              <select value={newUserId} onChange={(e) => setNewUserId(e.target.value)}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-inline">
              <label>PTO Date:</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group-inline flex-1">
              <label>Reason:</label>
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Reason..."
                required
              />
            </div>

            <button type="submit" className="btn-primary-sm">
              + Add PTO Day
            </button>
          </form>

          {/* PTO & Holidays Table */}
          <div className="pto-list-section">
            <h3>Active Sprint PTO & Out-of-Office Schedule</h3>

            <div className="pto-table-wrap">
              <table className="pto-table">
                <thead>
                  <tr>
                    <th>Engineer</th>
                    <th>Out-of-Office Date</th>
                    <th>Reason</th>
                    <th>Deduction</th>
                    <th>Action</th>
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
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSyncToSprint} disabled={synced}>
            {synced ? (
              <>
                <IconCheckCircle /> Net Capacity Synced ({netCapacitySp} SP)!
              </>
            ) : (
              <>
                <IconCalendar /> Sync Net Capacity to Sprint ({netCapacitySp} SP)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
