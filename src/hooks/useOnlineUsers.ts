import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface OnlineUser {
  user_id: string;
  username: string;
  online_at: string;
}

export const useOnlineUsers = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      setOnlineUsers([]);
      return;
    }

    const presenceChannel = supabase.channel('online_users');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: OnlineUser[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          if (presences && presences.length > 0) {
            const presence = presences[0];
            if (presence && presence.user_id) {
              users.push({
                user_id: presence.user_id,
                username: presence.username || 'Unknown',
                online_at: presence.online_at || new Date().toISOString()
              });
            }
          }
        });
        
        setOnlineUsers(users.filter(u => u.user_id !== user.id));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get username from profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

          await presenceChannel.track({
            user_id: user.id,
            username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user]);

  return { onlineUsers, channel };
};
