import { motion } from 'framer-motion';

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

interface HotspotListProps {
  hotspots?: Hotspot[];
  weather?: Weather | null;
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 80) return 'text-danger';
  if (confidence >= 50) return 'text-warning';
  return 'text-caution';
};

const getConfidenceBg = (confidence: number): string => {
  if (confidence >= 80) return 'bg-danger/20 border-danger/30';
  if (confidence >= 50) return 'bg-warning/20 border-warning/30';
  return 'bg-caution/20 border-caution/30';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const HotspotCard = ({ hotspot, index }: { hotspot: Hotspot; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="glass-card rounded-xl p-6 card-shadow hover:ember-glow transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            hotspot.confidence >= 80 ? 'bg-danger' : 
            hotspot.confidence >= 50 ? 'bg-warning' : 'bg-caution'
          } animate-pulse`} />
          <span className="text-sm font-medium text-muted-foreground">
            Hotspot #{index + 1}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getConfidenceBg(hotspot.confidence)} ${getConfidenceColor(hotspot.confidence)}`}>
          {hotspot.confidence}%
        </div>
      </div>

      {/* Location */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1">Location</div>
        <div className="font-mono text-sm text-foreground">
          {hotspot.lat.toFixed(4)}°, {hotspot.lng.toFixed(4)}°
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Fire Radiative Power</div>
          <div className="text-xl font-bold fire-text">{hotspot.frp.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">MW</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Detected</div>
          <div className="text-sm font-medium text-foreground">
            {formatDate(hotspot.detectionTime)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const WeatherCard = ({ weather }: { weather: Weather | null | undefined }) => {
  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6 card-shadow mb-8"
    >
      <h3 className="text-lg font-semibold mb-4 text-foreground">Current Weather Conditions</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold fire-text">{weather.temp}°C</div>
          <div className="text-sm text-muted-foreground">Temperature</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{weather.humidity}%</div>
          <div className="text-sm text-muted-foreground">Humidity</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-warning">{weather.windSpeed}</div>
          <div className="text-sm text-muted-foreground">Wind (km/h)</div>
        </div>
      </div>
      
      {/* Risk Indicator */}
      {weather.humidity < 20 && weather.windSpeed > 20 && (
        <div className="mt-4 p-3 rounded-lg bg-danger/20 border border-danger/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <span className="text-sm font-medium text-danger">
              High fire risk conditions detected
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const HotspotList = ({ hotspots = [], weather }: HotspotListProps) => {
  return (
    <section id="hotspots" className="py-16 px-4 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Top 5 <span className="fire-text">Nearby Hotspots</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Priority alerts based on confidence level and proximity to your location
          </p>
        </motion.div>

        {/* Weather Card */}
        <WeatherCard weather={weather} />

        {/* Hotspots Grid */}
        {hotspots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotspots.slice(0, 5).map((hotspot, index) => (
              <HotspotCard key={hotspot.id} hotspot={hotspot} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <p className="text-muted-foreground">No hotspots detected in this area</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Try searching a different location</p>
          </motion.div>
        )}

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 p-6 glass-card rounded-xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground">{hotspots.length}</div>
              <div className="text-sm text-muted-foreground">Total Hotspots</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-danger">
                {hotspots.filter(h => h.confidence >= 80).length}
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warning">
                {hotspots.filter(h => h.confidence >= 50 && h.confidence < 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Risk</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-caution">
                {hotspots.filter(h => h.confidence < 50).length}
              </div>
              <div className="text-sm text-muted-foreground">Low Risk</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HotspotList;
