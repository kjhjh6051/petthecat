# Pet the Cat - Global Petting Challenge

![Pet the Cat](https://img.shields.io/badge/Status-Active-brightgreen)
![Revenue-AdSense-yellow](https://img.shields.io/badge/Revenue-AdSense-yellow)

## 🐱 Project Overview
This is a fun, global competition website where users click a pixel art cat to "pet" it. Every click is counted and aggregated by country, creating a real-time global leaderboard. The project is designed to generate traffic for Google AdSense revenue.

## 🚀 Key Features
- **Pixel Art Cat**: Interactive clickable cat with animations.
- **Global Leaderboard**: Real-time rankings of countries based on total "pets".
- **Auto Country Detection**: Uses IP-based detection to automatically assign clicks to your country.
- **Revenue Optimized**: Strategically placed AdSense slots.
- **Viral Mechanics**: Encourages users to "help their country" reach #1.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Framer Motion, Vanilla CSS.
- **Backend**: Node.js, Express, SQLite3.
- **Data**: IP-based Geo-location API.

## 📦 How to Run

### 1. Server
```bash
cd server
npm install
npm run dev
```

### 2. Client
```bash
cd client
npm install
npm run dev
```

## 📈 AdSense Integration
Replace the `adsense-placeholder` divs in `client/src/App.tsx` with your actual Google AdSense code snippets once your site is approved.
