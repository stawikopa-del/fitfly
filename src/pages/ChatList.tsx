import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Sparkles, ChevronRight, Search, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import fitekAvatar from '@/assets/fitek-avatar.png';
import { useDirectMessages, ChatPreview } from '@/hooks/useDirectMessages';
import { useFriends } from '@/hooks/useFriends';
import { soundFeedback } from '@/utils/soundFeedback';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function ChatList() {
  const navigate = useNavigate();
  const { chatPreviews, isLoading } = useDirectMessages();
  const { friends } = useFriends();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter friends that don't have a chat yet
  const friendsWithoutChat = friends.filter(
    friend => !chatPreviews.some(chat => chat.odgerId === friend.userId)
  );

  const filteredPreviews = chatPreviews.filter(chat =>
    chat.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.username && chat.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFriends = friendsWithoutChat.filter(friend =>
    (friend.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (friend.username && friend.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: pl });
  };

  const ChatPreviewCard = ({ chat }: { chat: ChatPreview }) => (
    <Card 
      className="bg-card/80 backdrop-blur-sm border-border/50 hover:-translate-y-0.5 hover:shadow-card-playful transition-all cursor-pointer"
      onClick={() => {
        soundFeedback.buttonClick();
        navigate(`/czat/${chat.odgerId}`);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarImage src={chat.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {chat.displayName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground truncate">
                {chat.displayName}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatTime(chat.lastMessageTime)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {chat.lastMessage}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {chat.unreadCount > 0 && (
              <Badge className="h-6 w-6 p-0 justify-center rounded-full bg-primary">
                {chat.unreadCount}
              </Badge>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FriendSuggestionCard = ({ friend }: { friend: any }) => (
    <Card 
      className="bg-card/50 border-dashed border-border/50 hover:-translate-y-0.5 hover:shadow-card-playful transition-all cursor-pointer"
      onClick={() => {
        soundFeedback.buttonClick();
        navigate(`/czat/${friend.userId}`);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-border/50">
            <AvatarImage src={friend.avatarUrl || undefined} />
            <AvatarFallback className="bg-muted text-muted-foreground font-bold">
              {(friend.displayName || friend.username || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {friend.displayName || friend.username || 'Użytkownik'}
            </p>
            <p className="text-xs text-muted-foreground">
              Rozpocznij rozmowę
            </p>
          </div>

          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen pb-28 px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-primary" />
          Chaty
        </h1>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj rozmów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card/80 rounded-2xl"
        />
      </div>

      {/* FITEK Chat - Pinned */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Twój asystent
        </p>
        <Card 
          className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 hover:-translate-y-0.5 hover:shadow-card-playful transition-all cursor-pointer"
          onClick={() => {
            soundFeedback.buttonClick();
            navigate('/czat/fitek');
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-primary/30 shadow-playful overflow-hidden">
                  <img src={fitekAvatar} alt="FITEK" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full border-2 border-card flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-secondary-foreground" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground">FITEK</p>
                  <Badge variant="secondary" className="text-xs">AI</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Twój przyjaciel fitness! 💪
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Conversations */}
      {filteredPreviews.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Rozmowy
          </p>
          <div className="space-y-3">
            {filteredPreviews.map(chat => (
              <ChatPreviewCard key={chat.odgerId} chat={chat} />
            ))}
          </div>
        </div>
      )}

      {/* Friends to message */}
      {filteredFriends.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Napisz do znajomego
          </p>
          <div className="space-y-2">
            {filteredFriends.map(friend => (
              <FriendSuggestionCard key={friend.id} friend={friend} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredPreviews.length === 0 && filteredFriends.length === 0 && !isLoading && (
        <Card className="bg-card/50 border-dashed">
          <CardContent className="py-12 text-center">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">
              Dodaj znajomych, żeby rozpocząć rozmowę!
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                soundFeedback.buttonClick();
                navigate('/znajomi');
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Znajdź znajomych
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
