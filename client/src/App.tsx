import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import './index.css';

interface Stat {
  country_code: string;
  country_name: string;
  click_count: number;
}

interface CountryInfo {
  country: string;
  country_name: string;
}

const API_URL = 'http://localhost:3001/api';

function App() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [country, setCountry] = useState<CountryInfo | null>(null);
  const [localClicks, setLocalClicks] = useState(0);
  const [effects, setEffects] = useState<{ id: number; x: number; y: number }[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  // 0. Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // 1. Detect Country on Load
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry({ country: data.country, country_name: data.country_name }))
      .catch(() => setCountry({ country: 'UN', country_name: 'Unknown' }));
  }, []);

  // 2. Fetch Stats Periodically
  useEffect(() => {
    const fetchStats = () => {
      fetch(`${API_URL}/stats`)
        .then(res => res.json())
        .then(setStats)
        .catch(console.error);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // 3. Handle Pet (Click)
  const handlePet = (e: React.MouseEvent) => {
    if (!country) return;

    // Visual Effect
    const id = Date.now();
    setEffects(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setEffects(prev => prev.filter(eff => eff.id !== id)), 1000);

    // Update Local Count
    setLocalClicks(prev => prev + 1);

    // Send to Server
    fetch(`${API_URL}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode: country.country,
        countryName: country.country_name
      })
    })
    .then(res => res.json())
    .then(updated => {
      setStats(prev => {
        const index = prev.findIndex(s => s.country_code === updated.country_code);
        if (index === -1) return [...prev, updated].sort((a, b) => b.click_count - a.click_count);
        const newStats = [...prev];
        newStats[index] = updated;
        return newStats.sort((a, b) => b.click_count - a.click_count);
      });
    })
    .catch(console.error);
  };

  return (
    <div className="app-container">
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <h1>Pet the Cat!</h1>
      
      {/* AdSense Top Slot */}
      <div className="adsense-placeholder">AdSense Banner Area (Top)</div>

      <div className="cat-container" onClick={handlePet}>
        <div className="pixel-cat">
          <div className="eye left"></div>
          <div className="eye right"></div>
          <div className="nose"></div>
        </div>
        <p style={{ marginTop: '20px', fontSize: '12px' }}>Click to Pet!</p>
      </div>

      <div className="clicks-info">
        <p>Your Pets: {localClicks}</p>
        <p>Your Country: {country?.country_name || 'Detecting...'}</p>
      </div>

      {/* Leaderboard */}
      <div className="stats-panel">
        <h3>🏆 Global Rankings</h3>
        {stats.length === 0 ? <p>Loading rankings...</p> : (
          stats.slice(0, 10).map((stat, idx) => (
            <div key={stat.country_code} className="stat-item">
              <span>{idx + 1}. {stat.country_name}</span>
              <span>{stat.click_count.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>

      {/* AdSense Bottom Slot */}
      <div className="adsense-placeholder">AdSense Banner Area (Bottom)</div>

      {/* Click Effects */}
      <AnimatePresence>
        {effects.map(eff => (
          <motion.div
            key={eff.id}
            initial={{ opacity: 1, y: eff.y - 50, x: eff.x - 10 }}
            animate={{ opacity: 0, y: eff.y - 150 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              pointerEvents: 'none',
              fontSize: '24px',
              color: '#ff6b6b',
              zIndex: 100
            }}
          >
            ❤
          </motion.div>
        ))}
      </AnimatePresence>

      <footer style={{ marginTop: '2rem', fontSize: '10px', color: '#888' }}>
        Help your country reach #1!
      </footer>
    </div>
  );
}

export default App;
