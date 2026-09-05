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
    videoId: 'cWENS05O3m0',
    title: 'Best proposal 💀💯✅ #trending',
    channel: 'MumDeep',
    url: 'https://www.youtube.com/shorts/cWENS05O3m0',
    likesCount: '2.4M',
    isShort: true,
  },
  {
    id: 's2',
    videoId: 'uQYHwnb445U',
    title: 'She 😡 #bengali #couple #shorts',
    channel: 'Sou Mani',
    url: 'https://www.youtube.com/shorts/uQYHwnb445U',
    likesCount: '1.8M',
    isShort: true,
  },
  {
    id: 's3',
    videoId: 'eUvABatCFyw',
    title: 'True Love ❤️🗿 #bangla #bongguy #funny',
    channel: 'Your Bong Guy',
    url: 'https://www.youtube.com/shorts/eUvABatCFyw',
    likesCount: '950K',
    isShort: true,
  },
  {
    id: 's4',
    videoId: '5XgyL4cLXPU',
    title: 'bhalobasa status / love shayari #shorts',
    channel: 'Konthe Ankan',
    url: 'https://www.youtube.com/shorts/5XgyL4cLXPU',
    likesCount: '820K',
    isShort: true,
  },
  {
    id: 's5',
    videoId: 'SjM589oY9bc',
    title: 'Love Status 💏❤ ভালোবাসার স্ট্যাটাস #shorts',
    channel: 'ভালোবাসার কাব্য',
    url: 'https://www.youtube.com/shorts/SjM589oY9bc',
    likesCount: '640K',
    isShort: true,
  },
  {
    id: 's6',
    videoId: '0d4xJTfXz9g',
    title: 'Black dress style || #shorts #trending',
    channel: 'Style Vibe',
    url: 'https://www.youtube.com/shorts/0d4xJTfXz9g',
    likesCount: '1.1M',
    isShort: true,
  },
  {
    id: 's7',
    videoId: 'LFpBR2n4CoI',
    title: 'Bugatti trend with rabbit 🐇 #shorts #edit',
    channel: 'Speed Reels',
    url: 'https://www.youtube.com/shorts/LFpBR2n4CoI',
    likesCount: '3.2M',
    isShort: true,
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
