import { useState } from 'react';
import Hero from './components/Hero';
import MapView from './components/MapView';
import HotspotList from './components/HotspotList';

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

const App = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <MapView 
        onHotspotsUpdate={setHotspots} 
        onWeatherUpdate={setWeather}
      />
      <HotspotList hotspots={hotspots} weather={weather} />
      
      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Data sourced from{' '}
            <a 
              href="https://firms.modaps.eosdis.nasa.gov/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              NASA FIRMS
            </a>
            {' '}• Built for wildfire awareness and prevention
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
