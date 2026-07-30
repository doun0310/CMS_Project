import React, { useEffect, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { RetrospectiveItem, User } from '../../types/Aether';
import { IconAiSpark, IconCheck, IconPlus, IconRetro, IconRetroBoard, IconTarget, IconThumbUp, IconTrash } from '../common/Icons';
import { analyzeRetrospective, fetchLatestRetrospectiveAnalysis, type RetrospectiveSentimentAnalysis } from '../../services/retrospectiveAnalysis';

export const RetrospectiveView: React.FC = () => {
  const { retrospectiveItems, addRetroItem, voteRetroItem, deleteRetroItem, createIssue, users, currentProject, sprints, language, t } = useAether();

  const [newContent, setNewContent] = useState('');
  const [targetColumn, setTargetColumn] = useState<'went_well' | 'to_improve' | 'action_item'>('went_well');
  const [convertedIds, setConvertedIds] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [retroSubTab, setRetroSubTab] = useState<'board' | 'actions'>('board');
  const [aiAnalysis, setAiAnalysis] = useState<RetrospectiveSentimentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const activeSprint = sprints.find(sprint => sprint.status === 'active' && (!sprint.projectId || sprint.projectId === currentProject.id));

  useEffect(() => {
    let isMounted = true;
    setAiAnalysis(null);
    fetchLatestRetrospectiveAnalysis(currentProject.id, activeSprint?.id ?? null)
      .then(analysis => { if (isMounted) setAiAnalysis(analysis); })
      // An absent Supabase login or an undeployed function should not hide the board.
      .catch(() => { if (isMounted) setAiAnalysis(null); });
    return () => { isMounted = false; };
  }, [currentProject.id, activeSprint?.id]);

  const handleAdd = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    addRetroItem(targetColumn, newContent.trim());
    setNewContent('');
  };

  const handleConvertToIssue = (item: RetrospectiveItem) => {
    const newIssueKey = `TASK-${Math.floor(100 + Math.random() * 900)}`;
    createIssue({
      summary: `[Retro Action] ${item.content}`,
      description: `Action item created from Sprint Retrospective by Team Member. Votes: ${item.votes}`,
      type: 'task',
      priority: 'high',
      labels: ['retro-action', 'team-improvement']
    });
    setConvertedIds(prev => ({ ...prev, [item.id]: newIssueKey }));
    setNotification(`${t('convertToIssue')} [${newIssueKey}]: "${item.content.slice(0, 30)}..."`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConvertAllActionItems = () => {
    const unconverted = actionItems.filter(item => !convertedIds[item.id]);
    unconverted.forEach(item => handleConvertToIssue(item));
    setNotification(`${t('convertAllBacklog')} ${unconverted.length} ${t('toBacklogTasks')}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const wentWellItems = retrospectiveItems.filter(i => i.type === 'went_well');
  const toImproveItems = retrospectiveItems.filter(i => i.type === 'to_improve');
  const actionItems = retrospectiveItems.filter(i => i.type === 'action_item');

  const convertedCount = Object.keys(convertedIds).length;
  const conversionPct = actionItems.length > 0 ? Math.round((convertedCount / actionItems.length) * 100) : 100;

  // Sentiment ratio
  const totalFeedback = wentWellItems.length + toImproveItems.length;
  const sentimentPct = totalFeedback > 0 ? Math.round((wentWellItems.length / totalFeedback) * 100) : 80;

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const analysis = await analyzeRetrospective({
        projectId: currentProject.id,
        sprintId: activeSprint?.id ?? null,
        language,
        items: retrospectiveItems,
      });
      setAiAnalysis(analysis);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'AI 분석을 완료하지 못했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderColumn = (
    title: string,
    type: 'went_well' | 'to_improve' | 'action_item',
    badgeClass: string,
    icon: React.ReactNode
  ) => {
    const items = retrospectiveItems
      .filter((i: RetrospectiveItem) => i.type === type)
      .sort((a: RetrospectiveItem, b: RetrospectiveItem) => b.votes - a.votes);

    return (
      <div className="retro-column">
        <div className={`retro-column-header ${badgeClass}`}>
          <span className="retro-column-title">{icon} {title}</span>
          <span className="retro-count-badge">{items.length}</span>
        </div>

        <form onSubmit={handleAdd} className="retro-input-box">
          <input
            type="text"
            placeholder={`${title} ${t('addToColumn')}`}
            value={targetColumn === type ? newContent : ''}
            onFocus={() => setTargetColumn(type)}
            onChange={e => {
              setTargetColumn(type);
              setNewContent(e.target.value);
            }}
          />
          <button type="submit" className="btn-retro-add">
            <IconPlus size={14} />
          </button>
        </form>

        <div className="retro-card-list">
          {items.map((item: RetrospectiveItem) => {
            const author = users.find((u: User) => u.id === item.authorId);
            const linkedKey = convertedIds[item.id];

            return (
              <div key={item.id} className="retro-card animate-fade-in">
                <div className="retro-card-body">{item.content}</div>
                <div className="retro-card-footer">
                  <div className="retro-author">
                    {author ? author.name : t('teamMember')}
                  </div>

                  <div className="retro-card-actions">
                    {type === 'action_item' && (
                      <button
                        className={`btn-convert-issue ${linkedKey ? 'converted' : ''}`}
                        onClick={() => !linkedKey && handleConvertToIssue(item)}
                        title={t('convertActionToBacklog')}
                      >
                        {linkedKey ? (
                          <>
                            <IconCheck size={12} /> {linkedKey}
                          </>
                        ) : (
                          <><IconPlus size={12} /> {t('createIssue')}</>
                        )}
                      </button>
                    )}

                    <button
                      className="btn-vote"
                      onClick={() => voteRetroItem(item.id)}
                      title={t('upvoteItem')}
                    >
                      <IconThumbUp size={12} /> {item.votes}
                    </button>
                    <button
                      className="btn-delete-retro"
                      onClick={() => deleteRetroItem(item.id)}
                      title={t('deleteItem')}
                    >
                      <IconTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="retrospective-view animate-fade-in">
      <div className="view-header-bar flex-between">
        <div>
          <h2 className="view-title-with-icon"><IconRetro size={20} /> {t('retrospectiveTitle')}</h2>
        </div>

        {/* View Mode Sub-tabs */}
        <div className="retro-tabs-toggle">
          <button
            className={`retro-tab-btn ${retroSubTab === 'board' ? 'active' : ''}`}
            onClick={() => setRetroSubTab('board')}
          >
            <IconRetroBoard size={15} /> {t('retrospectiveBoard')}
          </button>
          <button
            className={`retro-tab-btn ${retroSubTab === 'actions' ? 'active' : ''}`}
            onClick={() => setRetroSubTab('actions')}
          >
            <IconTarget size={15} /> {t('actionExecution')} ({convertedCount}/{actionItems.length})
          </button>
        </div>
      </div>

      {notification && (
        <div className="alert-banner animate-fade-in">
          <span>{notification}</span>
        </div>
      )}

      {/* AI Retrospective Executive Summary Card */}
      <div className="ai-retro-summary-card animate-fade-in">
        <div className="summary-header">
          <h3 className="section-title-with-icon"><IconAiSpark size={17} /> {t('retroDigest')}</h3>
          <div className="ai-summary-actions">
            <span className="sentiment-badge">{aiAnalysis?.score ?? sentimentPct}% {t('positiveSentiment')}</span>
            <button type="button" className="btn-primary-sm" onClick={handleAiAnalysis} disabled={isAnalyzing || retrospectiveItems.length === 0}>
              <IconAiSpark size={14} /> {isAnalyzing ? 'AI 분석 중…' : 'AI 분석 실행'}
            </button>
          </div>
        </div>
        {aiAnalysis && <p className="ai-analysis-summary-text">{aiAnalysis.summary}</p>}
        {analysisError && <p className="ai-analysis-error" role="alert">{analysisError}</p>}
        <div className="summary-grid">
          <div className="summary-box">
            <div className="s-label">{t('sprintTeamMorale')}</div>
            <div className="s-value">{aiAnalysis ? (aiAnalysis.tone === 'positive' ? t('highAlignment') : aiAnalysis.tone === 'neutral' ? '균형 잡힌 의견' : '살펴볼 신호가 있음') : t('highAlignment')}</div>
            <div className="s-desc">{aiAnalysis?.positiveSignals[0] || `${wentWellItems.length} ${t('positiveLogged')}`}</div>
          </div>
          <div className="summary-box">
            <div className="s-label">{t('keyGrowthArea')}</div>
            <div className="s-value">{aiAnalysis?.risks[0] || toImproveItems[0]?.content || 'CI/CD build pipeline speed'}</div>
            <div className="s-desc">{aiAnalysis?.recommendedActions[0] || t('topImprovement')}</div>
          </div>
          <div className="summary-box">
            <div className="s-label">{t('actionTicketConversion')}</div>
            <div className="s-value">
              {aiAnalysis?.actionExecutionRate != null
                ? `${aiAnalysis.actionExecutionRate}% Action Execution (${convertedCount}/${actionItems.length})`
                : `${conversionPct}% Converted (${convertedCount}/${actionItems.length})`}
            </div>
            <div className="s-desc">{aiAnalysis?.topFocusTopic ? `Top Topic: ${aiAnalysis.topFocusTopic}` : t('convertOneClick')}</div>
          </div>
        </div>
      </div>

      {retroSubTab === 'board' ? (
        <div className="retro-grid">
          {renderColumn(t('retroWentWell'), 'went_well', 'badge-went-well', <IconCheck size={16} />)}
          {renderColumn(t('retroToImprove'), 'to_improve', 'badge-to-improve', <IconAiSpark size={16} />)}
          {renderColumn(t('retroActionItems'), 'action_item', 'badge-action-item', <IconTarget size={16} />)}
        </div>
      ) : (
        /* Action Items Execution & Backlog Conversion Tracker */
        <div className="action-items-tracker-card animate-fade-in">
          <div className="tracker-header">
            <div>
              <h3 className="section-title-with-icon"><IconTarget size={17} /> {t('actionExecutionMatrix')}</h3>
            </div>
            <button
              className="btn-primary-sm"
              onClick={handleConvertAllActionItems}
              disabled={actionItems.length === 0 || convertedCount === actionItems.length}
            >
              <IconTarget size={14} /> {t('convertAllBacklog')} ({actionItems.length - convertedCount}) {t('toBacklogTasks')}
            </button>
          </div>

          <div className="action-items-table-wrap">
            <table className="action-items-table">
              <thead>
                <tr>
                  <th>{t('actionItemDescription')}</th>
                  <th>{t('votes')}</th>
                  <th>{t('author')}</th>
                  <th>{t('conversionStatus')}</th>
                  <th>{t('backlogIssueKey')}</th>
                  <th>{t('actionItems')}</th>
                </tr>
              </thead>
              <tbody>
                {actionItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-text">{t('noActionItems')}</td>
                  </tr>
                ) : (
                  actionItems.map((item) => {
                    const author = users.find((u) => u.id === item.authorId);
                    const linkedKey = convertedIds[item.id];
                    return (
                      <tr key={item.id}>
                        <td className="font-semibold">{item.content}</td>
                        <td><span className="vote-chip"><IconThumbUp size={12} /> {item.votes}</span></td>
                        <td>
                          {author ? (
                            <div className="user-info-flex">
                              <img src={author.avatar} alt="" className="avatar-xs" />
                              <span>{author.name}</span>
                            </div>
                          ) : (
                            t('teamMember')
                          )}
                        </td>
                        <td>
                          {linkedKey ? (
                            <span className="status-converted"><IconCheck size={12} /> {t('convertedToTicket')}</span>
                          ) : (
                            <span className="status-pending">{t('pendingConversion')}</span>
                          )}
                        </td>
                        <td className="font-mono font-bold">{linkedKey || '-'}</td>
                        <td>
                          {!linkedKey ? (
                            <button
                              className="btn-primary-sm"
                              onClick={() => handleConvertToIssue(item)}
                            >
                              <><IconPlus size={14} /> {t('convertToIssue')}</>
                            </button>
                          ) : (
                            <span className="text-tertiary">{t('completed')}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
