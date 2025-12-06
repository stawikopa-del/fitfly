import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { X, Check, Loader2, Navigation } from 'lucide-react';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  onSelectLocation: (coords: { lat: number; lng: number }, address: string) => void;
  onClose: () => void;
}

function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: L.LatLng | null; 
  setPosition: (pos: L.LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function CenterOnLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  
  return null;
}

export default function LocationPickerMap({ onSelectLocation, onClose }: LocationPickerMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [address, setAddress] = useState<string>('');
  
  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        () => {
          // Default to Poland center if location denied
          setUserLocation({ lat: 52.0, lng: 19.0 });
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: 52.0, lng: 19.0 });
      setIsLoadingLocation(false);
    }
  }, []);

  // Reverse geocode when position changes
  useEffect(() => {
    if (!position) {
      setAddress('');
      return;
    }

    const fetchAddress = async () => {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&accept-language=pl`
        );
        const data = await response.json();
        
        if (data.display_name) {
          const shortAddress = data.address?.road 
            ? `${data.address.road}${data.address.house_number ? ' ' + data.address.house_number : ''}, ${data.address.city || data.address.town || data.address.village || ''}`
            : data.display_name.split(',').slice(0, 3).join(',');
          setAddress(shortAddress);
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        setAddress(`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [position]);

  const handleConfirm = () => {
    if (position && address) {
      onSelectLocation({ lat: position.lat, lng: position.lng }, address);
    }
  };

  const centerOnUser = () => {
    if (userLocation) {
      setPosition(new L.LatLng(userLocation.lat, userLocation.lng));
    }
  };

  if (isLoadingLocation) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Pobieranie lokalizacji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <button onClick={onClose} className="p-2 -m-2">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-bold text-lg">Wybierz lokalizację</h2>
        <div className="w-10" />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {userLocation && (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={15}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
            {position && <CenterOnLocation lat={position.lat} lng={position.lng} />}
          </MapContainer>
        )}

        {/* Center on user button */}
        <Button
          onClick={centerOnUser}
          size="icon"
          variant="secondary"
          className="absolute bottom-24 right-4 z-[1000] shadow-lg"
        >
          <Navigation className="w-5 h-5" />
        </Button>

        {/* Instructions overlay */}
        {!position && (
          <div className="absolute top-4 left-4 right-4 z-[1000] bg-card/95 backdrop-blur rounded-xl p-3 shadow-lg">
            <p className="text-sm text-center text-foreground">
              👆 Dotknij mapę, aby upuścić pinezkę
            </p>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="p-4 border-t border-border bg-card space-y-3">
        {position ? (
          <>
            <div className="bg-muted/50 rounded-xl p-3">
              {isLoadingAddress ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Pobieranie adresu...</span>
                </div>
              ) : (
                <p className="text-sm text-foreground">{address}</p>
              )}
            </div>
            <Button 
              onClick={handleConfirm} 
              className="w-full" 
              size="lg"
              disabled={isLoadingAddress || !address}
            >
              <Check className="w-5 h-5 mr-2" />
              Zatwierdź lokalizację
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Wybierz miejsce na mapie
          </p>
        )}
      </div>
    </div>
  );
}