import React, { useEffect, useState } from 'react';
import { onPresenceChange, trackUserPresence, type OnlinePresence } from '../../services/presenceService';
import { useAether } from '../../context/AetherContextValue';

export const TeamPresenceBar: React.FC = () => {
  const { currentUser, viewMode, t } = useAether();
  const [onlineUsers, setOnlineUsers] = useState<OnlinePresence[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const viewName = t ? t(`view_${viewMode}`) || viewMode : viewMode;

    try {
      const unsubTrack = trackUserPresence(currentUser, viewName);
      const unsubscribe = onPresenceChange((users) => {
        setOnlineUsers(users);
      });

      return () => {
        if (typeof unsubTrack === 'function') unsubTrack();
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    } catch (e) {
      console.error('Presence error:', e);
    }
  }, [currentUser, viewMode, t]);

  if (!currentUser || onlineUsers.length === 0) return null;

  const maxDisplay = 3;
  const displayedUsers = onlineUsers.slice(0, maxDisplay);
  const overflowCount = onlineUsers.length - maxDisplay;

  return (
    <div className="team-presence-bar">
      {displayedUsers.map((user) => (
        <div key={user.userId} className="presence-avatar-container" title={`${user.userName} · ${user.viewMode}`}>
          <img src={user.userAvatar} alt={user.userName} className="presence-avatar" />
          <span className="presence-pulse-dot" />
        </div>
      ))}
      {overflowCount > 0 && (
        <div className="presence-avatar-more" title={`추가 ${overflowCount}명 접속 중`}>
          +{overflowCount}
        </div>
      )}
    </div>
  );
};
