import { useState } from 'react';
import { AppLayout } from '@/components/flyfit/AppLayout';
import { PageHeader } from '@/components/flyfit/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  UserPlus, 
  Check, 
  X, 
  Footprints, 
  Droplets,
  Clock,
  Trash2,
  Loader2,
  UserX
} from 'lucide-react';
import { useFriends, Friend, FriendRequest } from '@/hooks/useFriends';
import { soundFeedback } from '@/utils/soundFeedback';
import { cn } from '@/lib/utils';

export default function Friends() {
  const { 
    friends, 
    pendingRequests, 
    sentRequests,
    isLoading, 
    searchUsers,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend
  } = useFriends();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    soundFeedback.buttonClick();
    setIsSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSendRequest = async (userId: string) => {
    soundFeedback.buttonClick();
    await sendFriendRequest(userId);
  };

  const handleAccept = async (requestId: string) => {
    soundFeedback.success();
    await acceptRequest(requestId);
  };

  const handleReject = async (requestId: string) => {
    soundFeedback.buttonClick();
    await rejectRequest(requestId);
  };

  const handleRemove = async (friendshipId: string) => {
    soundFeedback.buttonClick();
    await removeFriend(friendshipId);
  };

  const FriendCard = ({ friend }: { friend: Friend }) => (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/30">
            <AvatarImage src={friend.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {(friend.displayName || friend.username || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {friend.displayName || friend.username || 'Użytkownik'}
            </p>
            {friend.username && (
              <p className="text-sm text-muted-foreground">@{friend.username}</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => handleRemove(friend.friendshipId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {friend.progress && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Dzisiejsze postępy:</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1 text-sm">
                <Footprints className="h-4 w-4 text-primary" />
                <span>{friend.progress.steps.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>{friend.progress.water} ml</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>{friend.progress.activeMinutes} min</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const RequestCard = ({ request }: { request: FriendRequest }) => (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/30">
            <AvatarImage src={request.senderAvatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {(request.senderDisplayName || request.senderUsername || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {request.senderDisplayName || request.senderUsername || 'Użytkownik'}
            </p>
            {request.senderUsername && (
              <p className="text-sm text-muted-foreground">@{request.senderUsername}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="icon"
              className="bg-primary hover:bg-primary/90"
              onClick={() => handleAccept(request.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleReject(request.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SearchResultCard = ({ profile }: { profile: any }) => {
    const isSent = sentRequests.includes(profile.user_id);
    const isFriend = friends.some(f => f.userId === profile.user_id);

    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                {(profile.display_name || profile.username || '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {profile.display_name || profile.username || 'Użytkownik'}
              </p>
              {profile.username && (
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              )}
            </div>

            {isFriend ? (
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                Znajomy
              </Badge>
            ) : isSent ? (
              <Badge variant="outline">Wysłano</Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => handleSendRequest(profile.user_id)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Dodaj
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen pb-24 px-4 pt-4">
        <PageHeader title="Znajomi" backTo="/inne" />

        <Tabs defaultValue="friends" className="mt-4">
          <TabsList className="w-full grid grid-cols-3 bg-card/50">
            <TabsTrigger value="friends" className="relative">
              Znajomi
              {friends.length > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 justify-center text-xs">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Zaproszenia
              {pendingRequests.length > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 justify-center text-xs bg-primary">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="search">Szukaj</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : friends.length === 0 ? (
              <Card className="bg-card/50 border-dashed">
                <CardContent className="py-12 text-center">
                  <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Nie masz jeszcze znajomych
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wyszukaj znajomych po nicku
                  </p>
                </CardContent>
              </Card>
            ) : (
              friends.map(friend => (
                <FriendCard key={friend.id} friend={friend} />
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-4 space-y-3">
            {pendingRequests.length === 0 ? (
              <Card className="bg-card/50 border-dashed">
                <CardContent className="py-12 text-center">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Brak oczekujących zaproszeń
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </TabsContent>

          <TabsContent value="search" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Wpisz nick lub imię..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-card/80"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {searchResults.map(profile => (
                <SearchResultCard key={profile.user_id} profile={profile} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
