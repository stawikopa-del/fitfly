import { useState, useRef } from 'react';
import { Plus, Image, Mic, ShoppingCart, X, Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { soundFeedback } from '@/utils/soundFeedback';

interface ShoppingListItem {
  id: string;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  itemsCount: number;
}

interface ChatAttachmentMenuProps {
  onSendImage: (imageUrl: string) => Promise<boolean>;
  onSendVoice: (audioUrl: string, duration: number) => Promise<boolean>;
  onSendShoppingList: (listId: string) => Promise<boolean>;
  disabled?: boolean;
}

export function ChatAttachmentMenu({ 
  onSendImage, 
  onSendVoice, 
  onSendShoppingList,
  disabled 
}: ChatAttachmentMenuProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showShoppingListDialog, setShowShoppingListDialog] = useState(false);
  const [shoppingLists, setShoppingLists] = useState<ShoppingListItem[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = () => {
    try { soundFeedback.buttonClick(); } catch {}
    setIsOpen(!isOpen);
  };

  // Image handling
  const handleImageSelect = () => {
    try { soundFeedback.buttonClick(); } catch {}
    fileInputRef.current?.click();
    setIsOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Proszę wybrać plik graficzny');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Plik jest za duży (max 5MB)');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      const success = await onSendImage(data.publicUrl);
      if (success) {
        toast.success('Zdjęcie wysłane');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Nie udało się wysłać zdjęcia');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      soundFeedback.buttonClick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingDuration(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoiceMessage(audioBlob, recordingDuration);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsOpen(false);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Nie udało się uzyskać dostępu do mikrofonu');
    }
  };

  const stopRecording = () => {
    try { soundFeedback.buttonClick(); } catch {}
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    try { soundFeedback.buttonClick(); } catch {}
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setIsRecording(false);
      setRecordingDuration(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const uploadVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}.webm`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      const success = await onSendVoice(data.publicUrl, duration);
      if (success) {
        toast.success('Wiadomość głosowa wysłana');
      }
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast.error('Nie udało się wysłać wiadomości głosowej');
    } finally {
      setIsUploading(false);
      setRecordingDuration(0);
    }
  };

  // Shopping list handling
  const handleShoppingListSelect = async () => {
    try { soundFeedback.buttonClick(); } catch {}
    setIsOpen(false);
    setLoadingLists(true);
    setShowShoppingListDialog(true);

    try {
      const { data, error } = await supabase
        .from('shared_shopping_lists')
        .select('id, date_range_start, date_range_end, items')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const lists = (data || []).map(list => ({
        id: list.id,
        dateRangeStart: list.date_range_start,
        dateRangeEnd: list.date_range_end,
        itemsCount: Array.isArray(list.items) ? list.items.length : 0,
      }));

      setShoppingLists(lists);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      toast.error('Nie udało się pobrać list zakupów');
    } finally {
      setLoadingLists(false);
    }
  };

  const handleSendList = async (listId: string) => {
    const success = await onSendShoppingList(listId);
    if (success) {
      toast.success('Lista zakupów udostępniona');
      setShowShoppingListDialog(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start || !end) return 'Bez daty';
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.getDate()}.${startDate.getMonth() + 1} - ${endDate.getDate()}.${endDate.getMonth() + 1}`;
  };

  // Recording UI
  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-destructive/10 rounded-2xl px-4 py-2">
        <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
        <span className="text-sm font-medium text-destructive">{formatDuration(recordingDuration)}</span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={cancelRecording}
          className="h-8 w-8"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button
          size="icon"
          onClick={stopRecording}
          className="h-10 w-10 rounded-full bg-destructive hover:bg-destructive/90"
        >
          <Square className="h-4 w-4 fill-current" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          disabled={disabled || isUploading}
          className={cn(
            "w-12 h-12 rounded-2xl transition-transform",
            isOpen && "rotate-45"
          )}
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* Attachment options */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 flex flex-col gap-2 animate-fade-in">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleImageSelect}
              className="w-12 h-12 rounded-2xl bg-primary/10 hover:bg-primary/20"
              title="Wyślij zdjęcie"
            >
              <Image className="w-5 h-5 text-primary" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={startRecording}
              className="w-12 h-12 rounded-2xl bg-destructive/10 hover:bg-destructive/20"
              title="Nagraj wiadomość głosową"
            >
              <Mic className="w-5 h-5 text-destructive" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleShoppingListSelect}
              className="w-12 h-12 rounded-2xl bg-secondary/20 hover:bg-secondary/30"
              title="Wyślij listę zakupów"
            >
              <ShoppingCart className="w-5 h-5 text-secondary" />
            </Button>
          </div>
        )}
      </div>

      {/* Shopping list dialog */}
      <Dialog open={showShoppingListDialog} onOpenChange={setShowShoppingListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wybierz listę zakupów</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {loadingLists ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : shoppingLists.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nie masz jeszcze żadnych list zakupów
              </p>
            ) : (
              shoppingLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => handleSendList(list.id)}
                  className="w-full p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left flex items-center gap-3"
                >
                  <ShoppingCart className="h-5 w-5 text-secondary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Lista zakupów</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateRange(list.dateRangeStart, list.dateRangeEnd)} • {list.itemsCount} produktów
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}