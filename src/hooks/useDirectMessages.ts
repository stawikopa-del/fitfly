import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'recipe';
  recipeData?: any;
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
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch chat previews (all conversations)
  const fetchChatPreviews = useCallback(async () => {
    if (!user) return;

    try {
      // Get all direct messages involving the user
      const { data: messagesData, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationsMap = new Map<string, {
        messages: any[];
        partnerId: string;
      }>();

      messagesData?.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, { messages: [], partnerId });
        }
        conversationsMap.get(partnerId)!.messages.push(msg);
      });

      // Get partner profiles
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
        const unreadCount = conv.messages.filter(
          m => m.receiver_id === user.id && !m.read_at
        ).length;

        previews.push({
          odgerId: partnerId,
          displayName: profile?.display_name || 'Użytkownik',
          username: profile?.username,
          avatarUrl: profile?.avatar_url,
          lastMessage: latestMsg.message_type === 'recipe' 
            ? '📖 Udostępniono przepis' 
            : latestMsg.content,
          lastMessageTime: latestMsg.created_at,
          unreadCount,
        });
      });

      // Sort by most recent message
      previews.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setChatPreviews(previews);
    } catch (error) {
      console.error('Error fetching chat previews:', error);
    }
  }, [user]);

  // Fetch messages for specific conversation
  const fetchMessages = useCallback(async () => {
    if (!user || !friendId) return;

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
        data?.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          content: m.content,
          messageType: m.message_type as 'text' | 'recipe',
          recipeData: m.recipe_data,
          createdAt: m.created_at,
          readAt: m.read_at,
        })) || []
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
    } finally {
      setIsLoading(false);
    }
  }, [user, friendId]);

  // Send message
  const sendMessage = async (content: string, type: 'text' | 'recipe' = 'text', recipeData?: any) => {
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
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('direct-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: friendId 
            ? `or(and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id}))`
            : `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
        },
        () => {
          if (friendId) {
            fetchMessages();
          } else {
            fetchChatPreviews();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, friendId, fetchMessages, fetchChatPreviews]);

  // Initial fetch
  useEffect(() => {
    if (friendId) {
      fetchMessages();
    } else {
      fetchChatPreviews();
      setIsLoading(false);
    }
  }, [friendId, fetchMessages, fetchChatPreviews]);

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
