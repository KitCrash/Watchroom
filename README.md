# 📺 Watch Room - Real-Time YouTube Shorts Co-Watching

A mobile-first, classic watch-together application for YouTube Shorts with synchronized 9:16 vertical scrolling, synchronized video playback (Play/Pause/Sync/Next), and instant live chat.

🔗 **Live Deployment:** [https://kitcrash.github.io/Watchroom/](https://kitcrash.github.io/Watchroom/)

---

## ✨ Features

- **Shareable Rooms**: Create a room and get a unique link (e.g. `/room/WR-7429`) to share with friends.
- **Synchronized Scrolling**: When one user scrolls or taps Next, their partner's feed scrolls to the exact same video simultaneously.
- **Synchronized Playback**: Play, Pause, and Sync actions update the video iframe for all users in the room in real time.
- **Real-Time Chat**: Integrated right-side compact chat drawer with instant message delivery and persistent room history.
- **Clean 9:16 Vertical Video Frame**: Classic, mobile-first design optimized for phones (360px–430px) and desktops with zero intrusive video overlays.
- **Dual API Engine**: Unlimited Shorts browsing powered by **Piped API** with automatic high-reliability fallback to **YouTube Data API v3**.
- **No Duplicate Repeats**: Session-wide deduplication cache ensures shorts never repeat during your watch session.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Real-Time Server
```bash
npm run server
```
Server runs at `http://localhost:3001` with WebSockets and persistent storage.

### 3. Start the Frontend
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Deploying to the Cloud

### Option 1: GitHub Pages (Frontend)
The repository is configured with GitHub Actions. Every push to `main` automatically builds and deploys to:
**https://kitcrash.github.io/Watchroom/**

### Option 2: 1-Click Fullstack Deployment (Render / Railway)
The included `render.yaml` and `Procfile` allow deploying the combined fullstack app (frontend + backend + WebSockets) in 1 click on Render or Railway.
- **Build command**: `npm install && npm run build`
- **Start command**: `node server/index.js`

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Lucide Icons, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO
- **Storage**: Persistent JSON database engine (`server/data/watchroom_db.json`)
- **APIs**: YouTube Data API v3, Piped API proxy
