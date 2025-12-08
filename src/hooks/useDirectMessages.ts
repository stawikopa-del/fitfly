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
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true for skeleton
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const mountedRef = useRef(true);

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

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (!mountedRef.current) return;

      const conversationsMap = new Map<string, {
        messages: any[];
        partnerId: string;
      }>();

      (messagesData || []).forEach(msg => {
        if (!msg) return;
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, { messages: [], partnerId });
        }
        conversationsMap.get(partnerId)!.messages.push(msg);
      });

      const partnerIds = Array.from(conversationsMap.keys());
      
      if (partnerIds.length === 0) {
        if (mountedRef.current) setChatPreviews([]);
        return;
      }

      // Use RPC function for secure profile access
      const profilesPromises = partnerIds.map(id => 
        supabase.rpc('get_friend_profile', { friend_user_id: id })
      );
      const profilesResults = await Promise.all(profilesPromises);
      const profiles = profilesResults
        .filter(r => !r.error && r.data?.length > 0)
        .map(r => r.data[0]);

      if (!mountedRef.current) return;

      const previews: ChatPreview[] = [];

      conversationsMap.forEach((conv, partnerId) => {
        const profile = profiles?.find(p => p.user_id === partnerId);
        const latestMsg = conv.messages[0];
        if (!latestMsg) return;
        
        const unreadCount = conv.messages.filter(
          m => m.receiver_id === user.id && !m.read_at
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

      if (mountedRef.current) {
        setChatPreviews(previews);
      }
    } catch (error) {
      console.error('Error fetching chat previews:', error);
      if (mountedRef.current) setChatPreviews([]);
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

      if (error) {
        console.error('Error fetching messages:', error);
        if (mountedRef.current) {
          setMessages([]);
          setIsLoading(false);
        }
        return;
      }

      if (!mountedRef.current) return;

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
            senderName: replyToMsg.sender_id === user.id ? 'Ty' : 'Znajomy',
          } : null,
        };
      }).filter(Boolean) as DirectMessage[];

      if (mountedRef.current) {
        setMessages(messagesWithReplies);
      }

      // Mark messages as read
      try {
        await supabase
          .from('direct_messages')
          .update({ read_at: new Date().toISOString() })
          .eq('receiver_id', user.id)
          .eq('sender_id', friendId)
          .is('read_at', null);
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }

    } catch (error) {
      console.error('Error fetching messages:', error);
      if (mountedRef.current) setMessages([]);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [user, friendId]);

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
    if (!imageUrl) return false;
    return sendMessage(imageUrl, 'image');
  }, [sendMessage]);

  // Send voice message
  const sendVoiceMessage = useCallback(async (audioUrl: string, duration: number) => {
    if (!audioUrl) return false;
    return sendMessage(audioUrl, 'voice', { duration });
  }, [sendMessage]);

  // Send shopping list
  const sendShoppingListMessage = useCallback(async (listId: string) => {
    if (!listId) return false;
    return sendMessage('🛒 Udostępniono Ci listę zakupów!', 'shopping_list', { shoppingListId: listId });
  }, [sendMessage]);

  // Delete a message
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

      if (mountedRef.current) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, [user]);

  // Toggle reaction on a message
  const toggleReaction = useCallback(async (messageId: string, emoji: string, userName: string) => {
    if (!user || !messageId || !emoji) return false;

    try {
      // Get current message
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
          [emoji]: [...emojiReactions, { odgerId: user.id, name: userName || 'Ty' }]
        };
      }

      // Use raw SQL-style update to bypass type checking for new column
      const { error } = await supabase
        .from('direct_messages')
        .update({ reactions: newReactions } as any)
        .eq('id', messageId);

      if (error) {
        console.error('Error updating reaction:', error);
        return false;
      }

      // Update local state
      if (mountedRef.current) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, reactions: newReactions } : m
        ));
      }

      return true;
    } catch (error) {
      console.error('Error toggling reaction:', error);
      return false;
    }
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    mountedRef.current = true;
    
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
          if (!mountedRef.current) return;
          
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
      mountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, friendId, fetchMessages, fetchChatPreviews]);

  // Initial fetch - immediately when user is available
  useEffect(() => {
    if (!user) return;
    
    if (friendId) {
      fetchMessages();
    } else {
      fetchChatPreviews();
    }
  }, [user, friendId, fetchMessages, fetchChatPreviews]);

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