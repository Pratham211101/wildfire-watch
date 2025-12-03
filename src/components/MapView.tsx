import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import L, { LatLngExpression } from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = 'http://localhost:5000';

interface Hotspot {
  id: number;
  lat: number;
  lng: number;
  confidence: number;
  frp: number;
  detectionTime: string;
}

interface Weather {
  temp: number;
  humidity: number;
  windSpeed: number;
}

interface MapViewProps {
  onHotspotsUpdate?: (hotspots: Hotspot[]) => void;
  onWeatherUpdate?: (weather: Weather | null) => void;
}

// Custom marker icons based on confidence level
const createMarkerIcon = (confidence: number) => {
  let color: string;
  if (confidence >= 80) {
    color = '#ef4444'; // danger red
  } else if (confidence >= 50) {
    color = '#f97316'; // warning orange
  } else {
    color = '#eab308'; // caution yellow
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 20px ${color}80;
        animation: pulse 2s ease-in-out infinite;
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// User location marker
const userLocationIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 15px #3b82f680;
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to recenter map when location changes
const MapController = ({ center }: { center: LatLngExpression }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, 10, { duration: 1.5 });
    }
  }, [center, map]);

  return null;
};

const MapView = ({ onHotspotsUpdate, onWeatherUpdate }: MapViewProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -118.2437]); // Default: LA
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch hotspots from backend
  const fetchHotspots = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/nearby-hotspots`, {
        params: { lat, lng }
      });
      
      const { weather, hotspots: fetchedHotspots, top5 } = response.data;
      
      setHotspots(fetchedHotspots || []);
      onHotspotsUpdate?.(top5 || []);
      onWeatherUpdate?.(weather || null);
    } catch (err) {
      console.error('Failed to fetch hotspots:', err);
      setError('Failed to fetch hotspot data. Using mock data.');
      
      // Mock data for development
      const mockHotspots: Hotspot[] = [
        { id: 1, lat: mapCenter[0] + 0.1, lng: mapCenter[1] + 0.1, confidence: 95, frp: 45.2, detectionTime: new Date().toISOString() },
        { id: 2, lat: mapCenter[0] - 0.15, lng: mapCenter[1] + 0.2, confidence: 78, frp: 32.1, detectionTime: new Date().toISOString() },
        { id: 3, lat: mapCenter[0] + 0.2, lng: mapCenter[1] - 0.1, confidence: 62, frp: 18.5, detectionTime: new Date().toISOString() },
        { id: 4, lat: mapCenter[0] - 0.08, lng: mapCenter[1] - 0.15, confidence: 45, frp: 12.3, detectionTime: new Date().toISOString() },
        { id: 5, lat: mapCenter[0] + 0.25, lng: mapCenter[1] + 0.05, confidence: 88, frp: 38.7, detectionTime: new Date().toISOString() },
      ];
      
      const mockWeather: Weather = { temp: 32, humidity: 15, windSpeed: 25 };
      
      setHotspots(mockHotspots);
      onHotspotsUpdate?.(mockHotspots);
      onWeatherUpdate?.(mockWeather);
    } finally {
      setLoading(false);
    }
  }, [mapCenter, onHotspotsUpdate, onWeatherUpdate]);

  // Auto-detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          fetchHotspots(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          // Use default location
          fetchHotspots(mapCenter[0], mapCenter[1]);
        }
      );
    } else {
      fetchHotspots(mapCenter[0], mapCenter[1]);
    }
  }, []);

  // Handle location search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    
    try {
      // Using Nominatim for geocoding
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        fetchHotspots(newCenter[0], newCenter[1]);
      } else {
        setError('Location not found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="map" className="py-16 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="fire-text">Live</span> Hotspot Map
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time fire detection data from MODIS FIRMS satellite imagery
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form 
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location (city, address, coordinates...)"
              className="w-full px-6 py-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 fire-gradient rounded-md text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </motion.form>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-4 text-warning text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative rounded-xl overflow-hidden border border-border card-shadow"
          style={{ height: '500px' }}
        >
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">Loading hotspots...</span>
              </div>
            </div>
          )}
          
          <MapContainer
            center={mapCenter}
            zoom={10}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapController center={mapCenter} />
            
            {/* User Location Marker */}
            {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div className="text-sm">
                    <strong>Your Location</strong>
                    <br />
                    {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Hotspot Markers */}
            {hotspots.map((hotspot) => (
              <Marker
                key={hotspot.id}
                position={[hotspot.lat, hotspot.lng] as [number, number]}
                icon={createMarkerIcon(hotspot.confidence)}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <strong className="block text-base">Fire Hotspot</strong>
                    <div>Confidence: <span className="font-semibold">{hotspot.confidence}%</span></div>
                    <div>FRP: <span className="font-semibold">{hotspot.frp} MW</span></div>
                    <div className="text-xs opacity-75">
                      {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mt-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-danger" />
            <span className="text-sm text-muted-foreground">High Confidence (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Medium (50-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-caution" />
            <span className="text-sm text-muted-foreground">Low (&lt;50%)</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MapView;
