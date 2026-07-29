import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Coffee, Utensils, Wine, Bed, Globe, Cloud, Star } from 'lucide-react';
import { CITIES, City } from './constants';

// Cache Intl.DateTimeFormat instances per timezone to avoid
// creating expensive formatters on every tick.
const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (timezone: string) => {
  let fmt = formatterCache.get(timezone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    formatterCache.set(timezone, fmt);
  }
  return fmt;
};

// Utility to get time as a fraction of the day (0 to 1)
const getDayFraction = (timezone: string) => {
  const now = new Date();
  const parts = getFormatter(timezone).formatToParts(now);
  const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const s = parseInt(parts.find(p => p.type === 'second')?.value || '0');
  
  return (h * 3600 + m * 60 + s) / 86400;
};

const SkyVisualizer = ({ fraction }: { fraction: number }) => {
  // 0 is midnight, 0.25 is 6am, 0.5 is noon, 0.75 is 6pm
  
  // Calculate sun/moon position
  // We'll use a sine wave for the arc
  const angle = (fraction * 2 * Math.PI) - (Math.PI / 2);
  const x = Math.cos(angle) * 40 + 50; // 50 is center
  const y = Math.sin(angle) * 40 + 50;
  
  const isDay = fraction > 0.25 && fraction < 0.75;
  
  // Sky colors based on time
  const getSkyColor = () => {
    if (fraction < 0.2) return 'from-slate-950 to-indigo-950'; // Deep night
    if (fraction < 0.3) return 'from-orange-900 to-indigo-900'; // Dawn
    if (fraction < 0.45) return 'from-sky-400 to-blue-600'; // Morning
    if (fraction < 0.55) return 'from-blue-400 to-sky-300'; // Noon
    if (fraction < 0.7) return 'from-blue-600 to-indigo-800'; // Afternoon
    if (fraction < 0.8) return 'from-orange-600 to-purple-900'; // Sunset
    return 'from-indigo-950 to-slate-950'; // Night
  };

  return (
    <div className={`relative w-full h-48 rounded-t-2xl overflow-hidden bg-gradient-to-b ${getSkyColor()} transition-colors duration-1000`}>
      {/* Stars for night */}
      {!isDay && (
        <div className="absolute inset-0 opacity-50">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* The Arc Path */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
        <path
          d="M 10 50 A 40 40 0 1 1 90 50"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />
      </svg>

      {/* Sun/Moon */}
      <motion.div
        className="absolute flex items-center justify-center"
        animate={{
          left: `${x}%`,
          top: `${y}%`,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        {isDay ? (
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sun className="text-yellow-300 w-8 h-8 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]" />
            </motion.div>
          </div>
        ) : (
          <Moon className="text-slate-200 w-7 h-7 drop-shadow-[0_0_8px_rgba(226,232,240,0.6)]" />
        )}
      </motion.div>

      {/* Horizon */}
      <div className="absolute bottom-0 w-full h-4 bg-black/20 backdrop-blur-sm" />
    </div>
  );
};

const Pulse = () => (
  <motion.div
    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
  />
);

const CityCard = ({ city }: { city: City }) => {
  const [fraction, setFraction] = useState(() => getDayFraction(city.timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setFraction(getDayFraction(city.timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [city.timezone]);

  // Activity icons based on time
  const getActivityIcon = () => {
    if (fraction >= 0.25 && fraction < 0.35) return <Coffee className="w-5 h-5" />; // Breakfast
    if (fraction >= 0.45 && fraction < 0.55) return <Utensils className="w-5 h-5" />; // Lunch
    if (fraction >= 0.75 && fraction < 0.85) return <Wine className="w-5 h-5" />; // Dinner
    if (fraction >= 0.9 || fraction < 0.2) return <Bed className="w-5 h-5" />; // Sleep
    return <Globe className="w-5 h-5" />; // Active
  };

  const getActivityText = () => {
    if (fraction >= 0.25 && fraction < 0.35) return "Awakening";
    if (fraction >= 0.45 && fraction < 0.55) return "Zenith";
    if (fraction >= 0.75 && fraction < 0.85) return "Twilight";
    if (fraction >= 0.9 || fraction < 0.2) return "Dreaming";
    return "Flowing";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col"
    >
      <SkyVisualizer fraction={fraction} />
      
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-light tracking-wide text-zinc-100">{city.name}</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{city.continent}</p>
          </div>
          <div className="text-zinc-400 opacity-60">
            {getActivityIcon()}
          </div>
        </div>

        {/* Progress Bar (No numbers) */}
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-zinc-600 uppercase tracking-tighter mb-1">
            <span>Dawn</span>
            <span>Noon</span>
            <span>Dusk</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${fraction * 100}%` }}
              transition={{ type: 'spring', stiffness: 30 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest">
            {getActivityText()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [filter, setFilter] = useState<string | null>(null);

  const continents = useMemo(() => {
    return Array.from(new Set(CITIES.map(c => c.continent)));
  }, []);

  const filteredCities = filter 
    ? CITIES.filter(c => c.continent === filter)
    : CITIES;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-indigo-500/30">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative pt-16 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-indigo-400"
            >
              <Pulse />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Temporal Odyssey</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-extralight tracking-tighter text-white leading-none"
            >
              Chronos
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 max-w-md text-lg font-light leading-relaxed"
            >
              A world in motion, felt through light and shadow. Time as a rhythm, not a digit.
            </motion.p>
          </div>

          <nav className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(null)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${
                filter === null 
                  ? 'bg-white text-black font-bold' 
                  : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
              }`}
            >
              All
            </button>
            {continents.map(continent => (
              <button
                key={continent}
                onClick={() => setFilter(continent)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${
                  filter === continent 
                    ? 'bg-indigo-600 text-white font-bold' 
                    : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
                }`}
              >
                {continent}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative px-6 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCities.map(city => (
              <motion.div
                key={city.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <CityCard city={city} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <footer className="relative py-12 px-6 border-t border-zinc-900 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-6 text-zinc-600">
            <Sun className="w-4 h-4" />
            <Cloud className="w-4 h-4" />
            <Star className="w-4 h-4" />
            <Moon className="w-4 h-4" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-700">
            The pulse of the world is constant
          </p>
        </div>
      </footer>
    </div>
  );
}
