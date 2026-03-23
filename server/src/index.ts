import express, { Request, Response } from 'express';
import cors from 'cors';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let db: Database;

// Initialize Database
async function initDb() {
  db = await open({
    filename: path.join(__dirname, '../database.sqlite'),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS stats (
      country_code TEXT PRIMARY KEY,
      country_name TEXT,
      click_count INTEGER DEFAULT 0
    )
  `);
}

// Get Stats
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const stats = await db.all('SELECT * FROM stats ORDER BY click_count DESC');
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Register Click
app.post('/api/click', async (req: Request, res: Response) => {
  try {
    const { countryCode, countryName } = req.body;
    // Note: In production, detect country from IP (e.g., using Cloudflare headers or GeoIP library)
    // For now, we accept it from the client for demonstration.
    
    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    await db.run(`
      INSERT INTO stats (country_code, country_name, click_count)
      VALUES (?, ?, 1)
      ON CONFLICT(country_code) DO UPDATE SET
        click_count = click_count + 1,
        country_name = excluded.country_name
    `, [countryCode.toUpperCase(), countryName || countryCode]);

    const updated = await db.get('SELECT * FROM stats WHERE country_code = ?', [countryCode.toUpperCase()]);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
