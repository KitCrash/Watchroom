import React from 'react';
import { Tv, Copy, Check, Plus, Zap, Key, Share2 } from 'lucide-react';

interface TopBarProps {
  roomCode: string | null;
  onCopyLink: () => void;
  isCopied: boolean;
  isUserConnected: boolean;
  isPartnerConnected: boolean;
  userCount?: number;
  onOpenRoomModal: () => void;
  apiProvider?: 'piped' | 'youtube';
}

export const TopBar: React.FC<TopBarProps> = ({
  roomCode,
  onCopyLink,
  isCopied,
  isUserConnected,
  isPartnerConnected,
  userCount = 1,
  onOpenRoomModal,
  apiProvider = 'youtube',
}) => {
  return (
    <header className="sticky-feed-header">
      {/* Top row: Brand + Room Code + Share Link + Add/Room button */}
      <div className="header-top-row">
        <div className="header-brand">
          <div className="brand-badge-icon">
            <Tv size={15} strokeWidth={2.5} />
          </div>
          <span className="brand-name">Watch Room</span>
        </div>

        <div className="header-actions">
          {roomCode ? (
            <div className="room-code-capsule">
              <span className="capsule-label">ROOM</span>
              <span className="capsule-code">{roomCode}</span>
              <button
                type="button"
                className="header-icon-btn copy-btn"
                onClick={onCopyLink}
                title="Copy Shareable Room Link"
                aria-label="Copy Room Link"
              >
                {isCopied ? <Check size={13} className="check-success" /> : <Copy size={13} />}
              </button>
            </div>
          ) : (
            <span className="no-room-badge">No Room</span>
          )}

          <button
            type="button"
            className="api-header-pill"
            onClick={onOpenRoomModal}
            title={`Feed Source: ${apiProvider === 'piped' ? 'Piped API (Unlimited)' : 'YouTube API v3'}. Tap to switch.`}
          >
            {apiProvider === 'piped' ? (
              <>
                <Zap size={10} className="api-zap-icon" />
                <span>Piped</span>
              </>
            ) : (
              <>
                <Key size={10} className="api-key-icon" />
                <span>YT API</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-header-action"
            onClick={onOpenRoomModal}
            title="Room Setup & Feed Sources"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Feed / Room</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Real-time Connection Status & Share Link button */}
      <div className="header-status-row">
        <div className="status-indicator-group">
          <div className="status-chip">
            <span className={`status-dot ${isUserConnected ? 'dot-active' : 'dot-inactive'}`} />
            <span className="status-label-text">
              {isUserConnected ? 'You connected' : 'Connecting...'}
            </span>
          </div>

          <span className="status-pipe">|</span>

          <div className="status-chip">
            <span className={`status-dot ${isPartnerConnected ? 'dot-partner' : 'dot-waiting'}`} />
            <span className="status-label-text">
              {isPartnerConnected
                ? `Partner connected (${userCount})`
                : 'Waiting for partner'}
            </span>
          </div>
        </div>

        {roomCode && (
          <button
            type="button"
            className="share-link-pill-btn"
            onClick={onCopyLink}
            title="Copy shareable link to invite a friend"
          >
            {isCopied ? <Check size={11} className="check-success" /> : <Share2 size={11} />}
            <span>{isCopied ? 'Link Copied!' : 'Share Link'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
