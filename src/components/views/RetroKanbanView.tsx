import React, { useMemo, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconCheckCircle, IconMessage, IconPlus, IconRetroBoard, IconUsers } from '../common/Icons';
import type { RetrospectiveItem } from '../../types/Aether';

type ActionStatus = 'planned' | 'in_progress' | 'done';

const statusKey: Record<ActionStatus, string> = {
  planned: 'identifiedActionItems',
  in_progress: 'inProgressFixes',
  done: 'verifiedResolved',
};

export const RetroKanbanView: React.FC = () => {
  const {
    sprints,
    retrospectiveItems,
    addRetroItem,
    voteRetroItem,
    updateRetroItem,
    addRetroComment,
    createIssue,
    users,
    currentUser,
    t,
  } = useAether();

  const activeSprint = sprints.find((s) => s.status === 'active') || sprints[0];
  const [newActionText, setNewActionText] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [commentingItemId, setCommentingItemId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [convertedMap, setConvertedMap] = useState<Record<string, boolean>>({});

  const actionCards = useMemo(
    () => retrospectiveItems.filter((item: RetrospectiveItem) => item.type === 'action_item'),
    [retrospectiveItems],
  );
  const completedCount = actionCards.filter(item => item.status === 'done').length;
  const assignedCount = actionCards.filter(item => item.assigneeId).length;
  const executionRate = actionCards.length ? Math.round((completedCount / actionCards.length) * 100) : 0;

  const cardsFor = (status: ActionStatus) => actionCards.filter(item => (item.status || 'planned') === status);

  const handleAddAction = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newActionText.trim()) return;
    addRetroItem('action_item', newActionText.trim(), newAssigneeId || null);
    setNewActionText('');
    setNewAssigneeId('');
  };

  const handleConvertToTask = (item: RetrospectiveItem) => {
    createIssue({
      summary: `[${t('retroAction')}] ${item.content}`,
      type: 'task',
      priority: 'high',
      status: 'todo',
      storyPoints: 3,
      assigneeId: item.assigneeId || null,
      description: `${t('retroTaskDescription')} ${activeSprint?.name || t('sprint')}.`,
    });
    setConvertedMap(previous => ({ ...previous, [item.id]: true }));
  };

  const handleAddComment = (itemId: string) => {
    if (!commentText.trim()) return;
    addRetroComment(itemId, commentText);
    setCommentText('');
    setCommentingItemId(null);
  };

  const renderCard = (item: RetrospectiveItem) => {
    const author = users.find(user => user.id === item.authorId);
    const comments = item.comments || [];
    const isDone = item.status === 'done';
    const hasVoted = (item.voterIds || []).includes(currentUser.id);

    return (
      <article key={item.id} className={`retro-k-card ${isDone ? 'done-card' : ''}`}>
        <div className="k-card-top">
          <div className="k-card-author-group">
            {author && <img className="retro-member-avatar" src={author.avatar} alt="" />}
            <span className="k-card-author">{author?.name || t('unassigned')}</span>
          </div>
          <button className="k-vote-btn" type="button" onClick={() => voteRetroItem(item.id)} title={t('votes')} disabled={hasVoted}>
            👍 {item.votes}
          </button>
        </div>

        <p className="k-card-text">{item.content}</p>

        <div className="k-card-assignment">
          <span>{t('assignee')}</span>
          <select
            value={item.assigneeId || ''}
            onChange={event => updateRetroItem(item.id, { assigneeId: event.target.value || null })}
            aria-label={`${t('assignee')}: ${item.content}`}
          >
            <option value="">{t('unassigned')}</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </div>

        {comments.length > 0 && (
          <div className="k-card-comments">
            {comments.slice(-2).map(comment => {
              const commenter = users.find(user => user.id === comment.authorId);
              return <p key={comment.id}><strong>{commenter?.name || t('unassigned')}</strong> {comment.text}</p>;
            })}
          </div>
        )}

        {commentingItemId === item.id ? (
          <form className="k-comment-form" onSubmit={event => { event.preventDefault(); handleAddComment(item.id); }}>
            <input autoFocus value={commentText} onChange={event => setCommentText(event.target.value)} placeholder={t('addComment')} />
            <button className="btn-primary-sm" type="submit">{t('add')}</button>
            <button className="btn-ghost-sm" type="button" onClick={() => { setCommentingItemId(null); setCommentText(''); }}>{t('cancel')}</button>
          </form>
        ) : null}

        <div className="k-card-footer">
          <button className="k-comment-btn" type="button" onClick={() => setCommentingItemId(item.id)}>
            <IconMessage size={14} /> {comments.length} {t('comments')}
          </button>
          <div className="k-card-actions">
            {!isDone && (
              <button
                className="btn-stage-action"
                type="button"
                onClick={() => updateRetroItem(item.id, { status: item.status === 'in_progress' ? 'done' : 'in_progress' })}
              >
                {item.status === 'in_progress' ? <><IconCheckCircle size={14} /> {t('resolved')}</> : t('inProgressLabel')}
              </button>
            )}
            {isDone && (
              <button className="btn-stage-action" type="button" onClick={() => updateRetroItem(item.id, { status: 'in_progress' })}>
                {t('inProgressLabel')}
              </button>
            )}
            <button className="btn-convert-task" type="button" onClick={() => handleConvertToTask(item)} disabled={convertedMap[item.id]}>
              {convertedMap[item.id] ? <><IconCheckCircle size={14} /> {t('convertedToBacklog')}</> : t('convertToBacklogTask')}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="retro-kanban-container animate-fade-in">
      <header className="retro-kanban-header">
        <div className="header-info">
          <div className="flex-align-gap">
            <span className="retro-k-icon"><IconRetroBoard size={22} /></span>
            <div><h2>{t('retroKanbanTitle')}</h2></div>
          </div>
        </div>
        <div className="retro-k-metrics flex-align-gap">
          <div className="k-metric-card"><span className="k-metric-val">{executionRate}%</span><span className="k-metric-lbl">{t('actionExecutionRate')}</span></div>
          <div className="k-metric-card"><span className="k-metric-val">{assignedCount}/{actionCards.length}</span><span className="k-metric-lbl">{t('assignee')}</span></div>
          <div className="k-metric-card"><span className="k-metric-val"><IconUsers size={18} /></span><span className="k-metric-lbl">{users.length} {t('teamMember')}</span></div>
        </div>
      </header>

      <form onSubmit={handleAddAction} className="retro-k-add-bar">
        <input type="text" placeholder={t('retroActionPlaceholder')} value={newActionText} onChange={event => setNewActionText(event.target.value)} className="retro-k-input" required />
        <select value={newAssigneeId} onChange={event => setNewAssigneeId(event.target.value)} className="retro-k-select" aria-label={t('assignee')}>
          <option value="">{t('unassigned')}</option>
          {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
        <button type="submit" className="btn-primary"><IconPlus size={16} /> {t('addActionItem')}</button>
      </form>

      <div className="retro-k-board-grid">
        {(['planned', 'in_progress', 'done'] as ActionStatus[]).map(status => (
          <section key={status} className={`retro-k-col ${status === 'planned' ? 'identified' : status.replace('_', '-')}`}>
            <div className="k-col-header"><span>{t(statusKey[status])}</span><span className="k-count-chip">{cardsFor(status).length}</span></div>
            <div className="k-col-cards">{cardsFor(status).map(renderCard)}</div>
          </section>
        ))}
      </div>
    </div>
  );
};
