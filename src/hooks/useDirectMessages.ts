import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MessageReaction {
  odgerId: string;
  name: string;
}

export interface MessageReactions {
  [emoji: string]: MessageReaction[];
}

export interface ReplyData {
  id: string;
  content: string;
  senderName: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'recipe' | 'shopping_list' | 'shopping_list_activity' | 'image' | 'voice';
  recipeData?: any;
  shoppingListId?: string;
  createdAt: string;
  readAt: string | null;
  reactions?: MessageReactions;
  replyToId?: string | null;
  replyTo?: ReplyData | null;
}

export interface ChatPreview {
  odgerId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

// Fetch chat previews
async function fetchChatPreviewsData(userId: string): Promise<ChatPreview[]> {
  const { data: messagesData, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  const conversationsMap = new Map<string, {
    messages: any[];
    partnerId: string;
  }>();

  (messagesData || []).forEach(msg => {
    if (!msg) return;
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
    
    if (!conversationsMap.has(partnerId)) {
      conversationsMap.set(partnerId, { messages: [], partnerId });
    }
    conversationsMap.get(partnerId)!.messages.push(msg);
  });

  const partnerIds = Array.from(conversationsMap.keys());
  
  if (partnerIds.length === 0) {
    return [];
  }

  // Use RPC function for secure profile access
  const profilesPromises = partnerIds.map(id => 
    supabase.rpc('get_friend_profile', { friend_user_id: id })
  );
  const profilesResults = await Promise.all(profilesPromises);
  const profiles = profilesResults
    .filter(r => !r.error && r.data?.length > 0)
    .map(r => r.data[0]);

  const previews: ChatPreview[] = [];

  conversationsMap.forEach((conv, partnerId) => {
    const profile = profiles?.find(p => p.user_id === partnerId);
    const latestMsg = conv.messages[0];
    if (!latestMsg) return;
    
    const unreadCount = conv.messages.filter(
      m => m.receiver_id === userId && !m.read_at
    ).length;

    let lastMessageText = latestMsg.content || '';
    if (latestMsg.message_type === 'recipe') {
      lastMessageText = '📖 Udostępniono przepis';
    } else if (latestMsg.message_type === 'shopping_list') {
      lastMessageText = '🛒 Udostępniono listę zakupów';
    } else if (latestMsg.message_type === 'shopping_list_activity') {
      lastMessageText = latestMsg.content || '🛒 Aktywność na liście zakupów';
    }

    previews.push({
      odgerId: partnerId,
      displayName: profile?.display_name || 'Użytkownik',
      username: profile?.username || null,
      avatarUrl: profile?.avatar_url || null,
      lastMessage: lastMessageText,
      lastMessageTime: latestMsg.created_at,
      unreadCount,
    });
  });

  previews.sort((a, b) => 
    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  return previews;
}

// Fetch messages for a specific conversation
async function fetchMessagesData(userId: string, friendId: string): Promise<DirectMessage[]> {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  const messagesWithReplies = (data || []).map(m => {
    if (!m) return null;
    const replyToMsg = m.reply_to_id ? data.find(r => r?.id === m.reply_to_id) : null;
    return {
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      content: m.content || '',
      messageType: (m.message_type || 'text') as DirectMessage['messageType'],
      recipeData: m.recipe_data,
      shoppingListId: (m.recipe_data as any)?.shoppingListId,
      createdAt: m.created_at,
      readAt: m.read_at,
      reactions: (m as any).reactions || {},
      replyToId: (m as any).reply_to_id || null,
      replyTo: replyToMsg ? {
        id: replyToMsg.id,
        content: replyToMsg.content || '',
        senderName: replyToMsg.sender_id === userId ? 'Ty' : 'Znajomy',
      } : null,
    };
  }).filter(Boolean) as DirectMessage[];

  // Mark messages as read in background
  (async () => {
    try {
      await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', userId)
        .eq('sender_id', friendId)
        .is('read_at', null);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  })();

  return messagesWithReplies;
}

export function useDirectMessages(friendId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Query for chat previews (when no friendId)
  const previewsQuery = useQuery({
    queryKey: ['chatPreviews', user?.id],
    queryFn: () => fetchChatPreviewsData(user!.id),
    enabled: !!user && !friendId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Query for messages (when friendId is provided)
  const messagesQuery = useQuery({
    queryKey: ['directMessages', user?.id, friendId],
    queryFn: () => fetchMessagesData(user!.id, friendId!),
    enabled: !!user && !!friendId,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    // Cleanup previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`direct-messages-${friendId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          // Check if this message is relevant to the current user
          const isRelevant = 
            newRecord?.sender_id === user.id || 
            newRecord?.receiver_id === user.id ||
            oldRecord?.sender_id === user.id ||
            oldRecord?.receiver_id === user.id;
            
          if (!isRelevant) return;

          // Invalidate queries to refetch
          if (friendId) {
            queryClient.invalidateQueries({ queryKey: ['directMessages', user.id, friendId] });
          } else {
            queryClient.invalidateQueries({ queryKey: ['chatPreviews', user.id] });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, friendId, queryClient]);

  const sendMessage = useCallback(async (
    content: string, 
    type: DirectMessage['messageType'] = 'text', 
    recipeData?: any,
    replyToId?: string | null
  ) => {
    if (!user || !friendId || !content?.trim()) return false;

    setIsSending(true);
    try {
      const insertData: any = {
        sender_id: user.id,
        receiver_id: friendId,
        content: content.trim(),
        message_type: type,
        recipe_data: recipeData,
      };
      
      if (replyToId) {
        insertData.reply_to_id = replyToId;
      }

      const { error } = await supabase
        .from('direct_messages')
        .insert(insertData);

      if (error) {
        console.error('Error sending message:', error);
        return false;
      }
      
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['directMessages', user.id, friendId] });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [user, friendId, queryClient]);

  const sendImageMessage = useCallback(async (imageUrl: string) => {
    if (!imageUrl) return false;
    return sendMessage(imageUrl, 'image');
  }, [sendMessage]);

  const sendVoiceMessage = useCallback(async (audioUrl: string, duration: number) => {
    if (!audioUrl) return false;
    return sendMessage(audioUrl, 'voice', { duration });
  }, [sendMessage]);

  const sendShoppingListMessage = useCallback(async (listId: string) => {
    if (!listId) return false;
    return sendMessage('🛒 Udostępniono Ci listę zakupów!', 'shopping_list', { shoppingListId: listId });
  }, [sendMessage]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user || !messageId) return false;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('Error deleting message:', error);
        return false;
      }

      // Optimistic update
      queryClient.setQueryData(
        ['directMessages', user.id, friendId],
        (old: DirectMessage[] | undefined) => old?.filter(m => m.id !== messageId) || []
      );
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, [user, friendId, queryClient]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string, userName: string) => {
    if (!user || !messageId || !emoji) return false;

    try {
      const { data: msgData, error: fetchError } = await supabase
        .from('direct_messages')
        .select('reactions')
        .eq('id', messageId)
        .maybeSingle();

      if (fetchError || !msgData) {
        console.error('Error fetching message:', fetchError);
        return false;
      }

      const currentReactions: MessageReactions = (msgData as any)?.reactions || {};
      const emojiReactions = currentReactions[emoji] || [];
      const hasReacted = emojiReactions.some(r => r.odgerId === user.id);

      let newReactions: MessageReactions;
      if (hasReacted) {
        newReactions = {
          ...currentReactions,
          [emoji]: emojiReactions.filter(r => r.odgerId !== user.id)
        };
        if (newReactions[emoji].length === 0) {
          delete newReactions[emoji];
        }
      } else {
        newReactions = {
          ...currentReactions,
          [emoji]: [...emojiReactions, { odgerId: user.id, name: userName || 'Ty' }]
        };
      }

      const { error } = await supabase
        .from('direct_messages')
        .update({ reactions: newReactions } as any)
        .eq('id', messageId);

      if (error) {
        console.error('Error updating reaction:', error);
        return false;
      }

      // Optimistic update
      queryClient.setQueryData(
        ['directMessages', user.id, friendId],
        (old: DirectMessage[] | undefined) => 
          old?.map(m => m.id === messageId ? { ...m, reactions: newReactions } : m) || []
      );

      return true;
    } catch (error) {
      console.error('Error toggling reaction:', error);
      return false;
    }
  }, [user, friendId, queryClient]);

  return {
    messages: messagesQuery.data || [],
    chatPreviews: previewsQuery.data || [],
    isLoading: friendId ? messagesQuery.isLoading : previewsQuery.isLoading,
    isSending,
    sendMessage,
    sendImageMessage,
    sendVoiceMessage,
    sendShoppingListMessage,
    deleteMessage,
    toggleReaction,
    refreshMessages: () => queryClient.invalidateQueries({ queryKey: ['directMessages', user?.id, friendId] }),
    refreshPreviews: () => queryClient.invalidateQueries({ queryKey: ['chatPreviews', user?.id] }),
  };
}
