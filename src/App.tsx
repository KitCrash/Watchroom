import React, { useState, useRef, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { ShortsFeed } from './components/ShortsFeed';
import { CompactChatDrawer } from './components/CompactChatDrawer';
import { RoomModal } from './components/RoomModal';
import { SAMPLE_SHORTS_FEED, extractYouTubeId, type ShortItem } from './utils/youtube';
import { fetchShortsFeed, type ApiProvider } from './services/shortsProvider';
import {
  getSocket,
  joinRoomSocket,
  emitPlaybackChange,
  emitQueueUpdate,
  emitChatMessage,
} from './services/socket';
import type { ChatMessage } from './types';

function getRoomIdFromUrl(): string | null {
  const path = window.location.pathname;
  const match = path.match(/\/room\/([a-zA-Z0-9_-]+)/i);
  if (match) return match[1].toUpperCase();

  try {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) return roomParam.toUpperCase();
  } catch {}

  const hashMatch = window.location.hash.match(/room\/([a-zA-Z0-9_-]+)/i);
  if (hashMatch) return hashMatch[1].toUpperCase();

  return null;
}

function getRoomPath(code: string | null): string {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return code ? `${prefix}room/${code}` : prefix;
}

export const App: React.FC = () => {
  const [shortsList, setShortsList] = useState<ShortItem[]>(SAMPLE_SHORTS_FEED);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [activeTopicQuery, setActiveTopicQuery] = useState<string>('#shorts trending viral');
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // API Provider state (Default to official YouTube Data API with provided API key)
  const [apiProvider, setApiProvider] = useState<ApiProvider>(() => {
    const saved = localStorage.getItem('preferred_shorts_provider') as ApiProvider;
    if (saved === 'piped' && localStorage.getItem('custom_piped_url')) {
      return 'piped';
    }
    return 'youtube';
  });
  const [customPipedUrl, setCustomPipedUrl] = useState<string>(() => {
    return localStorage.getItem('custom_piped_url') || '';
  });

  // Room & Connection state
  const [roomCode, setRoomCode] = useState<string | null>(() => getRoomIdFromUrl() || 'WR-7429');
  const [, setIsUserConnected] = useState<boolean>(false);
  const [userCount, setUserCount] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);
  const [roomModalTab, setRoomModalTab] = useState<'room' | 'feed' | 'settings'>('room');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth > 768 : false));

  // Guard flag to prevent remote socket updates from echoing back to partner
  const isRemoteSync = useRef<boolean>(false);

  // Floating Toast
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2400);
  };

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Set of all video IDs seen/loaded during the session to guarantee zero duplicate repeats
  const seenVideoIdsRef = useRef<Set<string>>(new Set());

  // URL routing helper
  const navigateToRoom = (code: string | null) => {
    window.history.pushState({}, '', getRoomPath(code));
    setRoomCode(code);
  };

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const fromUrl = getRoomIdFromUrl();
      if (fromUrl) {
        setRoomCode(fromUrl);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Ensure URL matches roomCode on first mount
  useEffect(() => {
    const fromUrl = getRoomIdFromUrl();
    if (!fromUrl && roomCode) {
      window.history.replaceState({}, '', getRoomPath(roomCode));
    }
  }, []);

  // 1. Socket.IO Room Lifecycle & Real-Time Listeners
  useEffect(() => {
    if (!roomCode) return;

    const s = getSocket();

    const handleConnect = () => {
      setIsUserConnected(true);
      joinRoomSocket(roomCode, 'User');
    };

    const handleDisconnect = () => {
      setIsUserConnected(false);
    };

    const handleRoomState = (data: { room: any; userCount: number; socketId: string }) => {
      setIsUserConnected(true);
      setUserCount(data.userCount);

      if (data.room) {
        if (Array.isArray(data.room.videos) && data.room.videos.length > 0) {
          isRemoteSync.current = true;
          setShortsList(data.room.videos);
          data.room.videos.forEach((v: ShortItem) => {
            if (v.videoId) seenVideoIdsRef.current.add(v.videoId);
          });
        }
        if (typeof data.room.activeIndex === 'number') {
          isRemoteSync.current = true;
          setActiveIndex(data.room.activeIndex);
        }
        if (typeof data.room.isPlaying === 'boolean') {
          isRemoteSync.current = true;
          setIsPlaying(data.room.isPlaying);
        }
        if (Array.isArray(data.room.messages)) {
          setMessages(
            data.room.messages
              .filter((m: any) => m.sender !== 'system' && !m.text?.includes('joined the room') && !m.text?.includes('left the room'))
              .map((m: any) => ({
                id: m.id,
                sender: m.sender === 'you' || m.id?.startsWith('my-') ? 'you' : 'partner',
                text: m.text,
                time: m.time,
              }))
          );
        }
      }
    };

    const handleUserJoined = (data: { username: string; userCount: number }) => {
      setUserCount(data.userCount);
      showToast(`${data.username || 'Partner'} joined the room! 🍿`);
    };

    const handleUserLeft = (data: { username: string; userCount: number }) => {
      setUserCount(data.userCount);
      showToast(`${data.username || 'Partner'} left the room.`);
    };

    const handlePlaybackUpdated = (data: {
      activeIndex: number;
      isPlaying: boolean;
      senderId: string;
      action?: string;
    }) => {
      if (data.senderId === s.id) return;

      isRemoteSync.current = true;
      if (typeof data.activeIndex === 'number') {
        setActiveIndex(data.activeIndex);
      }
      if (typeof data.isPlaying === 'boolean') {
        setIsPlaying(data.isPlaying);
      }

      if (data.action === 'play') showToast('Partner started playback ▶️');
      else if (data.action === 'pause') showToast('Partner paused playback ⏸️');
      else if (data.action === 'scroll') showToast('Partner moved to next Short ⏭️');
      else if (data.action === 'sync') showToast('Partner synced playback 🔄');
    };

    const handleQueueUpdated = (data: { videos: ShortItem[]; action?: string; senderId: string }) => {
      if (data.senderId === s.id) return;
      if (Array.isArray(data.videos) && data.videos.length > 0) {
        isRemoteSync.current = true;
        setShortsList(data.videos);
        data.videos.forEach((v) => {
          if (v.videoId) seenVideoIdsRef.current.add(v.videoId);
        });
        showToast('Room Shorts feed updated by partner ✨');
      }
    };

    const handleNewMessage = (data: { message: any; senderId?: string }) => {
      const m = data.message;
      if (!m || m.sender === 'system' || m.text?.includes('joined the room') || m.text?.includes('left the room')) return;
      const isMyMessage = data.senderId === s.id;
      const formattedSender: 'you' | 'partner' = isMyMessage ? 'you' : 'partner';

      setMessages((prev) => {
        if (prev.some((existing) => existing.id === m.id)) return prev;
        return [
          ...prev,
          {
            id: m.id,
            sender: formattedSender,
            text: m.text,
            time: m.time,
          },
        ];
      });
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('room-state', handleRoomState);
    s.on('user-joined', handleUserJoined);
    s.on('user-left', handleUserLeft);
    s.on('playback-updated', handlePlaybackUpdated);
    s.on('queue-updated', handleQueueUpdated);
    s.on('new-message', handleNewMessage);

    if (s.connected) {
      handleConnect();
    }

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('room-state', handleRoomState);
      s.off('user-joined', handleUserJoined);
      s.off('user-left', handleUserLeft);
      s.off('playback-updated', handlePlaybackUpdated);
      s.off('queue-updated', handleQueueUpdated);
      s.off('new-message', handleNewMessage);
    };
  }, [roomCode]);

  // Unified Shorts Loader with strict deduplication
  const loadFeed = async (
    query: string = activeTopicQuery,
    token: string | null = null,
    isAppend: boolean = false,
    provider: ApiProvider = apiProvider
  ) => {
    if (isAppend) {
      if (isLoadingMore) return;
      setIsLoadingMore(true);
    }

    try {
      let currentToken = token;
      let aggregatedNewItems: ShortItem[] = [];
      let currentNotice: string | null = null;
      let currentProviderUsed: ApiProvider = provider;
      let attempts = 0;

      // Collect fresh unique items across pages if needed, strictly filtering out any repeats
      while (attempts < 3) {
        attempts++;
        const res = await fetchShortsFeed({
          provider,
          pageToken: currentToken,
          query,
          customPipedUrl,
        });

        currentNotice = res.notice || currentNotice;
        currentProviderUsed = res.providerUsed;
        currentToken = res.nextPageToken;

        const uniqueItems = (res.items || []).filter((item) => {
          if (!item.videoId || seenVideoIdsRef.current.has(item.videoId)) {
            return false;
          }
          seenVideoIdsRef.current.add(item.videoId);
          return true;
        });

        aggregatedNewItems.push(...uniqueItems);

        if (aggregatedNewItems.length >= 5 || !currentToken) {
          break;
        }
      }

      if (aggregatedNewItems.length > 0) {
        let updatedList: ShortItem[] = [];
        if (isAppend) {
          updatedList = [...shortsList, ...aggregatedNewItems];
          setShortsList(updatedList);
        } else {
          updatedList = aggregatedNewItems;
          setShortsList(updatedList);
          setActiveIndex(0);
        }
        setNextPageToken(currentToken);

        // Sync new videos with room members
        if (roomCode) {
          emitQueueUpdate(roomCode, { videos: updatedList, action: isAppend ? 'append' : 'replace' });
        }

        if (currentNotice) {
          showToast(currentNotice);
        } else if (!isAppend) {
          showToast(`Loaded ${aggregatedNewItems.length} fresh Shorts via ${currentProviderUsed === 'piped' ? 'Piped API ⚡' : 'YouTube API 🔑'}`);
        }
      }
    } catch (err) {
      console.warn('Feed load error, keeping current feed:', err);
    } finally {
      if (isAppend) {
        setIsLoadingMore(false);
      }
    }
  };

  // Infinite Pagination
  const loadMoreShorts = async () => {
    if (isLoadingMore || !nextPageToken) return;
    loadFeed(activeTopicQuery, nextPageToken, true, apiProvider);
  };

  // Switch API Provider
  const handleChangeProvider = (newProvider: ApiProvider) => {
    setApiProvider(newProvider);
    localStorage.setItem('preferred_shorts_provider', newProvider);
    showToast(`Switched to ${newProvider === 'piped' ? 'Piped API' : 'YouTube Data API v3'}`);
    loadFeed(activeTopicQuery, null, false, newProvider);
  };

  const handleChangeCustomPipedUrl = (url: string) => {
    setCustomPipedUrl(url);
    localStorage.setItem('custom_piped_url', url);
  };

  // Next Short Navigation - strictly linear, never loops back to repeat seen shorts
  const handleNext = () => {
    const nextIdx = activeIndex + 1;

    // Proactively pre-fetch more shorts well before the end of the queue
    if (nextIdx >= shortsList.length - 4 && nextPageToken) {
      loadMoreShorts();
    }

    if (nextIdx < shortsList.length) {
      setActiveIndex(nextIdx);
      setIsPlaying(true);
      const nextShort = shortsList[nextIdx];
      if (nextShort) {
        showToast(`Next: ${nextShort.title.slice(0, 24)}... ⏭️`);
      }
      if (roomCode) {
        emitPlaybackChange(roomCode, { activeIndex: nextIdx, isPlaying: true, action: 'scroll' });
      }
    } else {
      if (nextPageToken) {
        showToast('Loading next fresh Shorts... ⏳');
        loadMoreShorts();
      } else {
        showToast('End of feed reached. Choose another topic in Feed / Room! ✨');
      }
    }
  };

  // Active Index change from scrolling
  const handleActiveIndexChange = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setIsPlaying(true);

    // Auto-fetch more fresh shorts before hitting the bottom
    if (index >= shortsList.length - 4 && nextPageToken) {
      loadMoreShorts();
    }

    if (isRemoteSync.current) {
      isRemoteSync.current = false;
      return;
    }

    if (roomCode) {
      emitPlaybackChange(roomCode, { activeIndex: index, isPlaying: true, action: 'scroll' });
    }
  };

  // Playback handlers
  const handlePlay = () => {
    setIsPlaying(true);
    if (isRemoteSync.current) {
      isRemoteSync.current = false;
      return;
    }
    if (roomCode) {
      emitPlaybackChange(roomCode, { activeIndex, isPlaying: true, action: 'play' });
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (isRemoteSync.current) {
      isRemoteSync.current = false;
      return;
    }
    if (roomCode) {
      emitPlaybackChange(roomCode, { activeIndex, isPlaying: false, action: 'pause' });
    }
  };

  const handleSync = () => {
    showToast('Synced playback with partner 🔄');
    if (roomCode) {
      emitPlaybackChange(roomCode, { activeIndex, isPlaying: true, action: 'sync' });
    }
  };

  // Switch Shorts topic or search query
  const handleSelectTopic = async (query: string, label: string) => {
    setActiveTopicQuery(query);
    showToast(`Loading ${label} Shorts... 🔍`);
    await loadFeed(query, null, false, apiProvider);
  };

  // Room management
  const handleCreateRoom = async () => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: activeTopicQuery, videos: shortsList }),
      });
      const data = await res.json();
      if (data?.room?.id) {
        navigateToRoom(data.room.id);
        showToast(`Created Room ${data.room.id}! Share link to watch together ✨`);
        return;
      }
    } catch (_) {
      // Offline / fallback
    }

    const newCode = `WR-${Math.floor(1000 + Math.random() * 9000)}`;
    navigateToRoom(newCode);
    showToast(`Created Room ${newCode}! Share link to invite partner ✨`);
  };

  const handleJoinRoom = (code: string) => {
    navigateToRoom(code);
    showToast(`Joined Room ${code} ✨`);
  };

  const handleLeaveRoom = () => {
    navigateToRoom(null);
    setIsPlaying(false);
    setUserCount(1);
    showToast('Left watch room');
  };

  const handleCopyLink = () => {
    if (!roomCode) return;
    const fullUrl = `${window.location.origin}${getRoomPath(roomCode)}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopied(true);
    showToast(`Share link copied! Send to partner 📋`);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShareLink = async () => {
    if (!roomCode) return;
    const fullUrl = `${window.location.origin}${getRoomPath(roomCode)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Watch YouTube Shorts together on Watch Room!',
          text: `Join my watch room: ${roomCode}`,
          url: fullUrl,
        });
        showToast('Shared successfully! 🚀');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      showToast('Share link copied! Send to partner 📋');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      showToast(`Room Link: ${fullUrl}`);
    }
  };

  const handleOpenRoomModal = (tab: 'room' | 'feed' | 'settings' = 'room') => {
    setRoomModalTab(tab);
    setIsRoomModalOpen(true);
  };

  // Adding custom Shorts URL to feed
  const handleAddShortUrl = (url: string) => {
    const parsed = extractYouTubeId(url);
    if (!parsed) {
      showToast('Invalid YouTube link');
      return;
    }

    const newItem: ShortItem = {
      id: `custom-${Date.now()}`,
      videoId: parsed.id,
      title: parsed.isShort ? 'User Shared YouTube Short' : 'User Shared YouTube Video',
      channel: '@SharedLink',
      url,
      likesCount: 'Custom',
    };

    seenVideoIdsRef.current.add(parsed.id);

    setShortsList((prev) => {
      const copy = [...prev];
      copy.splice(activeIndex + 1, 0, newItem);
      if (roomCode) {
        emitQueueUpdate(roomCode, { addedVideo: newItem, action: 'add-url' });
      }
      return copy;
    });
    setActiveIndex((prev) => prev + 1);
    setIsPlaying(true);
    showToast('Added Short to feed and switched! ✨');
  };

  // Real-time bidirectional chat
  const handleSendMessage = (text: string) => {
    if (!text || !text.trim() || !roomCode) return;
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    emitChatMessage(roomCode, text.trim(), 'user', msgId);
  };

  const isPartnerConnected = userCount >= 2;

  return (
    <div className={`app-container feed-layout ${isChatOpen ? 'chat-expanded' : 'chat-collapsed'}`}>
      {/* 1. Small Sticky Header with Watch Room title, Room Code, Presence & Share Link */}
      <TopBar
        roomCode={roomCode}
        onCopyLink={handleCopyLink}
        onShareLink={handleShareLink}
        isCopied={copied}
        onOpenRoomModal={handleOpenRoomModal}
        apiProvider={apiProvider}
      />

      {/* 2. Vertical Scrolling Shorts Feed (9:16 Video Player Area per Item) */}
      <main className="feed-main">
        <div className="feed-and-chat-wrapper">
          <ShortsFeed
            shorts={shortsList}
            activeIndex={activeIndex}
            onActiveIndexChange={handleActiveIndexChange}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onSync={handleSync}
            onNext={handleNext}
          />
          <CompactChatDrawer
            messages={messages}
            onSendMessage={handleSendMessage}
            partnerName={isPartnerConnected ? 'Partner' : 'Waiting...'}
            isOpen={isChatOpen}
            onToggleOpen={() => setIsChatOpen(!isChatOpen)}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      </main>

      {/* 3. Room & YouTube Shorts Topic Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        currentRoom={roomCode}
        initialTab={roomModalTab}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onLeaveRoom={handleLeaveRoom}
        onAddShortUrl={handleAddShortUrl}
        onSelectTopic={handleSelectTopic}
        activeTopic={activeTopicQuery}
        apiProvider={apiProvider}
        onChangeProvider={handleChangeProvider}
        customPipedUrl={customPipedUrl}
        onChangeCustomPipedUrl={handleChangeCustomPipedUrl}
        onCopyLink={handleCopyLink}
        onShareLink={handleShareLink}
        isCopied={copied}
      />

      {/* Floating Feedback Toast */}
      {toast && (
        <div className="toast-notification" role="status">
          <span className="toast-dot" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default App;
