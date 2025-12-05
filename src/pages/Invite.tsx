import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Check, LogIn, Sparkles, Users, Trophy, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { soundFeedback } from '@/utils/soundFeedback';
import mascot from '@/assets/fitfly-mascot.png';

interface InviterProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export default function Invite() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { friends, sentRequests, sendFriendRequest, isLoading: friendsLoading } = useFriends();
  
  const [inviter, setInviter] = useState<InviterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchInviter = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, display_name, username, avatar_url')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        setInviter(data);
      } catch (error) {
        console.error('Error fetching inviter:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInviter();
  }, [userId]);

  const handleSendRequest = async () => {
    if (!userId) return;
    
    soundFeedback.buttonClick();
    setSending(true);
    
    const success = await sendFriendRequest(userId);
    
    if (success) {
      toast.success('Zaproszenie wysłane!');
    }
    
    setSending(false);
  };

  const isAlreadyFriend = friends.some(f => f.userId === userId);
  const isRequestSent = sentRequests.includes(userId || '');
  const isOwnProfile = user?.id === userId;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!inviter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nie znaleziono użytkownika</p>
            <Button className="mt-4" onClick={() => navigate('/')}>
              Wróć do strony głównej
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-32">
        {/* Mascot */}
        <img 
          src={mascot} 
          alt="FITFLY" 
          className="w-24 h-24 mb-4 animate-float"
        />
        
        <h1 className="text-xl font-bold text-foreground mb-6">
          Zaproszenie do FITFLY
        </h1>

        {/* Inviter Profile Card */}
        <Card className="w-full max-w-sm bg-card/90 backdrop-blur-sm border-primary/30 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 border-4 border-primary/30 mb-3">
                <AvatarImage src={inviter.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                  {(inviter.display_name || inviter.username || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-lg font-bold text-foreground">
                {inviter.display_name || inviter.username || 'Użytkownik'}
              </h2>
              
              {inviter.username && (
                <p className="text-sm text-muted-foreground">@{inviter.username}</p>
              )}

              <p className="mt-4 text-sm text-muted-foreground">
                zaprasza Cię do grona znajomych w aplikacji FITFLY! 💪
              </p>

              {/* Action button for logged in users */}
              {user && !isOwnProfile && (
                <div className="mt-6 w-full">
                  {isAlreadyFriend ? (
                    <Badge variant="secondary" className="w-full py-2 justify-center">
                      <Users className="h-4 w-4 mr-2" />
                      Już jesteście znajomymi!
                    </Badge>
                  ) : isRequestSent ? (
                    <Badge variant="outline" className="w-full py-2 justify-center">
                      <Check className="h-4 w-4 mr-2" />
                      Zaproszenie wysłane
                    </Badge>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={handleSendRequest}
                      disabled={sending || friendsLoading}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Dodaj do znajomych
                    </Button>
                  )}
                </div>
              )}

              {user && (
                <Button 
                  variant="ghost" 
                  className="mt-3"
                  onClick={() => navigate('/')}
                >
                  Przejdź do aplikacji
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom menu for non-logged users */}
      {!user && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border safe-area-inset-bottom">
          <div className="p-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-blue-500" />
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Dołącz do FITFLY!
                </p>
                <p className="text-xs text-muted-foreground">
                  Śledź nawyki, wyzwania i rywalizuj ze znajomymi
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  soundFeedback.buttonClick();
                  navigate(`/auth?redirect=/invite/${userId}`);
                }}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Zaloguj się
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  soundFeedback.success();
                  navigate(`/auth?redirect=/invite/${userId}&mode=signup`);
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Dołącz teraz
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
