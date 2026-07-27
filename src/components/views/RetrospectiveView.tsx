import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { RetrospectiveItem, User } from '../../types/Aether';
import { IconPlus, IconTrash } from '../common/Icons';

export const RetrospectiveView: React.FC = () => {
  const { retrospectiveItems, addRetroItem, voteRetroItem, deleteRetroItem, users } = useAether();
  
  const [newContent, setNewContent] = useState('');
  const [targetColumn, setTargetColumn] = useState<'went_well' | 'to_improve' | 'action_item'>('went_well');

  const handleAdd = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    addRetroItem(targetColumn, newContent.trim());
    setNewContent('');
  };

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
            return (
              <div key={item.id} className="retro-card animate-fade-in">
                <div className="retro-card-body">{item.content}</div>
                <div className="retro-card-footer">
                  <div className="retro-author">
                    {author ? author.name : 'Team Member'}
                  </div>
                  <div className="retro-card-actions">
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
      <div className="view-header-bar">
        <div>
          <h2>🔄 Active Sprint Retrospective</h2>
          <p className="subtext">
            Reflect on sprint progress, highlight wins, diagnose bottlenecks, and commit to action items.
          </p>
        </div>
      </div>

      <div className="retro-grid">
        {renderColumn('What Went Well', 'went_well', 'badge-went-well', '🟢')}
        {renderColumn('What Can Be Improved', 'to_improve', 'badge-to-improve', '🟠')}
        {renderColumn('Action Items', 'action_item', 'badge-action-item', '🔵')}
      </div>
    </div>
  );
};
