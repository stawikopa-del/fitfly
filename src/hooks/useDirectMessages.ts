import { useState, useEffect, useCallback, useRef } from 'react';
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

      const messagesWithReplies = (data || []).map(m => {
        const replyToMsg = m.reply_to_id ? data.find(r => r.id === m.reply_to_id) : null;
        return {
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          content: m.content || '',
          messageType: (m.message_type || 'text') as 'text' | 'recipe' | 'shopping_list' | 'shopping_list_activity',
          recipeData: m.recipe_data,
          shoppingListId: (m.recipe_data as any)?.shoppingListId,
          createdAt: m.created_at,
          readAt: m.read_at,
          reactions: (m as any).reactions || {},
          replyToId: (m as any).reply_to_id || null,
          replyTo: replyToMsg ? {
            id: replyToMsg.id,
            content: replyToMsg.content || '',
            senderName: replyToMsg.sender_id === user.id ? 'Ty' : 'Znajomy',
          } : null,
        };
      });

      setMessages(messagesWithReplies);

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

  const sendMessage = useCallback(async (
    content: string, 
    type: 'text' | 'recipe' | 'shopping_list' | 'image' | 'voice' = 'text', 
    recipeData?: any,
    replyToId?: string | null
  ) => {
    if (!user || !friendId || !content.trim()) return false;

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

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [user, friendId]);

  // Send image message
  const sendImageMessage = useCallback(async (imageUrl: string) => {
    return sendMessage(imageUrl, 'image');
  }, [sendMessage]);

  // Send voice message
  const sendVoiceMessage = useCallback(async (audioUrl: string, duration: number) => {
    return sendMessage(audioUrl, 'voice', { duration });
  }, [sendMessage]);

  // Send shopping list
  const sendShoppingListMessage = useCallback(async (listId: string) => {
    return sendMessage('🛒 Udostępniono Ci listę zakupów!', 'shopping_list', { shoppingListId: listId });
  }, [sendMessage]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== messageId));
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, [user]);

  // Toggle reaction on a message
  const toggleReaction = useCallback(async (messageId: string, emoji: string, userName: string) => {
    if (!user) return false;

    try {
      // Get current message
      const { data: msgData, error: fetchError } = await supabase
        .from('direct_messages')
        .select('reactions')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      const currentReactions: MessageReactions = (msgData as any)?.reactions || {};
      const emojiReactions = currentReactions[emoji] || [];
      const hasReacted = emojiReactions.some(r => r.odgerId === user.id);

      let newReactions: MessageReactions;
      if (hasReacted) {
        // Remove reaction
        newReactions = {
          ...currentReactions,
          [emoji]: emojiReactions.filter(r => r.odgerId !== user.id)
        };
        if (newReactions[emoji].length === 0) {
          delete newReactions[emoji];
        }
      } else {
        // Add reaction
        newReactions = {
          ...currentReactions,
          [emoji]: [...emojiReactions, { odgerId: user.id, name: userName }]
        };
      }

      // Use raw SQL-style update to bypass type checking for new column
      const { error } = await supabase
        .from('direct_messages')
        .update({ reactions: newReactions } as any)
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, reactions: newReactions } : m
      ));

      return true;
    } catch (error) {
      console.error('Error toggling reaction:', error);
      return false;
    }
  }, [user]);

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
    sendImageMessage,
    sendVoiceMessage,
    sendShoppingListMessage,
    deleteMessage,
    toggleReaction,
    refreshMessages: fetchMessages,
    refreshPreviews: fetchChatPreviews,
  };
}
