import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Share2, 
  Link2, 
  Users, 
  Check,
  Loader2,
  Copy
} from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useSharing } from '@/hooks/useSharing';
import { soundFeedback } from '@/utils/soundFeedback';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'recipe' | 'challenge';
  itemId: string;
  itemName: string;
}

export function ShareDialog({ open, onOpenChange, type, itemId, itemName }: ShareDialogProps) {
  const { friends } = useFriends();
  const { shareRecipeWithFriend, createPublicRecipeLink, shareChallengeWithFriend, isSharing } = useSharing();
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [publicLink, setPublicLink] = useState<string | null>(null);

  const handleShareWithFriend = async (friendId: string) => {
    soundFeedback.buttonClick();
    
    let success = false;
    if (type === 'recipe') {
      success = await shareRecipeWithFriend(itemId, friendId);
    } else {
      success = await shareChallengeWithFriend(itemId, friendId);
    }

    if (success) {
      soundFeedback.success();
      setSharedWith(prev => [...prev, friendId]);
    }
  };

  const handleCreatePublicLink = async () => {
    if (type !== 'recipe') return;
    
    soundFeedback.buttonClick();
    const link = await createPublicRecipeLink(itemId);
    if (link) {
      soundFeedback.success();
      setPublicLink(link);
    }
  };

  const copyLink = async () => {
    if (publicLink) {
      await navigator.clipboard.writeText(publicLink);
      soundFeedback.success();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Udostępnij {type === 'recipe' ? 'przepis' : 'wyzwanie'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            "{itemName}"
          </p>

          {/* Public link section (only for recipes) */}
          {type === 'recipe' && (
            <div className="p-4 bg-muted/50 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Link2 className="h-4 w-4" />
                Link publiczny
              </div>
              
              {publicLink ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={publicLink}
                    readOnly
                    className="flex-1 bg-background px-3 py-2 rounded-lg text-sm border border-border"
                  />
                  <Button size="icon" variant="outline" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCreatePublicLink}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  Utwórz link do udostępnienia
                </Button>
              )}
            </div>
          )}

          {/* Friends list */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Udostępnij znajomym
            </div>

            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Dodaj znajomych, aby udostępniać im treści
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {friends.map(friend => {
                  const isShared = sharedWith.includes(friend.userId);
                  
                  return (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {(friend.displayName || friend.username || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {friend.displayName || friend.username}
                        </p>
                        {friend.username && (
                          <p className="text-xs text-muted-foreground">@{friend.username}</p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant={isShared ? "secondary" : "default"}
                        disabled={isShared || isSharing}
                        onClick={() => handleShareWithFriend(friend.userId)}
                      >
                        {isShared ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Wysłano
                          </>
                        ) : isSharing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Wyślij'
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
