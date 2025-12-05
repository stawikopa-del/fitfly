import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import fitekAvatar from '@/assets/fitek-avatar.png';
import greetingVideo from '@/assets/fitfly-greeting.mp4';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { soundFeedback } from '@/utils/soundFeedback';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fitek-chat`;

export default function FitekChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Pobierz historię czatu przy starcie
  useEffect(() => {
    if (!user) {
      setIsLoadingHistory(false);
      return;
    }
    
    let mounted = true;
    
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error fetching messages:', error);
        } else if (data) {
          setMessages(data.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content || '',
          })));
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        if (mounted) setIsLoadingHistory(false);
      }
    };
    
    fetchMessages();
    
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Zapisz wiadomość do bazy
  const saveMessage = async (message: Message) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ role: message.role, content: message.content, user_id: user.id })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving message:', error);
      }
      return data;
    } catch (err) {
      console.error('Error saving message:', err);
      return null;
    }
  };

  const streamChat = async (userMessages: Message[]) => {
    // Get user's JWT token for authenticated request
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Musisz być zalogowany, aby rozmawiać z FITKIEM');
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok || !resp.body) {
      const errorData = await resp.json().catch(() => ({ error: 'Błąd połączenia' }));
      throw new Error(errorData.error || 'Nie udało się połączyć z FITKIEM');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
    return assistantContent;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    // Zapisz wiadomość użytkownika
    await saveMessage(userMessage);

    try {
      const assistantContent = await streamChat(updatedMessages);
      // Zapisz odpowiedź asystenta
      if (assistantContent) {
        await saveMessage({ role: 'assistant', content: assistantContent });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = { role: 'assistant', content: 'Ups! Coś poszło nie tak 😓 Spróbuj jeszcze raz!' };
      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error clearing history:', error);
        toast.error('Nie udało się wyczyścić historii');
      } else {
        setMessages([]);
        toast.success('Historia wyczyszczona');
      }
    } catch (err) {
      console.error('Error clearing history:', err);
      toast.error('Nie udało się wyczyścić historii');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
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
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 shadow-playful overflow-hidden">
                <img src={fitekAvatar} alt="FITEK" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-card" />
            </div>
            <div>
              <h1 className="font-bold font-display text-lg text-foreground flex items-center gap-2">
                FITEK
                <Sparkles className="w-4 h-4 text-fitfly-yellow" />
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {isTyping ? 'pisze...' : 'Twój przyjaciel fitness'}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-40 h-40 mb-4 rounded-3xl overflow-hidden shadow-card-playful">
              <video 
                src={greetingVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold font-display text-foreground mb-2">
              Cześć! Jestem FITEK! 👋
            </h2>
            <p className="text-muted-foreground text-sm max-w-[250px]">
              Twój przyjaciel fitness! Porozmawiaj ze mną o ćwiczeniach, jedzeniu, lub po prostu pogadajmy! 💪
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Jak zacząć ćwiczyć?', 'Co jeść na śniadanie?', 'Zmotywuj mnie!'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="px-4 py-2 bg-card border-2 border-border/50 rounded-2xl text-sm font-medium text-foreground hover:-translate-y-0.5 hover:shadow-card-playful transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex gap-3 animate-slide-up-fade',
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 shadow-playful-sm shrink-0 overflow-hidden">
                <img src={fitekAvatar} alt="FITEK" className="w-full h-full object-cover" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] px-4 py-3 rounded-3xl',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-lg shadow-playful-sm'
                  : 'bg-card border-2 border-border/50 text-foreground rounded-bl-lg shadow-card-playful'
              )}
            >
              <p className="text-sm font-medium whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isTyping && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 shadow-playful-sm shrink-0 overflow-hidden animate-bounce-soft">
              <img src={fitekAvatar} alt="FITEK" className="w-full h-full object-cover" />
            </div>
            <div className="bg-card border-2 border-border/50 rounded-3xl rounded-bl-lg px-4 py-3 shadow-card-playful">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Napisz do FITKA..."
            disabled={isLoading}
            className="flex-1 rounded-2xl border-2 h-12"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
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
