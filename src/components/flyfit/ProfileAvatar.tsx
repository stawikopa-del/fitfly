import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  userId: string;
  avatarUrl: string | null;
  displayName: string;
  onAvatarChange: (url: string) => void;
}

export function ProfileAvatar({ userId, avatarUrl, displayName, onAvatarChange }: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Proszę wybrać plik obrazu');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Plik jest za duży (max 5MB)');
      return;
    }

    setUploading(true);

    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache busting parameter
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithCacheBust })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      onAvatarChange(urlWithCacheBust);
      toast.success('Zdjęcie profilowe zaktualizowane! 📸');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Nie udało się przesłać zdjęcia');
    } finally {
      setUploading(false);
    }
  };

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "w-28 h-28 rounded-full border-4 border-primary/30 overflow-hidden",
          "bg-gradient-to-br from-primary/20 to-fitfly-purple/20",
          "shadow-playful-lg hover:shadow-playful transition-all duration-300",
          "hover:scale-105 active:scale-95",
          "flex items-center justify-center relative group"
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-extrabold font-display text-primary">
            {initials}
          </span>
        )}
        
        {/* Overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-black/50 flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          uploading && "opacity-100"
        )}>
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Camera badge */}
      <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-playful">
        <Camera className="w-5 h-5 text-primary-foreground" />
      </div>
    </div>
  );
}
