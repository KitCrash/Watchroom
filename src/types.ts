export interface ChatMessage {
  id: string;
  sender: 'you' | 'partner' | 'system';
  text: string;
  time: string;
}

export interface RoomState {
  code: string;
  isHost: boolean;
  isJoined: boolean;
  partnerConnected: boolean;
  partnerName: string;
  lastSyncedAt?: string;
}

export interface VideoInfo {
  url: string;
  videoId: string;
  title: string;
}
