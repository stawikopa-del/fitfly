import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MoreVertical, Image, BookOpen } from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch friend profile
  useEffect(() => {
    if (!odgerId) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url')
        .eq('user_id', odgerId)
        .single();

      if (!error && data) {
        setFriendProfile({
          displayName: data.display_name || 'Użytkownik',
          username: data.username,
          avatarUrl: data.avatar_url,
        });
      }
    };

    fetchProfile();
  }, [odgerId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    soundFeedback.buttonClick();
    const success = await sendMessage(input);
    
    if (success) {
      setInput('');
    } else {
      toast.error('Nie udało się wysłać wiadomości');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: pl });
  };

  const RecipeMessage = ({ recipeData }: { recipeData: any }) => (
    <Card className="bg-card/50 border-border/50 mt-2">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{recipeData.name || 'Przepis'}</span>
        </div>
        {recipeData.calories && (
          <p className="text-xs text-muted-foreground">
            {recipeData.calories} kcal • B: {recipeData.protein}g • W: {recipeData.carbs}g • T: {recipeData.fat}g
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (!friendProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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

          <Avatar className="h-10 w-10 border-2 border-border">
            <AvatarImage src={friendProfile.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {friendProfile.displayName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {friendProfile.displayName}
            </p>
            {friendProfile.username && (
              <p className="text-xs text-muted-foreground">@{friendProfile.username}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/profil/${odgerId}`)}>
                Zobacz profil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Avatar className="h-20 w-20 border-4 border-border mb-4">
              <AvatarImage src={friendProfile.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                {friendProfile.displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-bold text-foreground mb-1">
              {friendProfile.displayName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Napisz pierwszą wiadomość! 👋
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isOwn = message.senderId === user?.id;
          
          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 animate-slide-up-fade',
                isOwn ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={friendProfile.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {friendProfile.displayName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={cn('max-w-[75%]', isOwn && 'text-right')}>
                <div
                  className={cn(
                    'px-4 py-3 rounded-3xl inline-block',
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-lg'
                      : 'bg-card border-2 border-border/50 text-foreground rounded-bl-lg'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.messageType === 'recipe' && message.recipeData && (
                    <RecipeMessage recipeData={message.recipeData} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-2">
                  {formatTime(message.createdAt)}
                </p>
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
