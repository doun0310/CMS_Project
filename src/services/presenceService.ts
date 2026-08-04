import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '../types/Aether';

export interface OnlinePresence {
  userId: string;
  userName: string;
  userAvatar: string;
  viewMode: string;
  onlineAt: string;
}

// Fallback for mock environment
let mockOnlineUsers: OnlinePresence[] = [
  {
    userId: 'u1',
    userName: 'Alice (Mock)',
    userAvatar: 'https://i.pravatar.cc/150?u=alice',
    viewMode: 'Kanban Board 보는 중',
    onlineAt: new Date().toISOString()
  },
  {
    userId: 'u2',
    userName: 'Bob (Mock)',
    userAvatar: 'https://i.pravatar.cc/150?u=bob',
    viewMode: 'Backlog 정리 중',
    onlineAt: new Date().toISOString()
  }
];
let mockListeners: ((users: OnlinePresence[]) => void)[] = [];

export const trackUserPresence = (user: User, currentView: string): () => void => {
  if (!isSupabaseConfigured) {
    // mock behavior
    const presence: OnlinePresence = {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      viewMode: currentView,
      onlineAt: new Date().toISOString()
    };
    mockOnlineUsers = mockOnlineUsers.filter(u => u.userId !== user.id);
    mockOnlineUsers.push(presence);
    mockListeners.forEach(listener => listener([...mockOnlineUsers]));

    return () => {
      mockOnlineUsers = mockOnlineUsers.filter(u => u.userId !== user.id);
      mockListeners.forEach(listener => listener([...mockOnlineUsers]));
    };
  }

  const room = supabase.channel('room:workspace');

  room
    .on('presence', { event: 'sync' }, () => {
      // presence state structure: { [key: string]: Presence[] }
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await room.track({
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          viewMode: currentView,
          onlineAt: new Date().toISOString(),
        });
      }
    });

  return () => {
    room.untrack();
    supabase.removeChannel(room);
  };
};

export const onPresenceChange = (callback: (onlineUsers: OnlinePresence[]) => void) => {
  if (!isSupabaseConfigured) {
    mockListeners.push(callback);
    callback([...mockOnlineUsers]);
    return () => {
      mockListeners = mockListeners.filter(l => l !== callback);
    };
  }

  const room = supabase.channel('room:workspace');
  
  room.on('presence', { event: 'sync' }, () => {
    const state = room.presenceState();
    const users: OnlinePresence[] = [];
    
    for (const id in state) {
      const presences = state[id] as any[];
      if (presences.length > 0) {
        users.push(presences[0] as OnlinePresence);
      }
    }
    
    // Deduplicate by userId
    const uniqueUsers = Array.from(new Map(users.map(item => [item.userId, item])).values());
    callback(uniqueUsers);
  });

  if (room.state !== 'joined') {
    room.subscribe();
  }

  return () => {
    supabase.removeChannel(room);
  };
};
