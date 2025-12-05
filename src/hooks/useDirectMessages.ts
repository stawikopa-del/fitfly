import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'recipe' | 'shopping_list' | 'shopping_list_activity';
  recipeData?: any;
  shoppingListId?: string;
  createdAt: string;
  readAt: string | null;
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

export function useDirectMessages(friendId?: string) {
  const { user, isInitialized } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchChatPreviews = useCallback(async () => {
    if (!user) {
      setChatPreviews([]);
      return;
    }

    try {
      const { data: messagesData, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationsMap = new Map<string, {
        messages: any[];
        partnerId: string;
      }>();

      (messagesData || []).forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, { messages: [], partnerId });
        }
        conversationsMap.get(partnerId)!.messages.push(msg);
      });

      const partnerIds = Array.from(conversationsMap.keys());
      
      if (partnerIds.length === 0) {
        setChatPreviews([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', partnerIds);

      const previews: ChatPreview[] = [];

      conversationsMap.forEach((conv, partnerId) => {
        const profile = profiles?.find(p => p.user_id === partnerId);
        const latestMsg = conv.messages[0];
        if (!latestMsg) return;
        
        const unreadCount = conv.messages.filter(
          m => m.receiver_id === user.id && !m.read_at
        ).length;

        previews.push({
          odgerId: partnerId,
          displayName: profile?.display_name || 'Użytkownik',
          username: profile?.username || null,
          avatarUrl: profile?.avatar_url || null,
          lastMessage: latestMsg.message_type === 'recipe' 
            ? '📖 Udostępniono przepis' 
            : latestMsg.message_type === 'shopping_list'
            ? '🛒 Udostępniono listę zakupów'
            : latestMsg.message_type === 'shopping_list_activity'
            ? latestMsg.content || '🛒 Aktywność na liście zakupów'
            : latestMsg.content || '',
          lastMessageTime: latestMsg.created_at,
          unreadCount,
        });
      });

      previews.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setChatPreviews(previews);
    } catch (error) {
      console.error('Error fetching chat previews:', error);
      setChatPreviews([]);
    }
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!user || !friendId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(
        (data || []).map(m => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          content: m.content || '',
          messageType: (m.message_type || 'text') as 'text' | 'recipe' | 'shopping_list' | 'shopping_list_activity',
          recipeData: m.recipe_data,
          shoppingListId: (m.recipe_data as any)?.shoppingListId,
          createdAt: m.created_at,
          readAt: m.read_at,
        }))
      );

      // Mark messages as read
      await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', user.id)
        .eq('sender_id', friendId)
        .is('read_at', null);

    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, friendId]);

  const sendMessage = useCallback(async (content: string, type: 'text' | 'recipe' | 'shopping_list' = 'text', recipeData?: any) => {
    if (!user || !friendId || !content.trim()) return false;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: friendId,
          content: content.trim(),
          message_type: type,
          recipe_data: recipeData,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [user, friendId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isInitialized || !user) return;

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

          if (friendId) {
            fetchMessages();
          } else {
            fetchChatPreviews();
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
  }, [user, isInitialized, friendId, fetchMessages, fetchChatPreviews]);

  // Initial fetch
  useEffect(() => {
    if (!isInitialized) return;
    
    if (friendId) {
      fetchMessages();
    } else {
      fetchChatPreviews();
      setIsLoading(false);
    }
  }, [isInitialized, friendId, fetchMessages, fetchChatPreviews]);

  return {
    messages,
    chatPreviews,
    isLoading,
    isSending,
    sendMessage,
    refreshMessages: fetchMessages,
    refreshPreviews: fetchChatPreviews,
  };
}
