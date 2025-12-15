import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/errorHandler';

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
  const { user, isInitialized } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Separate operation guards for different action types
  const sendRequestInProgressRef = useRef<Set<string>>(new Set()); // Track per-receiver
  const acceptInProgressRef = useRef<Set<string>>(new Set()); // Track per-request
  const rejectInProgressRef = useRef<Set<string>>(new Set()); // Track per-request
  const removeInProgressRef = useRef<Set<string>>(new Set()); // Track per-friendship
  const fetchInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchFriends = useCallback(async () => {
    if (!user) {
      setFriends([]);
      return;
    }

    // Prevent concurrent fetches
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;

    try {
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) {
        handleApiError(error, 'useFriends.fetchFriends', { silent: true });
        return;
      }

      if (!friendships || friendships.length === 0) {
        if (mountedRef.current) setFriends([]);
        return;
      }

      const friendIds = friendships.map(f => 
        f.sender_id === user.id ? f.receiver_id : f.sender_id
      );

      const profilesPromises = friendIds.map(id => 
        supabase.rpc('get_friend_profile', { friend_user_id: id })
      );
      const profilesResults = await Promise.all(profilesPromises);
      
      const profiles = profilesResults
        .filter(r => !r.error && r.data?.length > 0)
        .map(r => r.data[0]);

      let today: string;
      try {
        today = new Date().toISOString().split('T')[0];
      } catch {
        today = new Date().toLocaleDateString('en-CA');
      }

      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('user_id, steps, water, active_minutes')
        .in('user_id', friendIds)
        .eq('progress_date', today);

      if (!mountedRef.current) return;

      const friendsList: Friend[] = friendIds.map(friendId => {
        const friendship = friendships.find(f => 
          f.sender_id === friendId || f.receiver_id === friendId
        );
        const profile = profiles?.find(p => p.user_id === friendId);
        const progress = progressData?.find(p => p.user_id === friendId);
        
        return {
          id: friendId,
          friendshipId: friendship?.id || '',
          userId: friendId,
          username: profile?.username || null,
          displayName: profile?.display_name || null,
          avatarUrl: profile?.avatar_url || null,
          progress: progress ? {
            steps: progress.steps || 0,
            water: progress.water || 0,
            activeMinutes: progress.active_minutes || 0
          } : undefined
        };
      });

      if (mountedRef.current) {
        setFriends(friendsList);
      }
    } catch (error) {
      handleApiError(error, 'useFriends.fetchFriends', { fallbackMessage: 'Nie udało się pobrać listy znajomych' });
      if (mountedRef.current) setFriends([]);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [user]);

  const fetchPendingRequests = useCallback(async () => {
    if (!user) {
      setPendingRequests([]);
      setSentRequests([]);
      return;
    }

    try {
      const { data: requests, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) {
        handleApiError(error, 'useFriends.fetchPendingRequests', { silent: true });
        return;
      }

      if (!requests || requests.length === 0) {
        if (mountedRef.current) setPendingRequests([]);
      } else {
        const senderIds = requests.map(r => r.sender_id);
        
        const profilesPromises = senderIds.map(id => 
          supabase.rpc('get_friend_profile', { friend_user_id: id })
        );
        const profilesResults = await Promise.all(profilesPromises);
        const profiles = profilesResults
          .filter(r => !r.error && r.data?.length > 0)
          .map(r => r.data[0]);

        if (!mountedRef.current) return;

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

        if (mountedRef.current) setPendingRequests(pendingList);
      }

      const { data: sent } = await supabase
        .from('friendships')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      if (mountedRef.current) {
        setSentRequests(sent?.map(s => s.receiver_id) || []);
      }
    } catch (error) {
      handleApiError(error, 'useFriends.fetchPendingRequests', { silent: true });
    }
  }, [user]);

  const searchUsers = useCallback(async (query: string) => {
    if (!user || !query?.trim()) return [];

    try {
      const { data, error } = await supabase
        .rpc('search_profiles', { search_term: query });

      if (error) {
        handleApiError(error, 'useFriends.searchUsers', { silent: true });
        return [];
      }

      const filtered = (data || []).filter((p: { user_id: string }) => p.user_id !== user.id);
      return filtered.slice(0, 10);
    } catch (error) {
      handleApiError(error, 'useFriends.searchUsers', { silent: true });
      return [];
    }
  }, [user]);

  const sendFriendRequest = useCallback(async (receiverId: string) => {
    if (!user) return false;
    
    // Prevent concurrent requests to same receiver
    if (sendRequestInProgressRef.current.has(receiverId)) return false;
    sendRequestInProgressRef.current.add(receiverId);

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
          handleApiError(error, 'useFriends.sendFriendRequest', { fallbackMessage: 'Nie udało się wysłać zaproszenia' });
        }
        return false;
      }

      toast.success('Zaproszenie wysłane!');
      if (mountedRef.current) {
        setSentRequests(prev => [...prev, receiverId]);
      }
      return true;
    } catch (error) {
      handleApiError(error, 'useFriends.sendFriendRequest', { fallbackMessage: 'Nie udało się wysłać zaproszenia' });
      return false;
    } finally {
      sendRequestInProgressRef.current.delete(receiverId);
    }
  }, [user]);

  const acceptRequest = useCallback(async (requestId: string) => {
    // Prevent concurrent accepts for same request
    if (acceptInProgressRef.current.has(requestId)) return false;
    acceptInProgressRef.current.add(requestId);

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) {
        handleApiError(error, 'useFriends.acceptRequest', { fallbackMessage: 'Nie udało się zaakceptować zaproszenia' });
        return false;
      }

      toast.success('Zaproszenie zaakceptowane!');
      if (mountedRef.current) {
        await Promise.all([fetchFriends(), fetchPendingRequests()]);
      }
      return true;
    } catch (error) {
      handleApiError(error, 'useFriends.acceptRequest', { fallbackMessage: 'Nie udało się zaakceptować zaproszenia' });
      return false;
    } finally {
      acceptInProgressRef.current.delete(requestId);
    }
  }, [fetchFriends, fetchPendingRequests]);

  const rejectRequest = useCallback(async (requestId: string) => {
    // Prevent concurrent rejects for same request
    if (rejectInProgressRef.current.has(requestId)) return false;
    rejectInProgressRef.current.add(requestId);

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) {
        handleApiError(error, 'useFriends.rejectRequest', { fallbackMessage: 'Nie udało się odrzucić zaproszenia' });
        return false;
      }

      toast.success('Zaproszenie odrzucone');
      if (mountedRef.current) await fetchPendingRequests();
      return true;
    } catch (error) {
      handleApiError(error, 'useFriends.rejectRequest', { fallbackMessage: 'Nie udało się odrzucić zaproszenia' });
      return false;
    } finally {
      rejectInProgressRef.current.delete(requestId);
    }
  }, [fetchPendingRequests]);

  const removeFriend = useCallback(async (friendshipId: string) => {
    // Prevent concurrent removes for same friendship
    if (removeInProgressRef.current.has(friendshipId)) return false;
    removeInProgressRef.current.add(friendshipId);

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        handleApiError(error, 'useFriends.removeFriend', { fallbackMessage: 'Nie udało się usunąć znajomego' });
        return false;
      }

      toast.success('Znajomy usunięty');
      if (mountedRef.current) {
        setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
      }
      return true;
    } catch (error) {
      handleApiError(error, 'useFriends.removeFriend', { fallbackMessage: 'Nie udało się usunąć znajomego' });
      return false;
    } finally {
      removeInProgressRef.current.delete(friendshipId);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!isInitialized) return;
    
    if (!user) {
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all([fetchFriends(), fetchPendingRequests()])
      .finally(() => {
        if (mountedRef.current) setIsLoading(false);
      });

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
          if (mountedRef.current) {
            fetchFriends();
            fetchPendingRequests();
          }
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
          if (mountedRef.current) {
            fetchFriends();
            fetchPendingRequests();
          }
        }
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [user, isInitialized, fetchFriends, fetchPendingRequests]);

  const getInviteLink = useCallback(() => {
    if (typeof window === 'undefined' || !user?.id) return '';
    try {
      return `${window.location.origin}/invite/${user.id}`;
    } catch {
      return '';
    }
  }, [user]);

  const shareInviteLink = useCallback(async () => {
    if (!user) return;

    const inviteLink = getInviteLink();
    if (!inviteLink) {
      toast.error('Nie udało się utworzyć linku');
      return;
    }

    const shareData = {
      title: 'Dołącz do FITFLY!',
      text: 'Hej! Dodaj mnie do znajomych w FITFLY! 💪',
      url: inviteLink
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success('Link udostępniony!');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteLink);
        toast.success('Link skopiowany do schowka!');
      } else {
        toast.error('Nie można udostępnić linku');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(inviteLink);
            toast.success('Link skopiowany do schowka!');
          }
        } catch {
          toast.error('Nie udało się skopiować linku');
        }
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
