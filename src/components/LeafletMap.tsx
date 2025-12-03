import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Hotspot {
  id: number;
  lat: number;
  lng: number;
  confidence: number;
  frp: number;
  detectionTime: string;
}

interface LeafletMapProps {
  center: [number, number];
  hotspots: Hotspot[];
  userLocation: [number, number] | null;
}

const LeafletMap = ({ center, hotspots, userLocation }: LeafletMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Create marker icon based on confidence
  const createMarkerIcon = (confidence: number) => {
    const color = confidence >= 80 ? '#ef4444' : confidence >= 50 ? '#f97316' : '#eab308';
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:20px;height:20px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 15px ${color}80;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:2px solid white;box-shadow:0 0 10px #3b82f680;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: center,
      zoom: 10,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo(center, 10, { duration: 1.5 });
    }
  }, [center]);

  // Update markers
  useEffect(() => {
    if (!markersRef.current) return;

    markersRef.current.clearLayers();

    // Add user location marker
    if (userLocation) {
      L.marker(userLocation, { icon: userIcon })
        .bindPopup(`<strong>Your Location</strong><br/>${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}`)
        .addTo(markersRef.current);
    }

    // Add hotspot markers
    hotspots.forEach((hotspot) => {
      L.marker([hotspot.lat, hotspot.lng], { icon: createMarkerIcon(hotspot.confidence) })
        .bindPopup(`
          <strong>Fire Hotspot</strong><br/>
          Confidence: ${hotspot.confidence}%<br/>
          FRP: ${hotspot.frp} MW<br/>
          <small>${hotspot.lat.toFixed(4)}, ${hotspot.lng.toFixed(4)}</small>
        `)
        .addTo(markersRef.current!);
    });
  }, [hotspots, userLocation]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
};

export default LeafletMap;
