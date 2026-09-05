import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db, SEED_SHORTS } from './db.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Allow CORS for local development and LAN
app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Helper to generate clean unique room ID e.g. WR-4921
function generateRoomId() {
  const code = Math.floor(1000 + Math.random() * 9000);
  return `WR-${code}`;
}

// 1. REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

app.post('/api/rooms', (req, res) => {
  const { roomId, topic = '#shorts trending viral', videos } = req.body;
  const idToUse = roomId && roomId.trim() ? roomId.trim().toUpperCase() : generateRoomId();

  // If already exists, return existing
  let room = db.getRoom(idToUse);
  if (!room) {
    room = db.createRoom(idToUse, topic, videos);
  }

  const userCount = io.sockets.adapter.rooms.get(idToUse)?.size || 0;
  res.json({ success: true, room, participantsCount: userCount });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const cleanId = (req.params.roomId || '').trim().toUpperCase();
  const room = db.getRoom(cleanId);

  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }

  const userCount = io.sockets.adapter.rooms.get(cleanId)?.size || 0;
  res.json({ success: true, room, participantsCount: userCount });
});

// 2. Socket.IO Real-Time Connection
io.on('connection', (socket) => {
  // Join Room
  socket.on('join-room', ({ roomId, username = 'User' }) => {
    if (!roomId) return;
    const cleanId = roomId.trim().toUpperCase();

    // Auto-create room in DB if it doesn't exist yet so shared links always work
    let room = db.getRoom(cleanId);
    if (!room) {
      room = db.createRoom(cleanId);
    }

    socket.join(cleanId);
    socket.data.roomId = cleanId;
    socket.data.username = username;

    const userCount = io.sockets.adapter.rooms.get(cleanId)?.size || 1;

    // Send full current room state to newly joined user
    socket.emit('room-state', {
      room: db.getRoom(cleanId),
      userCount,
      socketId: socket.id,
    });

    // Notify other members of the room
    socket.to(cleanId).emit('user-joined', {
      username,
      userCount,
      socketId: socket.id,
    });
  });

  // Playback state changes (Scroll, Play, Pause, Sync, Next)
  socket.on('playback-change', ({ roomId, activeIndex, isPlaying, timestamp, action }) => {
    const cleanId = (roomId || socket.data.roomId || '').toUpperCase();
    if (!cleanId) return;

    db.updatePlaybackState(cleanId, { activeIndex, isPlaying });

    // Broadcast to other users in the room
    socket.to(cleanId).emit('playback-updated', {
      activeIndex,
      isPlaying,
      timestamp,
      action,
      senderId: socket.id,
    });
  });

  // Queue changes (Add video link, switch topic, or append more shorts)
  socket.on('queue-update', ({ roomId, videos, addedVideo, action }) => {
    const cleanId = (roomId || socket.data.roomId || '').toUpperCase();
    if (!cleanId) return;

    if (Array.isArray(videos)) {
      db.setRoomVideos(cleanId, videos);
    } else if (addedVideo) {
      db.addVideoToRoom(cleanId, addedVideo);
    }

    const currentRoom = db.getRoom(cleanId);
    socket.to(cleanId).emit('queue-updated', {
      videos: currentRoom ? currentRoom.videos : [],
      action,
      senderId: socket.id,
    });
  });

  // Real-time Chat message
  socket.on('send-message', ({ roomId, text, sender = 'partner', id }) => {
    const cleanId = (roomId || socket.data.roomId || '').toUpperCase();
    if (!cleanId || !text || !text.trim()) return;

    const savedMsg = db.addMessage(cleanId, {
      id,
      sender: 'user', // standard user message
      text: text.trim(),
    });

    // Broadcast message to everyone in room including sender
    io.to(cleanId).emit('new-message', {
      message: savedMsg,
      senderId: socket.id,
    });
  });

  // Disconnect handling
  socket.on('disconnecting', () => {
    const cleanId = socket.data.roomId;
    if (cleanId) {
      const remainingCount = Math.max(0, (io.sockets.adapter.rooms.get(cleanId)?.size || 1) - 1);
      socket.to(cleanId).emit('user-left', {
        username: socket.data.username || 'Partner',
        userCount: remainingCount,
        socketId: socket.id,
      });
    }
  });
});

// Serve frontend build in production
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Watch Room Server running on port ${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
});
