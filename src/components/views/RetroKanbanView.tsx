import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconCheckCircle, IconPlus, IconRetroBoard } from '../common/Icons';
import type { RetrospectiveItem } from '../../types/Aether';

export const RetroKanbanView: React.FC = () => {
  const { sprints, retrospectiveItems, addRetroItem, createIssue, users, t } = useAether();

  const activeSprint = sprints.find((s) => s.status === 'active') || sprints[0];

  const [newActionText, setNewActionText] = useState('');
  const [newCategory, setNewCategory] = useState<'went_well' | 'to_improve' | 'action_item'>('action_item');
  const [convertedMap, setConvertedMap] = useState<Record<string, boolean>>({});

  const actionCards = retrospectiveItems.filter((item: RetrospectiveItem) => item.type === 'action_item');
  const completedCount = actionCards.filter((item: RetrospectiveItem) => item.votes > 2).length;
  const executionRate = actionCards.length > 0 ? Math.round((completedCount / actionCards.length) * 100) : 100;

  const handleAddAction = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newActionText.trim()) return;

    addRetroItem(newCategory, newActionText.trim());
    setNewActionText('');
  };

  const handleConvertToTask = (itemId: string, content: string) => {
    createIssue({
      summary: `[${t('retroAction')}] ${content}`,
      type: 'task',
      priority: 'high',
      status: 'todo',
      storyPoints: 3,
      description: `${t('retroTaskDescription')} ${activeSprint?.name || t('sprint')}.`,
    });

    setConvertedMap((prev) => ({ ...prev, [itemId]: true }));
  };

  return (
    <div className="retro-kanban-container animate-fade-in">
      {/* Header Banner */}
      <div className="retro-kanban-header">
        <div className="header-info">
          <div className="flex-align-gap">
            <span className="retro-k-icon"><IconRetroBoard size={22} /></span>
            <div>
              <h2>{t('retroKanbanTitle')}</h2>
            </div>
          </div>
        </div>

        {/* Execution Rate Metric Card */}
        <div className="retro-k-metrics flex-align-gap">
          <div className="k-metric-card">
            <span className="k-metric-val">{executionRate}%</span>
            <span className="k-metric-lbl">{t('actionExecutionRate')}</span>
          </div>
          <div className="k-metric-card">
            <span className="k-metric-val">{actionCards.length}</span>
            <span className="k-metric-lbl">{t('totalActionItems')}</span>
          </div>
        </div>
      </div>

      {/* Quick Add Action Item Bar */}
      <form onSubmit={handleAddAction} className="retro-k-add-bar">
        <input
          type="text"
          placeholder={t('retroActionPlaceholder')}
          value={newActionText}
          onChange={(e) => setNewActionText(e.target.value)}
          className="retro-k-input"
          required
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as any)}
          className="retro-k-select"
        >
          <option value="action_item">🎯 {t('actionItems')}</option>
          <option value="to_improve">⚠️ {t('toImprove')}</option>
          <option value="went_well">🌟 {t('wentWell')}</option>
        </select>
        <button type="submit" className="btn-primary">
          <IconPlus size={16} /> {t('addActionItem')}
        </button>
      </form>

      {/* 3-Column Action Item Execution Kanban */}
      <div className="retro-k-board-grid">
        {/* Column 1: Identified Actions */}
        <div className="retro-k-col identified">
          <div className="k-col-header">
            <span>{t('identifiedActionItems')}</span>
            <span className="k-count-chip">{actionCards.length}</span>
          </div>
          <div className="k-col-cards">
            {actionCards.map((item: RetrospectiveItem) => (
              <div key={item.id} className="retro-k-card">
                <div className="k-card-top">
                  <span className="k-card-author">@{users.find((u) => u.id === item.authorId)?.name || 'Alex Rivera'}</span>
                  <span className="k-card-votes">👍 {item.votes} {t('votes')}</span>
                </div>
                <p className="k-card-text">{item.content}</p>
                <div className="k-card-footer">
                  <button
                    className="btn-convert-task"
                    onClick={() => handleConvertToTask(item.id, item.content)}
                    disabled={convertedMap[item.id]}
                  >
                    {convertedMap[item.id] ? (
                      <>
                        <IconCheckCircle size={14} /> {t('convertedToBacklog')}
                      </>
                    ) : (
                      <>
                        ⚡ {t('convertToBacklogTask')} →
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: In Progress Fixes */}
        <div className="retro-k-col in-progress">
          <div className="k-col-header">
            <span>{t('inProgressFixes')}</span>
            <span className="k-count-chip">2</span>
          </div>
          <div className="k-col-cards">
            <div className="retro-k-card active-fix">
              <div className="k-card-top">
                <span className="k-card-author">@Marcus Vance</span>
                <span className="k-card-votes">👍 4 {t('votes')}</span>
              </div>
              <p className="k-card-text">{t('retroSampleMigration')}</p>
              <div className="k-card-footer">
                <span className="in-progress-pill">{t('inProgressLabel')} (75%)</span>
              </div>
            </div>

            <div className="retro-k-card active-fix">
              <div className="k-card-top">
                <span className="k-card-author">@Sarah Chen</span>
                <span className="k-card-votes">👍 3 {t('votes')}</span>
              </div>
              <p className="k-card-text">{t('retroSampleRedis')}</p>
              <div className="k-card-footer">
                <span className="in-progress-pill">{t('inProgressLabel')} (50%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Verified & Resolved */}
        <div className="retro-k-col resolved">
          <div className="k-col-header">
            <span>{t('verifiedResolved')}</span>
            <span className="k-count-chip">3</span>
          </div>
          <div className="k-col-cards">
            <div className="retro-k-card done-card">
              <div className="k-card-top">
                <span className="k-card-author">@Alex Rivera</span>
                <span className="k-card-votes">👍 5 {t('votes')}</span>
              </div>
              <p className="k-card-text">{t('retroSampleStandup')}</p>
              <div className="k-card-footer">
                <span className="done-pill">{t('resolved')} ✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
