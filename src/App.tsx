import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, TrendingUp, Trophy } from 'lucide-react';
import './index.css';

interface Stat {
  country_code: string;
  country_name: string;
  click_count: number;
}

interface StatsResponse {
  allTime: Stat[];
  recent: Stat[];
}

interface CountryInfo {
  country: string;
  country_name: string;
}

const API_URL = '/api';

function App() {
  const [stats, setStats] = useState<StatsResponse>({ allTime: [], recent: [] });
  const [rankTab, setRankTab] = useState<'allTime' | 'recent'>('allTime');
  const [country, setCountry] = useState<CountryInfo | null>(null);
  const [localClicks, setLocalClicks] = useState(0);
  const [effects, setEffects] = useState<{ id: number; x: number; y: number }[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Detect Country
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry({ country: data.country, country_name: data.country_name }))
      .catch(() => setCountry({ country: 'UN', country_name: 'Unknown' }));
  }, []);

  // Fetch Stats
  useEffect(() => {
    const fetchStats = () => {
      fetch(`${API_URL}/stats`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePet = (e: React.MouseEvent) => {
    if (!country) return;

    const id = Date.now();
    setEffects(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setEffects(prev => prev.filter(eff => eff.id !== id)), 1000);

    setLocalClicks(prev => prev + 1);

    fetch(`${API_URL}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode: country.country,
        countryName: country.country_name
      })
    }).catch(console.error);
  };

  const getFlagUrl = (code: string) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  const currentStats = rankTab === 'allTime' ? stats.allTime : stats.recent;

  return (
    <div className="app-container">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <h1>Pet the Cat!</h1>
      
      <div className="cat-container" onClick={handlePet}>
        <div className="pixel-cat">
          <div className="eye left"></div>
          <div className="eye right"></div>
          <div className="nose"></div>
        </div>
        <p style={{ marginTop: '20px', fontSize: '10px' }}>TAP TO PET!</p>
      </div>

      <div className="clicks-info">
        <p>Your Contribution: {localClicks}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          {country?.country && <img src={getFlagUrl(country.country)} alt={country.country} width="20" />}
          <span>{country?.country_name || '...'}</span>
        </div>
      </div>

      <div className="stats-panel">
        <div className="tab-buttons">
          <button className={rankTab === 'allTime' ? 'active' : ''} onClick={() => setRankTab('allTime')}>
            <Trophy size={12} /> All-Time
          </button>
          <button className={rankTab === 'recent' ? 'active' : ''} onClick={() => setRankTab('recent')}>
            <TrendingUp size={12} /> Trending (5m)
          </button>
        </div>

        <div className="rankings">
          {currentStats.length === 0 ? <p style={{ fontSize: '8px', padding: '10px' }}>Be the first to pet in the last 5 minutes!</p> : (
            currentStats.map((stat, idx) => (
              <div key={stat.country_code} className="stat-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ minWidth: '20px' }}>{idx + 1}.</span>
                  <img src={getFlagUrl(stat.country_code)} alt={stat.country_code} width="16" />
                  <span>{stat.country_name}</span>
                </div>
                <span>{stat.click_count.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {effects.map(eff => (
          <motion.div
            key={eff.id}
            initial={{ opacity: 1, y: eff.y - 50, x: eff.x - 10 }}
            animate={{ opacity: 0, y: eff.y - 150 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', pointerEvents: 'none', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <span style={{ fontSize: '20px' }}>❤</span>
            {country?.country && <img src={getFlagUrl(country.country)} alt="flag" width="16" style={{ marginTop: '-10px' }} />}
          </motion.div>
        ))}
      </AnimatePresence>

      <footer style={{ marginTop: '1rem', fontSize: '8px', color: '#888' }}>
        Global Cat Petting Challenge
      </footer>
    </div>
  );
}

export default App;
