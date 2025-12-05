import { useState, useRef } from 'react';
import { Trash2, Reply, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { soundFeedback } from '@/utils/soundFeedback';

const MESSAGE_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

interface ReplyData {
  id: string;
  content: string;
  senderName: string;
}

interface MessageReaction {
  odgerId: string;
  name: string;
}

interface MessageReactions {
  [emoji: string]: MessageReaction[];
}

interface ChatMessageProps {
  id: string;
  content: string;
  isOwn: boolean;
  isOptimistic?: boolean;
  createdAt: string;
  readAt: string | null;
  reactions?: MessageReactions;
  replyTo?: ReplyData | null;
  userId?: string;
  senderAvatar?: string | null;
  senderName?: string;
  messageType?: string;
  recipeData?: any;
  formatTime: (date: string) => string;
  onGoToProfile: () => void;
  onToggleReaction: (messageId: string, emoji: string, userName: string) => void;
  onReply: (messageId: string, content: string, senderName: string) => void;
  onDelete?: (messageId: string) => void;
  renderCustomContent?: () => React.ReactNode;
}

export function ChatMessage({
  id,
  content,
  isOwn,
  isOptimistic,
  createdAt,
  readAt,
  reactions,
  replyTo,
  userId,
  senderAvatar,
  senderName = 'Użytkownik',
  formatTime,
  onGoToProfile,
  onToggleReaction,
  onReply,
  onDelete,
  renderCustomContent,
}: ChatMessageProps) {
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      setShowContextMenu(true);
      try { soundFeedback.buttonClick(); } catch {}
      // Vibrate on long press
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
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
    
    // Swipe detection - only horizontal swipe to right for reply
    if (deltaY < 30 && deltaX > 0) {
      setIsSwiping(true);
      setSwipeX(Math.min(deltaX, 80));
      // Hide scrollbar during swipe
      document.body.style.overflow = 'hidden';
    }
  };

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Trigger reply if swiped enough
    if (swipeX > 60) {
      try { soundFeedback.buttonClick(); } catch {}
      onReply(id, content, isOwn ? 'Ty' : senderName);
    }
    
    // Reset swipe and restore scrollbar
    setSwipeX(0);
    setIsSwiping(false);
    touchStartRef.current = null;
    document.body.style.overflow = '';
  };

  const handleReactionClick = (emoji: string) => {
    try { soundFeedback.buttonClick(); } catch {}
    onToggleReaction(id, emoji, 'Ty');
    setActiveReactionMessageId(null);
  };

  const handleDelete = () => {
    if (onDelete) {
      try { soundFeedback.buttonClick(); } catch {}
      onDelete(id);
    }
    setShowContextMenu(false);
  };

  const handleReplyFromMenu = () => {
    try { soundFeedback.buttonClick(); } catch {}
    onReply(id, content, isOwn ? 'Ty' : senderName);
    setShowContextMenu(false);
  };

  return (
    <div
      ref={messageRef}
      className={cn(
        'flex gap-3 animate-slide-up-fade relative',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
      style={{
        transform: `translateX(${swipeX}px)`,
        transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Reply indicator on swipe */}
      {swipeX > 20 && (
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
        <button onClick={onGoToProfile}>
          <Avatar className="h-8 w-8 shrink-0 hover:opacity-80 transition-opacity">
            <AvatarImage src={senderAvatar || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {(senderName?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      )}
      
      <div className={cn('max-w-[75%]', isOwn && 'text-right')}>
        {/* Reply preview */}
        {replyTo && (
          <div className={cn(
            'mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 border-primary/50',
            'bg-muted/50 text-muted-foreground',
            isOwn ? 'ml-auto text-right' : 'text-left'
          )}>
            <span className="font-medium text-primary/80">{replyTo.senderName}</span>
            <p className="truncate max-w-[200px]">{replyTo.content}</p>
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
            activeReactionMessageId === id ? null : id
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          
          {renderCustomContent && renderCustomContent()}
          
          {/* Existing reactions display with animation */}
          {reactions && Object.keys(reactions).length > 0 && (
            <div className={cn(
              'flex items-center gap-1 mt-2 flex-wrap',
              isOwn ? 'justify-end' : 'justify-start'
            )}>
              {Object.entries(reactions).map(([emoji, usersRaw]) => {
                const users = usersRaw as MessageReaction[];
                if (!users || users.length === 0) return null;
                const hasReacted = users.some(u => u.odgerId === userId);
                const names = users.map(u => u.name).join(', ');
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    title={names}
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5',
                      'transition-all duration-200 transform hover:scale-110',
                      'animate-[bounce-in_0.3s_ease-out]',
                      hasReacted 
                        ? 'bg-primary/30 border border-primary' 
                        : 'bg-muted/50 border border-transparent hover:bg-muted'
                    )}
                  >
                    <span className="animate-[pop_0.2s_ease-out]">{emoji}</span>
                    <span className="text-[10px]">{users.length}</span>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Reaction picker */}
          {activeReactionMessageId === id && !isOptimistic && (
            <div className={cn(
              'absolute -bottom-10 bg-card rounded-full shadow-lg border border-border/50 px-2 py-1.5 flex items-center gap-1 z-20',
              'animate-scale-in',
              isOwn ? 'right-0' : 'left-0'
            )}>
              {MESSAGE_REACTION_EMOJIS.map((emoji, idx) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
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
        
        {/* Time and read status */}
        <div className={cn(
          'flex items-center gap-1 mt-1 px-2',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <p className="text-xs text-muted-foreground">
            {formatTime(createdAt)}
          </p>
        </div>
      </div>

      {/* Context menu overlay */}
      {showContextMenu && (
        <div 
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center animate-fade-in"
          onClick={() => setShowContextMenu(false)}
        >
          <div 
            className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-scale-in min-w-[200px]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleReplyFromMenu}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <Reply className="h-5 w-5 text-primary" />
              <span>Odpowiedz</span>
            </button>
            
            {isOwn && onDelete && (
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-destructive/10 transition-colors text-destructive"
              >
                <Trash2 className="h-5 w-5" />
                <span>Usuń</span>
              </button>
            )}
            
            <button
              onClick={() => setShowContextMenu(false)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-t border-border/50"
            >
              <X className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Anuluj</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
