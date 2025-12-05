import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Friend {
  id: string;
  friendshipId: string;
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  progress?: {
    steps: number;
    water: number;
    activeMinutes: number;
  };
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string | null;
  senderDisplayName: string | null;
  senderAvatarUrl: string | null;
  createdAt: string;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const operationInProgress = useRef(false);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch accepted friendships
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) throw error;

      const friendIds = friendships?.map(f => 
        f.sender_id === user.id ? f.receiver_id : f.sender_id
      ) || [];

      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      // Fetch friend profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', friendIds);

      if (profilesError) throw profilesError;

      // Fetch today's progress for friends
      const today = new Date().toISOString().split('T')[0];
      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('user_id, steps, water, active_minutes')
        .in('user_id', friendIds)
        .eq('progress_date', today);

      const friendsList: Friend[] = profiles?.map(profile => {
        const friendship = friendships?.find(f => 
          f.sender_id === profile.user_id || f.receiver_id === profile.user_id
        );
        const progress = progressData?.find(p => p.user_id === profile.user_id);
        
        return {
          id: profile.user_id,
          friendshipId: friendship?.id || '',
          userId: profile.user_id,
          username: profile.username,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          progress: progress ? {
            steps: progress.steps,
            water: progress.water,
            activeMinutes: progress.active_minutes
          } : undefined
        };
      }) || [];

      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  }, [user]);

  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch pending requests where current user is receiver
      const { data: requests, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      if (!requests || requests.length === 0) {
        setPendingRequests([]);
        return;
      }

      const senderIds = requests.map(r => r.sender_id);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', senderIds);

      const pendingList: FriendRequest[] = requests.map(req => {
        const profile = profiles?.find(p => p.user_id === req.sender_id);
        return {
          id: req.id,
          senderId: req.sender_id,
          senderUsername: profile?.username || null,
          senderDisplayName: profile?.display_name || null,
          senderAvatarUrl: profile?.avatar_url || null,
          createdAt: req.created_at
        };
      });

      setPendingRequests(pendingList);

      // Fetch sent requests
      const { data: sent } = await supabase
        .from('friendships')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      setSentRequests(sent?.map(s => s.receiver_id) || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  }, [user]);

  const searchUsers = useCallback(async (query: string) => {
    if (!user || !query.trim()) return [];

    try {
      // Use secure RPC function for user discovery (requires authentication)
      const { data, error } = await supabase
        .rpc('search_profiles', { search_term: query });

      if (error) throw error;

      // Filter out current user from results
      const filtered = (data || []).filter((p: { user_id: string }) => p.user_id !== user.id);
      return filtered.slice(0, 10);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, [user]);

  const sendFriendRequest = useCallback(async (receiverId: string) => {
    if (!user || operationInProgress.current) return false;

    operationInProgress.current = true;
    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Zaproszenie już zostało wysłane');
        } else {
          throw error;
        }
        return false;
      }

      toast.success('Zaproszenie wysłane!');
      setSentRequests(prev => [...prev, receiverId]);
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Nie udało się wysłać zaproszenia');
      return false;
    } finally {
      operationInProgress.current = false;
    }
  }, [user]);

  const acceptRequest = useCallback(async (requestId: string) => {
    if (operationInProgress.current) return false;

    operationInProgress.current = true;
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Zaproszenie zaakceptowane!');
      await Promise.all([fetchFriends(), fetchPendingRequests()]);
      return true;
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Nie udało się zaakceptować zaproszenia');
      return false;
    } finally {
      operationInProgress.current = false;
    }
  }, [fetchFriends, fetchPendingRequests]);

  const rejectRequest = useCallback(async (requestId: string) => {
    if (operationInProgress.current) return false;

    operationInProgress.current = true;
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Zaproszenie odrzucone');
      await fetchPendingRequests();
      return true;
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Nie udało się odrzucić zaproszenia');
      return false;
    } finally {
      operationInProgress.current = false;
    }
  }, [fetchPendingRequests]);

  const removeFriend = useCallback(async (friendshipId: string) => {
    if (operationInProgress.current) return false;

    operationInProgress.current = true;
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Znajomy usunięty');
      setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Nie udało się usunąć znajomego');
      return false;
    } finally {
      operationInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([fetchFriends(), fetchPendingRequests()])
        .finally(() => setIsLoading(false));

      // Real-time subscription to friendships changes
      const channel = supabase
        .channel('friendships-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `sender_id=eq.${user.id}`
          },
          () => {
            fetchFriends();
            fetchPendingRequests();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `receiver_id=eq.${user.id}`
          },
          () => {
            fetchFriends();
            fetchPendingRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchFriends, fetchPendingRequests]);

  const getInviteLink = useCallback(() => {
    return `${window.location.origin}/invite/${user?.id || ''}`;
  }, [user]);

  const shareInviteLink = useCallback(async () => {
    if (!user) return;

    const inviteLink = getInviteLink();
    const shareData = {
      title: 'Dołącz do FITFLY!',
      text: 'Hej! Dodaj mnie do znajomych w FITFLY! 💪',
      url: inviteLink
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Link udostępniony!');
      } else {
        await navigator.clipboard.writeText(inviteLink);
        toast.success('Link skopiowany do schowka!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(inviteLink);
        toast.success('Link skopiowany do schowka!');
      }
    }
  }, [user, getInviteLink]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    isLoading,
    searchUsers,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    shareInviteLink,
    getInviteLink,
    refresh: () => Promise.all([fetchFriends(), fetchPendingRequests()])
  };
}
