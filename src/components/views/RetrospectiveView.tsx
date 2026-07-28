import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { RetrospectiveItem, User } from '../../types/Aether';
import { IconPlus, IconTrash, IconCheck } from '../common/Icons';

export const RetrospectiveView: React.FC = () => {
  const { retrospectiveItems, addRetroItem, voteRetroItem, deleteRetroItem, createIssue, users } = useAether();

  const [newContent, setNewContent] = useState('');
  const [targetColumn, setTargetColumn] = useState<'went_well' | 'to_improve' | 'action_item'>('went_well');
  const [convertedIds, setConvertedIds] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [retroSubTab, setRetroSubTab] = useState<'board' | 'actions'>('board');

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
    setNotification(`🎟️ Action item converted to Backlog Issue [${newIssueKey}]: "${item.content.slice(0, 30)}..."`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConvertAllActionItems = () => {
    const unconverted = actionItems.filter(item => !convertedIds[item.id]);
    unconverted.forEach(item => handleConvertToIssue(item));
    setNotification(`⚡ All ${unconverted.length} action items converted to Backlog Issues!`);
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

  const renderColumn = (
    title: string,
    type: 'went_well' | 'to_improve' | 'action_item',
    badgeClass: string,
    emoji: string
  ) => {
    const items = retrospectiveItems
      .filter((i: RetrospectiveItem) => i.type === type)
      .sort((a: RetrospectiveItem, b: RetrospectiveItem) => b.votes - a.votes);

    return (
      <div className="retro-column">
        <div className={`retro-column-header ${badgeClass}`}>
          <span>{emoji} {title}</span>
          <span className="retro-count-badge">{items.length}</span>
        </div>

        <form onSubmit={handleAdd} className="retro-input-box">
          <input
            type="text"
            placeholder={`Add to ${title}...`}
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
                    {author ? author.name : 'Team Member'}
                  </div>

                  <div className="retro-card-actions">
                    {type === 'action_item' && (
                      <button
                        className={`btn-convert-issue ${linkedKey ? 'converted' : ''}`}
                        onClick={() => !linkedKey && handleConvertToIssue(item)}
                        title="Convert action item to Backlog Task"
                      >
                        {linkedKey ? (
                          <>
                            <IconCheck size={12} /> {linkedKey}
                          </>
                        ) : (
                          '🎟️ + Issue'
                        )}
                      </button>
                    )}

                    <button
                      className="btn-vote"
                      onClick={() => voteRetroItem(item.id)}
                      title="Upvote item"
                    >
                      👍 {item.votes}
                    </button>
                    <button
                      className="btn-delete-retro"
                      onClick={() => deleteRetroItem(item.id)}
                      title="Delete item"
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
          <h2>🔄 Active Sprint Retrospective</h2>
          <p className="subtext">
            Reflect on sprint progress, highlight wins, diagnose bottlenecks, and commit to action items.
          </p>
        </div>

        {/* View Mode Sub-tabs */}
        <div className="retro-tabs-toggle">
          <button
            className={`retro-tab-btn ${retroSubTab === 'board' ? 'active' : ''}`}
            onClick={() => setRetroSubTab('board')}
          >
            📌 Retrospective Board
          </button>
          <button
            className={`retro-tab-btn ${retroSubTab === 'actions' ? 'active' : ''}`}
            onClick={() => setRetroSubTab('actions')}
          >
            🎯 Action Item Execution ({convertedCount}/{actionItems.length})
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
          <h3>🤖 AI Team Sentiment & Retrospective Digest</h3>
          <span className="sentiment-badge">{sentimentPct}% Positive Sentiment</span>
        </div>
        <div className="summary-grid">
          <div className="summary-box">
            <div className="s-label">Sprint Team Morale</div>
            <div className="s-value">High Alignment (🟢 Strong)</div>
            <div className="s-desc">{wentWellItems.length} positive accomplishments logged</div>
          </div>
          <div className="summary-box">
            <div className="s-label">Key Area for Growth</div>
            <div className="s-value">{toImproveItems[0]?.content || 'CI/CD build pipeline speed'}</div>
            <div className="s-desc">Top voted improvement item by team</div>
          </div>
          <div className="summary-box">
            <div className="s-label">Action Ticket Conversion</div>
            <div className="s-value">{conversionPct}% Converted ({convertedCount}/{actionItems.length})</div>
            <div className="s-desc">Convert all to backlog tickets with 1-click</div>
          </div>
        </div>
      </div>

      {retroSubTab === 'board' ? (
        <div className="retro-grid">
          {renderColumn('What Went Well', 'went_well', 'badge-went-well', '🟢')}
          {renderColumn('What Can Be Improved', 'to_improve', 'badge-to-improve', '🟠')}
          {renderColumn('Action Items', 'action_item', 'badge-action-item', '🔵')}
        </div>
      ) : (
        /* Action Items Execution & Backlog Conversion Tracker */
        <div className="action-items-tracker-card animate-fade-in">
          <div className="tracker-header">
            <div>
              <h3>🎯 Action Item Execution & Backlog Conversion Matrix</h3>
              <p className="subtext">Track and convert retrospective action items into assigned backlog tasks</p>
            </div>
            <button
              className="btn-primary-sm"
              onClick={handleConvertAllActionItems}
              disabled={actionItems.length === 0 || convertedCount === actionItems.length}
            >
              ⚡ Convert All ({actionItems.length - convertedCount}) to Backlog Tasks
            </button>
          </div>

          <div className="action-items-table-wrap">
            <table className="action-items-table">
              <thead>
                <tr>
                  <th>Action Item Description</th>
                  <th>Votes</th>
                  <th>Author</th>
                  <th>Conversion Status</th>
                  <th>Backlog Issue Key</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {actionItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-text">No action items created yet in this retrospective.</td>
                  </tr>
                ) : (
                  actionItems.map((item) => {
                    const author = users.find((u) => u.id === item.authorId);
                    const linkedKey = convertedIds[item.id];
                    return (
                      <tr key={item.id}>
                        <td className="font-semibold">{item.content}</td>
                        <td><span className="vote-chip">👍 {item.votes}</span></td>
                        <td>
                          {author ? (
                            <div className="user-info-flex">
                              <img src={author.avatar} alt="" className="avatar-xs" />
                              <span>{author.name}</span>
                            </div>
                          ) : (
                            'Team Member'
                          )}
                        </td>
                        <td>
                          {linkedKey ? (
                            <span className="status-converted">✅ Converted to Ticket</span>
                          ) : (
                            <span className="status-pending">⏳ Pending Conversion</span>
                          )}
                        </td>
                        <td className="font-mono font-bold">{linkedKey || '-'}</td>
                        <td>
                          {!linkedKey ? (
                            <button
                              className="btn-primary-sm"
                              onClick={() => handleConvertToIssue(item)}
                            >
                              🎟️ Convert to Issue
                            </button>
                          ) : (
                            <span className="text-tertiary">Done</span>
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
