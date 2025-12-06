import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MoreVertical, BookOpen, Check, CheckCheck, ShoppingCart, X, Reply, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDirectMessages, ReplyData } from '@/hooks/useDirectMessages';
import { ChatAttachmentMenu, PendingAttachmentPreview, type PendingAttachment } from '@/components/flyfit/ChatAttachmentMenu';
import { soundFeedback } from '@/utils/soundFeedback';
import { toast } from 'sonner';
import { format, differenceInMinutes } from 'date-fns';
import { pl } from 'date-fns/locale';

interface FriendProfile {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
}

const MESSAGE_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

export default function DirectChat() {
  const { odgerId } = useParams<{ odgerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, isLoading, isSending, sendMessage, sendImageMessage, sendVoiceMessage, sendShoppingListMessage, deleteMessage, toggleReaction } = useDirectMessages(odgerId);
  
  const [input, setInput] = useState('');
  const [friendProfile, setFriendProfile] = useState<FriendProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyData | null>(null);
  const [contextMenuMessage, setContextMenuMessage] = useState<string | null>(null);
  const [friendIsTyping, setFriendIsTyping] = useState(false);
  const [friendIsOnline, setFriendIsOnline] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const emojiInputRef = useRef<HTMLInputElement>(null);

  // Touch handling refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [swipingMessageId, setSwipingMessageId] = useState<string | null>(null);
  const [swipeX, setSwipeX] = useState(0);

  // Fetch friend profile
  useEffect(() => {
    if (!odgerId) {
      setProfileLoading(false);
      return;
    }

    let mounted = true;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, username, avatar_url')
          .eq('user_id', odgerId)
          .maybeSingle();

        if (!mounted) return;

        if (!error && data) {
          setFriendProfile({
            displayName: data.display_name || 'Użytkownik',
            username: data.username,
            avatarUrl: data.avatar_url,
          });
        } else {
          setFriendProfile({
            displayName: 'Użytkownik',
            username: null,
            avatarUrl: null,
          });
        }
      } catch {
        if (mounted) {
          setFriendProfile({
            displayName: 'Użytkownik',
            username: null,
            avatarUrl: null,
          });
        }
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => { mounted = false; };
  }, [odgerId]);

  // Typing indicator realtime channel
  useEffect(() => {
    if (!user?.id || !odgerId) return;

    const channelName = [user.id, odgerId].sort().join('-');
    const channel = supabase.channel(`typing:${channelName}`);
    
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.userId === odgerId) {
          setFriendIsTyping(true);
          // Clear previous timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          // Hide typing after 3 seconds
          typingTimeoutRef.current = setTimeout(() => {
            setFriendIsTyping(false);
          }, 3000);
        }
      })
      .subscribe();

    typingChannelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [user?.id, odgerId]);

  // Online presence tracking
  useEffect(() => {
    if (!user?.id || !odgerId) return;

    const presenceChannel = supabase.channel('online-users');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineUsers = Object.values(state).flat() as unknown as { user_id: string }[];
        setFriendIsOnline(onlineUsers.some(u => u.user_id === odgerId));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    presenceChannelRef.current = presenceChannel;

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user?.id, odgerId]);

  // Broadcast typing status
  const broadcastTyping = () => {
    if (typingChannelRef.current && user?.id) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id },
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Play sound when new message arrives from friend
    if (messages.length > prevMessagesLengthRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.senderId !== user?.id) {
        soundFeedback.messageReceived();
      }
    }
    prevMessagesLengthRef.current = messages.length;
    
    // Clear optimistic messages when real ones arrive
    setOptimisticMessages([]);
    
    // Stop typing indicator when message arrives
    setFriendIsTyping(false);
  }, [messages, user?.id]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const messageContent = input.trim();
    setInput('');
    const currentReplyTo = replyingTo;
    setReplyingTo(null);
    
    soundFeedback.messageSent();
    
    const optimisticMessage = {
      id: `optimistic-${Date.now()}`,
      senderId: user?.id,
      receiverId: odgerId,
      content: messageContent,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      readAt: null,
      isOptimistic: true,
      replyTo: currentReplyTo,
    };
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    
    const success = await sendMessage(messageContent, 'text', undefined, currentReplyTo?.id);
    
    if (!success) {
      toast.error('Nie udało się wysłać wiadomości');
      setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const success = await deleteMessage(messageId);
    if (success) {
      toast.success('Wiadomość usunięta');
    } else {
      toast.error('Nie udało się usunąć wiadomości');
    }
    setContextMenuMessage(null);
  };

  const handleReply = (messageId: string, content: string, senderName: string) => {
    setReplyingTo({ id: messageId, content, senderName });
    setContextMenuMessage(null);
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const minutesAgo = differenceInMinutes(now, date);
      
      if (minutesAgo < 1) {
        return 'teraz';
      } else if (minutesAgo < 30) {
        return `${minutesAgo} min temu`;
      } else {
        return format(date, 'HH:mm', { locale: pl });
      }
    } catch {
      return '';
    }
  };

  const goToProfile = () => {
    soundFeedback.buttonClick();
    navigate(`/znajomi/${odgerId}`);
  };

  // Touch handlers for swipe and long press
  const handleTouchStart = (e: React.TouchEvent, messageId: string, isOwn: boolean) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    setSwipingMessageId(messageId);
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      setContextMenuMessage(messageId);
      try { soundFeedback.buttonClick(); } catch {}
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !swipingMessageId) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Cancel long press if moving
    if (Math.abs(deltaX) > 10 || deltaY > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
    
    // Swipe to the right for reply - prevent page scrolling
    if (deltaY < 30 && deltaX > 0) {
      e.preventDefault();
      setSwipeX(Math.min(deltaX, 80));
    }
  };

  const handleTouchEnd = (messageId: string, content: string, senderName: string) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Trigger reply if swiped enough
    if (swipeX > 60) {
      try { soundFeedback.buttonClick(); } catch {}
      handleReply(messageId, content, senderName);
    }
    
    setSwipeX(0);
    setSwipingMessageId(null);
    touchStartRef.current = null;
  };

  // Image message component
  const ImageMessage = ({ imageUrl }: { imageUrl: string }) => {
    return (
      <div className="mt-2 rounded-2xl overflow-hidden max-w-[250px]">
        <img 
          src={imageUrl} 
          alt="Zdjęcie" 
          className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(imageUrl, '_blank')}
        />
      </div>
    );
  };

  // Voice message component
  const VoiceMessage = ({ audioUrl, duration, isOwn }: { audioUrl: string; duration?: number; isOwn: boolean }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [actualDuration, setActualDuration] = useState<number | undefined>(duration);
    const [isDragging, setIsDragging] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      // Cleanup audio on unmount
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }
      };
    }, []);

    const initAudio = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = 'anonymous';
        audioRef.current.preload = 'metadata';
        
        audioRef.current.onloadedmetadata = () => {
          if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
            setActualDuration(audioRef.current.duration);
          }
        };
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setProgress(0);
        };
        
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration) && !isDragging) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        };
        
        audioRef.current.onerror = (error) => {
          console.error('Audio playback error:', error);
          setIsPlaying(false);
          toast.error('Nie udało się odtworzyć wiadomości głosowej');
        };
        
        audioRef.current.src = audioUrl;
      }
      return audioRef.current;
    };

    const togglePlay = async (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        const audio = initAudio();

        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (playError) {
            console.error('Play error:', playError);
            toast.error('Nie udało się odtworzyć wiadomości głosowej');
          }
        }
      } catch (error) {
        console.error('Voice message error:', error);
      }
    };

    const handleSeek = (clientX: number) => {
      if (!progressBarRef.current || !audioRef.current) return;
      
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      
      setProgress(percentage);
      
      if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
        audioRef.current.currentTime = (percentage / 100) * audioRef.current.duration;
      }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      initAudio();
      setIsDragging(true);
      handleSeek(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      e.stopPropagation();
      initAudio();
      setIsDragging(true);
      handleSeek(e.touches[0].clientX);
    };

    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        handleSeek(e.clientX);
      };

      const handleTouchMove = (e: TouchEvent) => {
        handleSeek(e.touches[0].clientX);
      };

      const handleEnd = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }, [isDragging]);

    const formatDuration = (seconds?: number) => {
      if (!seconds || !isFinite(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div 
        className="flex items-center gap-3 min-w-[150px]"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlay(e);
          }}
          className={cn(
            "h-10 w-10 rounded-full shrink-0",
            isOwn ? "bg-primary-foreground/20 hover:bg-primary-foreground/30" : "bg-primary/20 hover:bg-primary/30"
          )}
        >
          {isPlaying ? (
            <Pause className={cn("h-5 w-5", isOwn ? "text-primary-foreground" : "text-primary")} />
          ) : (
            <Play className={cn("h-5 w-5", isOwn ? "text-primary-foreground" : "text-primary")} />
          )}
        </Button>
        <div className="flex-1 min-w-[80px]">
          <div 
            ref={progressBarRef}
            className={cn(
              "h-2 rounded-full overflow-hidden cursor-pointer relative",
              isOwn ? "bg-primary-foreground/30" : "bg-muted"
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div 
              className={cn(
                "h-full transition-all pointer-events-none",
                isOwn ? "bg-primary-foreground" : "bg-primary",
                isDragging ? "transition-none" : "transition-all"
              )}
              style={{ width: `${progress}%` }}
            />
            {/* Seek handle */}
            <div 
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md pointer-events-none transition-transform",
                isOwn ? "bg-primary-foreground" : "bg-primary",
                isDragging ? "scale-125" : "scale-100"
              )}
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>
          <span className={cn(
            "text-xs mt-1 block",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {formatDuration(actualDuration)}
          </span>
        </div>
      </div>
    );
  };

  const RecipeMessage = ({ recipeData }: { recipeData: any }) => {
    if (!recipeData) return null;
    
    return (
      <Card className="bg-card/50 border-border/50 mt-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{recipeData.name || 'Przepis'}</span>
          </div>
          {recipeData.calories && (
            <p className="text-xs text-muted-foreground">
              {recipeData.calories} kcal • B: {recipeData.protein || 0}g • W: {recipeData.carbs || 0}g • T: {recipeData.fat || 0}g
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const ShoppingListMessage = ({ shoppingListId, activityData, isSender }: { 
    shoppingListId: string; 
    activityData?: any;
    isSender: boolean;
  }) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try { soundFeedback.buttonClick(); } catch {}
      navigate(`/lista-zakupow/${shoppingListId}`);
    };

    const getSelfMessage = () => {
      if (!activityData || !isSender) return null;
      
      const gender = activityData.senderGender;
      
      switch (activityData.activityType) {
        case 'reaction': {
          const verb = gender === 'female' ? 'Zareagowałaś' : 'Zareagowałeś';
          return `${verb} ${activityData.emoji} na listę zakupów`;
        }
        case 'comment': {
          const verb = gender === 'female' ? 'Skomentowałaś' : 'Skomentowałeś';
          const shortComment = activityData.commentText?.slice(0, 25) || '';
          return `${verb} listę: "${shortComment}${activityData.commentText?.length > 25 ? '...' : ''}"`;
        }
        case 'note': {
          const verb = gender === 'female' ? 'Dodałaś' : 'Dodałeś';
          return `${verb} notatkę do listy zakupów`;
        }
        default:
          return null;
      }
    };

    const selfMessage = getSelfMessage();

    return (
      <Card className="bg-card/50 border-border/50 mt-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4 text-secondary" />
            <span className="font-semibold text-sm">Lista zakupów</span>
          </div>
          {selfMessage && (
            <p className="text-xs text-muted-foreground mb-2">{selfMessage}</p>
          )}
          <Button size="sm" className="w-full mt-1" onClick={handleClick}>
            Wyświetl
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (profileLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // No profile found
  if (!friendProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <p className="text-muted-foreground mb-4">Nie znaleziono użytkownika</p>
        <Button onClick={() => navigate('/czat')}>Wróć do czatów</Button>
      </div>
    );
  }

  const allMessages = [...messages, ...optimisticMessages.filter(om => 
    !messages.some(m => m.content === om.content && m.senderId === om.senderId)
  )];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              soundFeedback.buttonClick();
              navigate('/czat');
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <button 
            onClick={goToProfile}
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage src={friendProfile.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {(friendProfile.displayName?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {friendIsOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-card" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-foreground truncate">
                {friendProfile.displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                {friendIsTyping ? 'pisze...' : friendIsOnline ? 'online' : friendProfile.username ? `@${friendProfile.username}` : 'offline'}
              </p>
            </div>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={goToProfile}>
                Zobacz profil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <button onClick={goToProfile}>
              <Avatar className="h-20 w-20 border-4 border-border mb-4 hover:opacity-80 transition-opacity">
                <AvatarImage src={friendProfile.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                  {(friendProfile.displayName?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
            <h2 className="text-lg font-bold text-foreground mb-1">
              {friendProfile.displayName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Napisz pierwszą wiadomość! 👋
            </p>
          </div>
        )}

        {allMessages.map((message) => {
          const isOwn = message.senderId === user?.id;
          const isOptimistic = (message as any).isOptimistic;
          const isSwiping = swipingMessageId === message.id;
          const senderName = isOwn ? 'Ty' : friendProfile.displayName;
          
          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 relative select-none',
                isOwn ? 'flex-row-reverse' : 'flex-row'
              )}
              style={{
                transform: isSwiping ? `translateX(${swipeX}px)` : 'translateX(0)',
                transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
                WebkitUserSelect: 'none',
                touchAction: swipingMessageId ? 'none' : 'pan-y',
              }}
              onTouchStart={(e) => handleTouchStart(e, message.id, isOwn)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(message.id, message.content, senderName)}
            >
              {/* Swipe reply indicator */}
              {isSwiping && swipeX > 20 && (
                <div 
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full flex items-center justify-center',
                    'w-10 h-10 rounded-full bg-primary/20 transition-opacity',
                    swipeX > 60 ? 'opacity-100' : 'opacity-50'
                  )}
                >
                  <Reply className="h-5 w-5 text-primary" />
                </div>
              )}

              {!isOwn && (
                <button onClick={goToProfile}>
                  <Avatar className="h-8 w-8 shrink-0 hover:opacity-80 transition-opacity">
                    <AvatarImage src={friendProfile.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {(friendProfile.displayName?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              )}
              
              <div className={cn('max-w-[75%]', isOwn && 'text-right')}>
                {/* Reply preview */}
                {message.replyTo && (
                  <div className={cn(
                    'mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 border-primary/50',
                    'bg-muted/50 text-muted-foreground max-w-full',
                    isOwn ? 'ml-auto text-right' : 'text-left'
                  )}>
                    <span className="font-medium text-primary/80">{message.replyTo.senderName}</span>
                    <p className="truncate">{message.replyTo.content}</p>
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={cn(
                    'px-4 py-3 rounded-3xl inline-block relative group',
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-lg'
                      : 'bg-card border-2 border-border/50 text-foreground rounded-bl-lg',
                    isOptimistic && 'opacity-70'
                  )}
                  onDoubleClick={() => !isOptimistic && setActiveReactionMessageId(
                    activeReactionMessageId === message.id ? null : message.id
                  )}
                >
                  {/* Text message */}
                  {message.messageType === 'text' && (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}

                  {/* Image message */}
                  {message.messageType === 'image' && (
                    <ImageMessage imageUrl={message.content} />
                  )}

                  {/* Voice message */}
                  {message.messageType === 'voice' && (
                    <VoiceMessage 
                      audioUrl={message.content} 
                      duration={message.recipeData?.duration}
                      isOwn={isOwn}
                    />
                  )}
                  
                  {message.messageType === 'recipe' && message.recipeData && (
                    <RecipeMessage recipeData={message.recipeData} />
                  )}
                  
                  {(message.messageType === 'shopping_list' || message.messageType === 'shopping_list_activity') && (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <ShoppingListMessage
                        shoppingListId={message.shoppingListId || (message.recipeData as any)?.shoppingListId || ''} 
                        activityData={message.recipeData}
                        isSender={isOwn}
                      />
                    </>
                  )}
                  
                  {/* Reactions with animation */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className={cn(
                      'flex items-center gap-1 mt-2 flex-wrap',
                      isOwn ? 'justify-end' : 'justify-start'
                    )}>
                      {Object.entries(message.reactions).map(([emoji, usersRaw]) => {
                        const users = usersRaw as Array<{ odgerId: string; name: string }>;
                        if (!users || users.length === 0) return null;
                        const hasReacted = users.some(u => u.odgerId === user?.id);
                        const names = users.map(u => u.name).join(', ');
                        return (
                          <button
                            key={emoji}
                            onClick={() => {
                              try { soundFeedback.buttonClick(); } catch {}
                              toggleReaction(message.id, emoji, 'Ty');
                            }}
                            title={names}
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5',
                              'transition-all duration-200 hover:scale-110',
                              hasReacted 
                                ? 'bg-primary/30 border border-primary animate-[bounce-in_0.3s_ease-out]' 
                                : 'bg-muted/50 border border-transparent hover:bg-muted'
                            )}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px]">{users.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Reaction picker */}
                  {activeReactionMessageId === message.id && !isOptimistic && (
                    <div className={cn(
                      'absolute -bottom-10 bg-card rounded-full shadow-lg border border-border/50 px-2 py-1.5 flex items-center gap-1 z-20',
                      'animate-scale-in',
                      isOwn ? 'right-0' : 'left-0'
                    )}>
                      {MESSAGE_REACTION_EMOJIS.map((emoji, idx) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            try { soundFeedback.buttonClick(); } catch {}
                            toggleReaction(message.id, emoji, 'Ty');
                            setActiveReactionMessageId(null);
                          }}
                          className="text-lg hover:scale-125 transition-transform p-0.5"
                          style={{ 
                            animation: `pop 0.2s ease-out ${idx * 0.05}s both`
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  'flex items-center gap-1 mt-1 px-2',
                  isOwn ? 'justify-end' : 'justify-start'
                )}>
                  <p className="text-xs text-muted-foreground">
                    {formatMessageTime(message.createdAt)}
                  </p>
                  
                  {isOwn && !isOptimistic && (
                    <span className="text-muted-foreground">
                      {message.readAt ? (
                        <CheckCheck className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Context menu overlay */}
      {contextMenuMessage && (
        <div 
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center animate-fade-in"
          onClick={() => setContextMenuMessage(null)}
        >
          <div 
            className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-scale-in min-w-[200px]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => {
                const msg = allMessages.find(m => m.id === contextMenuMessage);
                if (msg) {
                  const senderName = msg.senderId === user?.id ? 'Ty' : friendProfile.displayName;
                  handleReply(msg.id, msg.content, senderName);
                }
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <Reply className="h-5 w-5 text-primary" />
              <span>Odpowiedz</span>
            </button>
            
            {allMessages.find(m => m.id === contextMenuMessage)?.senderId === user?.id && (
              <button
                onClick={() => handleDeleteMessage(contextMenuMessage)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-destructive/10 transition-colors text-destructive"
              >
                <X className="h-5 w-5" />
                <span>Usuń</span>
              </button>
            )}
            
            <button
              onClick={() => setContextMenuMessage(null)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-t border-border/50"
            >
              <X className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Anuluj</span>
            </button>
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {friendIsTyping && (
        <div className="px-4 py-2 flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={friendProfile?.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {(friendProfile?.displayName?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="bg-card border-2 border-border/50 rounded-3xl rounded-bl-lg px-4 py-3 flex items-center gap-1">
            <span 
              className="w-2 h-2 bg-muted-foreground rounded-full"
              style={{ animation: 'typing-bounce 1s ease-in-out infinite', animationDelay: '0ms' }}
            />
            <span 
              className="w-2 h-2 bg-muted-foreground rounded-full"
              style={{ animation: 'typing-bounce 1s ease-in-out infinite', animationDelay: '150ms' }}
            />
            <span 
              className="w-2 h-2 bg-muted-foreground rounded-full"
              style={{ animation: 'typing-bounce 1s ease-in-out infinite', animationDelay: '300ms' }}
            />
          </div>
        </div>
      )}

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border/50 flex items-center gap-3 animate-slide-up-fade">
          <div className="w-1 h-10 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">{replyingTo.senderName}</p>
            <p className="text-sm text-muted-foreground truncate">{replyingTo.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setReplyingTo(null)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
        {pendingAttachment ? (
          <div className="flex gap-2 items-center">
            <PendingAttachmentPreview
              pendingAttachment={pendingAttachment}
              onClear={() => {
                if (pendingAttachment.previewUrl) {
                  URL.revokeObjectURL(pendingAttachment.previewUrl);
                }
                setPendingAttachment(null);
              }}
              onFlip={() => {
                setPendingAttachment({
                  ...pendingAttachment,
                  isFlipped: !pendingAttachment.isFlipped,
                });
              }}
              onSend={async () => {
                setIsUploadingAttachment(true);
                try {
                  if (pendingAttachment.type === 'image' && pendingAttachment.file) {
                    let fileToUpload: Blob = pendingAttachment.file;
                    
                    // If image is flipped, create a flipped version
                    if (pendingAttachment.isFlipped) {
                      try {
                        const img = document.createElement('img');
                        img.src = pendingAttachment.previewUrl!;
                        await new Promise((resolve) => { img.onload = resolve; });
                        
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        const ctx = canvas.getContext('2d');
                        
                        if (ctx) {
                          ctx.translate(canvas.width, 0);
                          ctx.scale(-1, 1);
                          ctx.drawImage(img, 0, 0);
                          
                          fileToUpload = await new Promise<Blob>((resolve, reject) => {
                            canvas.toBlob((blob) => {
                              if (blob) resolve(blob);
                              else reject(new Error('Failed to create blob'));
                            }, 'image/jpeg', 0.9);
                          });
                        }
                      } catch (flipError) {
                        console.error('Error flipping image:', flipError);
                        // Continue with original file if flipping fails
                      }
                    }
                    
                    const fileExt = pendingAttachment.isFlipped ? 'jpg' : pendingAttachment.file.name.split('.').pop();
                    const fileName = `${Date.now()}.${fileExt}`;
                    const filePath = `${user?.id}/${fileName}`;
                    
                    const { error: uploadError } = await supabase.storage
                      .from('chat-media')
                      .upload(filePath, fileToUpload);
                    
                    if (uploadError) throw uploadError;
                    
                    const { data } = supabase.storage
                      .from('chat-media')
                      .getPublicUrl(filePath);
                    
                    await sendImageMessage(data.publicUrl);
                    toast.success('Zdjęcie wysłane');
                  } else if (pendingAttachment.type === 'voice' && pendingAttachment.blob) {
                    // Determine file extension based on mime type for iOS compatibility
                    const getVoiceFileExtension = (mimeType?: string) => {
                      if (!mimeType) return 'webm';
                      if (mimeType.includes('mp4') || mimeType.includes('aac') || mimeType.includes('mpeg')) return 'm4a';
                      if (mimeType.includes('ogg')) return 'ogg';
                      return 'webm';
                    };
                    
                    const fileExt = getVoiceFileExtension(pendingAttachment.mimeType);
                    const fileName = `${Date.now()}.${fileExt}`;
                    const filePath = `${user?.id}/${fileName}`;
                    
                    const { error: uploadError } = await supabase.storage
                      .from('chat-media')
                      .upload(filePath, pendingAttachment.blob);
                    
                    if (uploadError) throw uploadError;
                    
                    const { data } = supabase.storage
                      .from('chat-media')
                      .getPublicUrl(filePath);
                    
                    await sendVoiceMessage(data.publicUrl, pendingAttachment.duration || 0);
                    toast.success('Wiadomość głosowa wysłana');
                  }
                  
                  if (pendingAttachment.previewUrl) {
                    URL.revokeObjectURL(pendingAttachment.previewUrl);
                  }
                  setPendingAttachment(null);
                } catch (error) {
                  console.error('Error sending attachment:', error);
                  toast.error('Nie udało się wysłać załącznika');
                } finally {
                  setIsUploadingAttachment(false);
                }
              }}
              isUploading={isUploadingAttachment}
            />
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <Input
              ref={emojiInputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.trim()) {
                  broadcastTyping();
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder={replyingTo ? "Napisz odpowiedź..." : "Napisz wiadomość..."}
              disabled={isSending}
              className="flex-1 rounded-2xl border-2 h-12"
            />
            
            <ChatAttachmentMenu
              onSendImage={sendImageMessage}
              onSendVoice={sendVoiceMessage}
              onSendShoppingList={sendShoppingListMessage}
              disabled={isSending}
              pendingAttachment={pendingAttachment}
              setPendingAttachment={setPendingAttachment}
            />
            
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              size="icon"
              className="w-12 h-12 rounded-2xl shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
