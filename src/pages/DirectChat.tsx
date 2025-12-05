import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MoreVertical, BookOpen, Check, CheckCheck, ShoppingCart } from 'lucide-react';
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
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { soundFeedback } from '@/utils/soundFeedback';
import { toast } from 'sonner';
import { format, differenceInMinutes } from 'date-fns';
import { pl } from 'date-fns/locale';

interface FriendProfile {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
}

export default function DirectChat() {
  const { odgerId } = useParams<{ odgerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, isLoading, isSending, sendMessage } = useDirectMessages(odgerId);
  
  const [input, setInput] = useState('');
  const [friendProfile, setFriendProfile] = useState<FriendProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

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
  }, [messages, user?.id]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const messageContent = input.trim();
    setInput('');
    
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
    };
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    
    const success = await sendMessage(messageContent);
    
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

  const ShoppingListMessage = ({ shoppingListId }: { shoppingListId: string }) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        soundFeedback.buttonClick();
      } catch {}
      navigate('/lista-zakupow');
    };

    return (
      <Card className="bg-card/50 border-border/50 mt-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4 text-secondary" />
            <span className="font-semibold text-sm">Lista zakupów</span>
          </div>
          <Button 
            size="sm" 
            className="w-full mt-2"
            onClick={handleClick}
          >
            Zobacz listę zakupów
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

  // No profile found - show fallback
  if (!friendProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <p className="text-muted-foreground mb-4">Nie znaleziono użytkownika</p>
        <Button onClick={() => navigate('/czat')}>Wróć do czatów</Button>
      </div>
    );
  }

  // Combine real messages with optimistic ones
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
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage src={friendProfile.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {(friendProfile.displayName?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-foreground truncate">
                {friendProfile.displayName}
              </p>
              {friendProfile.username && (
                <p className="text-xs text-muted-foreground">@{friendProfile.username}</p>
              )}
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
          
          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 animate-slide-up-fade',
                isOwn ? 'flex-row-reverse' : 'flex-row'
              )}
            >
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
                <div
                  className={cn(
                    'px-4 py-3 rounded-3xl inline-block',
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-lg'
                      : 'bg-card border-2 border-border/50 text-foreground rounded-bl-lg',
                    isOptimistic && 'opacity-70'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.messageType === 'recipe' && message.recipeData && (
                    <RecipeMessage recipeData={message.recipeData} />
                  )}
                  
                  {message.messageType === 'shopping_list' && (
                    <ShoppingListMessage shoppingListId={message.shoppingListId || ''} />
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

      {/* Input */}
      <div className="px-4 py-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Napisz wiadomość..."
            disabled={isSending}
            className="flex-1 rounded-2xl border-2 h-12"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            size="icon"
            className="w-12 h-12 rounded-2xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
