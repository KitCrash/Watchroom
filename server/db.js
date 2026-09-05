import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const JSON_DB_FILE = path.join(DATA_DIR, 'watchroom_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed videos for newly created rooms
export const SEED_SHORTS = [
  {
    id: 's1',
    videoId: 'M576WGiDBdQ',
    title: 'Cute Cat Jump Mishap & Surprise 🐱',
    channel: '@CatMoments',
    url: 'https://www.youtube.com/shorts/M576WGiDBdQ',
    likesCount: '1.2M',
  },
  {
    id: 's2',
    videoId: 'k1BneeJTDcU',
    title: 'Satisfying Japanese Rolled Omelette Flip 🍳',
    channel: '@ChefTasting',
    url: 'https://www.youtube.com/shorts/k1BneeJTDcU',
    likesCount: '840K',
  },
  {
    id: 's3',
    videoId: 'linlz7-Pnvw',
    title: 'Cinematic Swiss Alps Waterfall Sunset 🏔️',
    channel: '@DroneVibes',
    url: 'https://www.youtube.com/shorts/linlz7-Pnvw',
    likesCount: '520K',
  },
  {
    id: 's4',
    videoId: 'aqz-KE-bpKQ',
    title: 'Classic Animation: Big Buck Bunny Moment 🐰',
    channel: '@BlenderOpen',
    url: 'https://www.youtube.com/shorts/aqz-KE-bpKQ',
    likesCount: '2.1M',
  },
  {
    id: 's5',
    videoId: 'jfKfPfyJRdk',
    title: 'Cozy Rainy Lofi Cafe Window Beats ☕',
    channel: '@ChillHopLoFi',
    url: 'https://www.youtube.com/shorts/jfKfPfyJRdk',
    likesCount: '950K',
  },
  {
    id: 's6',
    videoId: '9bZkp7q19f0',
    title: 'Legendary Dance Iconic Move 🕺',
    channel: '@KpopReels',
    url: 'https://www.youtube.com/shorts/9bZkp7q19f0',
    likesCount: '3.4M',
  },
  {
    id: 's7',
    videoId: 'dQw4w9WgXcQ',
    title: 'Unforgettable 80s Musical Chorus 🎶',
    channel: '@RetroGroove',
    url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    likesCount: '15M',
  },
];

// Persistent File-Backed Database
class JsonDatabase {
  constructor() {
    this.data = {
      rooms: {}, // roomId -> { id, createdAt, activeIndex, isPlaying, topic, videos: [], messages: [] }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(JSON_DB_FILE)) {
        const raw = fs.readFileSync(JSON_DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing JSON DB, starting fresh:', e.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(JSON_DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to persist database to file:', e.message);
    }
  }

  createRoom(roomId, topic = '#shorts trending viral', initialVideos = null) {
    const cleanId = roomId.toUpperCase();
    const room = {
      id: cleanId,
      createdAt: Date.now(),
      activeIndex: 0,
      isPlaying: true,
      topic,
      videos: Array.isArray(initialVideos) && initialVideos.length > 0 ? initialVideos : [...SEED_SHORTS],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'system',
          text: `Room ${cleanId} created. Watching Shorts feed together!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    this.data.rooms[cleanId] = room;
    this.save();
    return room;
  }

  getRoom(roomId) {
    if (!roomId) return null;
    return this.data.rooms[roomId.toUpperCase()] || null;
  }

  updatePlaybackState(roomId, { activeIndex, isPlaying, topic }) {
    const room = this.getRoom(roomId);
    if (!room) return null;
    if (typeof activeIndex === 'number') room.activeIndex = activeIndex;
    if (typeof isPlaying === 'boolean') room.isPlaying = isPlaying;
    if (typeof topic === 'string') room.topic = topic;
    this.save();
    return room;
  }

  setRoomVideos(roomId, videos) {
    const room = this.getRoom(roomId);
    if (!room) return false;
    room.videos = videos;
    this.save();
    return true;
  }

  addVideoToRoom(roomId, video, insertAt = null) {
    const room = this.getRoom(roomId);
    if (!room) return false;
    if (typeof insertAt === 'number' && insertAt >= 0) {
      room.videos.splice(insertAt, 0, video);
    } else {
      room.videos.push(video);
    }
    this.save();
    return true;
  }

  addMessage(roomId, { sender, text, id, time }) {
    const room = this.getRoom(roomId);
    if (!room) return null;
    const msg = {
      id: id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: sender || 'partner',
      text: text || '',
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    room.messages.push(msg);
    // Keep last 100 messages
    if (room.messages.length > 100) {
      room.messages.shift();
    }
    this.save();
    return msg;
  }
}

export const db = new JsonDatabase();
