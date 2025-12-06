import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Check, Loader2, Navigation, Search, MapPin } from 'lucide-react';

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

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 0.5 });
  }, [lat, lng, map]);
  
  return null;
}

export default function LocationPickerMap({ onSelectLocation, onClose }: LocationPickerMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [address, setAddress] = useState<string>('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number } | null>(null);
  
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

  // Search for addresses
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=pl&countrycodes=pl`;
      
      // Add location bias if available
      if (userLocation) {
        const delta = 0.5;
        url += `&viewbox=${userLocation.lng - delta},${userLocation.lat + delta},${userLocation.lng + delta},${userLocation.lat - delta}&bounded=0`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Address search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(value);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Select search result
  const selectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setPosition(new L.LatLng(lat, lng));
    setFlyToCoords({ lat, lng });
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

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
      setFlyToCoords({ lat: userLocation.lat, lng: userLocation.lng });
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
      {/* Header with search */}
      <div className="p-4 border-b border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="p-2 -m-2">
            <X className="w-6 h-6" />
          </button>
          <h2 className="font-bold text-lg">Wybierz lokalizację</h2>
          <div className="w-10" />
        </div>
        
        {/* Search input */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Wyszukaj adres..."
              className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {isSearching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {searchQuery && !isSearching && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          {/* Search results dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-[1001] max-h-48 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSearchResult(result)}
                  className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-start gap-2 border-b border-border last:border-0"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm line-clamp-2">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {userLocation && (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={17}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
            {flyToCoords && <FlyToLocation lat={flyToCoords.lat} lng={flyToCoords.lng} />}
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
              👆 Dotknij mapę lub wyszukaj adres powyżej
            </p>
          </div>
        )}
      </div>

      {/* Bottom panel - with safe area for mobile */}
      <div className="p-4 pb-32 border-t border-border bg-card space-y-3">
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