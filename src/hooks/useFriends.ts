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
  const { user, isInitialized } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // No initial loading delay
  const operationInProgress = useRef(false);
  const mountedRef = useRef(true);

  const fetchFriends = useCallback(async () => {
    if (!user) {
      setFriends([]);
      return;
    }

    try {
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching friendships:', error);
        return;
      }

      if (!friendships || friendships.length === 0) {
        if (mountedRef.current) setFriends([]);
        return;
      }

      const friendIds = friendships.map(f => 
        f.sender_id === user.id ? f.receiver_id : f.sender_id
      );

      // Fetch profiles using RPC function for secure friend access
      const profilesPromises = friendIds.map(id => 
        supabase.rpc('get_friend_profile', { friend_user_id: id })
      );
      const profilesResults = await Promise.all(profilesPromises);
      
      const profiles = profilesResults
        .filter(r => !r.error && r.data?.length > 0)
        .map(r => r.data[0]);

      // Get today's date safely
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
      console.error('Error fetching friends:', error);
      if (mountedRef.current) setFriends([]);
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
        console.error('Error fetching pending requests:', error);
        return;
      }

      if (!requests || requests.length === 0) {
        if (mountedRef.current) setPendingRequests([]);
      } else {
        const senderIds = requests.map(r => r.sender_id);
        
        // Use RPC function for profile access
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
      console.error('Error fetching pending requests:', error);
    }
  }, [user]);

  const searchUsers = useCallback(async (query: string) => {
    if (!user || !query?.trim()) return [];

    try {
      const { data, error } = await supabase
        .rpc('search_profiles', { search_term: query });

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

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
          console.error('Error sending friend request:', error);
          toast.error('Nie udało się wysłać zaproszenia');
        }
        return false;
      }

      toast.success('Zaproszenie wysłane!');
      if (mountedRef.current) {
        setSentRequests(prev => [...prev, receiverId]);
      }
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

      if (error) {
        console.error('Error accepting request:', error);
        toast.error('Nie udało się zaakceptować zaproszenia');
        return false;
      }

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

      if (error) {
        console.error('Error rejecting request:', error);
        toast.error('Nie udało się odrzucić zaproszenia');
        return false;
      }

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

      if (error) {
        console.error('Error removing friend:', error);
        toast.error('Nie udało się usunąć znajomego');
        return false;
      }

      toast.success('Znajomy usunięty');
      if (mountedRef.current) {
        setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
      }
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