import { io, Socket } from 'socket.io-client';
import type { ShortItem } from '../utils/youtube';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const customUrl = typeof window !== 'undefined' ? localStorage.getItem('watchroom_server_url') : null;
    const backendUrl = customUrl || (import.meta.env.VITE_BACKEND_URL as string) || undefined;
    socket = io(backendUrl || undefined, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function joinRoomSocket(roomId: string, username: string = 'User') {
  const s = getSocket();
  s.emit('join-room', { roomId, username });
}

export function emitPlaybackChange(
  roomId: string,
  data: {
    activeIndex: number;
    isPlaying: boolean;
    timestamp?: number;
    action?: string;
  }
) {
  const s = getSocket();
  s.emit('playback-change', {
    roomId,
    ...data,
  });
}

export function emitQueueUpdate(
  roomId: string,
  data: {
    videos?: ShortItem[];
    addedVideo?: ShortItem;
    action?: string;
  }
) {
  const s = getSocket();
  s.emit('queue-update', {
    roomId,
    ...data,
  });
}

export function emitChatMessage(
  roomId: string,
  text: string,
  sender: string = 'user',
  id?: string
) {
  const s = getSocket();
  s.emit('send-message', {
    roomId,
    text,
    sender,
    id,
  });
}
