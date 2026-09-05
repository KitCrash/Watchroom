import React from 'react';
import { Tv, Share2, LogIn, Sparkles, Check, Users } from 'lucide-react';

interface TopBarProps {
  roomCode: string | null;
  onCopyLink: () => void;
  onShareLink?: () => void;
  isCopied: boolean;
  onOpenRoomModal: (tab?: 'room' | 'feed' | 'settings') => void;
  apiProvider?: 'piped' | 'youtube';
}

export const TopBar: React.FC<TopBarProps> = ({
  roomCode,
  onCopyLink,
  onShareLink,
  isCopied,
  onOpenRoomModal,
  apiProvider = 'youtube',
}) => {
  const handleShare = () => {
    if (onShareLink) {
      onShareLink();
    } else {
      onCopyLink();
    }
  };

  return (
    <header className="sticky-feed-header">
      <div className="header-top-row">
        {/* Brand */}
        <div
          className="header-brand"
          onClick={() => onOpenRoomModal('room')}
          role="button"
          tabIndex={0}
          title="Watch Room - Tap to manage rooms"
        >
          <div className="brand-badge-icon">
            <Tv size={13} strokeWidth={2.5} />
          </div>
          <span className="brand-name">Watch Room</span>
        </div>

        {/* Header Action Controls */}
        <div className="header-actions">
          {/* Active Room Code Capsule */}
          {roomCode ? (
            <button
              type="button"
              className="room-code-capsule"
              onClick={() => onOpenRoomModal('room')}
              title={`Active Room: ${roomCode}. Tap to manage or switch rooms.`}
            >
              <Users size={11} className="capsule-icon" />
              <span className="capsule-code">{roomCode}</span>
            </button>
          ) : (
            <span className="no-room-badge">Solo</span>
          )}

          {/* Prominent JOIN ROOM Button - Always visible and accessible on mobile */}
          <button
            type="button"
            className="btn-header-join"
            onClick={() => onOpenRoomModal('room')}
            title="Join or Create a Watch Room"
          >
            <LogIn size={11} strokeWidth={2.5} />
            <span>Join</span>
          </button>

          {/* Share Button (if in a room) */}
          {roomCode && (
            <button
              type="button"
              className="header-icon-btn share-header-btn"
              onClick={handleShare}
              title="Share Room Link with friend (WhatsApp / Copy)"
              aria-label="Share Room Link"
            >
              {isCopied ? <Check size={12} className="check-success" /> : <Share2 size={12} />}
            </button>
          )}

          {/* Feed & API Settings icon */}
          <button
            type="button"
            className="header-icon-btn feed-header-btn"
            onClick={() => onOpenRoomModal('feed')}
            title={`Feed Topics & API (${apiProvider === 'piped' ? 'Piped' : 'YouTube API'}). Tap to explore.`}
            aria-label="Feed Topics"
          >
            <Sparkles size={12} />
          </button>
        </div>
      </div>
    </header>
  );
};
