import { useState, useRef, ChangeEvent, useCallback } from 'react';
import { Camera, Loader2, Check, X } from 'lucide-react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ProfileAvatarProps {
  userId: string;
  avatarUrl: string | null;
  displayName: string;
  onAvatarChange: (url: string) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ProfileAvatar({ userId, avatarUrl, displayName, onAvatarChange }: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
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

    // Read file and open crop dialog
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const getCroppedImage = async (): Promise<Blob | null> => {
    if (!imgRef.current || !crop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCrop = {
      x: (crop.x / 100) * image.width * scaleX,
      y: (crop.y / 100) * image.height * scaleY,
      width: (crop.width / 100) * image.width * scaleX,
      height: (crop.height / 100) * image.height * scaleY,
    };

    // Set canvas size to desired output (400x400 for avatar)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
    });
  };

  const handleSaveCrop = async () => {
    setUploading(true);

    try {
      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) {
        toast.error('Nie udało się przyciąć zdjęcia');
        return;
      }

      // Create a unique file path
      const fileName = `${userId}/avatar.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

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
      setCropDialogOpen(false);
      setImageSrc(null);
      toast.success('Zdjęcie profilowe zaktualizowane! 📸');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Nie udało się przesłać zdjęcia');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setCropDialogOpen(false);
    setImageSrc(null);
    setCrop(undefined);
  };

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
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

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-2 border-border/50 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold font-display text-center">
              Przytnij zdjęcie ✂️
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4">
            {imageSrc && (
              <div className="max-h-[60vh] overflow-hidden rounded-2xl">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  aspect={1}
                  circularCrop
                  className="max-h-[60vh]"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-h-[60vh] w-auto"
                  />
                </ReactCrop>
              </div>
            )}
            
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleCancelCrop}
                disabled={uploading}
                className="flex-1 rounded-2xl font-bold"
              >
                <X className="w-4 h-4 mr-2" />
                Anuluj
              </Button>
              <Button
                onClick={handleSaveCrop}
                disabled={uploading}
                className="flex-1 rounded-2xl font-bold"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Zapisz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
