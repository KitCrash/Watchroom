import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  LogIn,
  Link2,
  LogOut,
  Check,
  Sparkles,
  Search,
  Zap,
  Key,
  Copy,
  Share2,
  Users,
} from 'lucide-react';
import { POPULAR_SHORTS_TOPICS } from '../services/youtubeApi';
import type { ApiProvider } from '../services/shortsProvider';

export type RoomModalTab = 'room' | 'feed' | 'settings';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: string | null;
  initialTab?: RoomModalTab;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  onAddShortUrl: (url: string) => void;
  onSelectTopic?: (query: string, label: string) => void;
  activeTopic?: string;
  apiProvider?: ApiProvider;
  onChangeProvider?: (provider: ApiProvider) => void;
  customPipedUrl?: string;
  onChangeCustomPipedUrl?: (url: string) => void;
  onCopyLink?: () => void;
  onShareLink?: () => void;
  isCopied?: boolean;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  initialTab = 'room',
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onAddShortUrl,
  onSelectTopic,
  activeTopic = '#shorts trending viral',
  apiProvider = 'youtube',
  onChangeProvider,
  customPipedUrl = '',
  onChangeCustomPipedUrl,
  onCopyLink,
  onShareLink,
  isCopied = false,
}) => {
  const [activeTab, setActiveTab] = useState<RoomModalTab>(initialTab);
  const [inputCode, setInputCode] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlSuccess, setUrlSuccess] = useState(false);
  const joinInputRef = useRef<HTMLInputElement | null>(null);

  // Sync tab with initialTab whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Auto-focus code input when opening room tab
      if (initialTab === 'room') {
        setTimeout(() => joinInputRef.current?.focus(), 120);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    let clean = inputCode.trim();
    if (clean.includes('/room/')) {
      const parts = clean.split('/room/');
      clean = parts[1].split(/[?#]/)[0];
    }
    clean = clean.toUpperCase();
    if (clean) {
      onJoinRoom(clean);
      setInputCode('');
      onClose();
    }
  };

  const handleShare = () => {
    if (onShareLink) {
      onShareLink();
    } else if (onCopyLink) {
      onCopyLink();
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputUrl.trim();
    if (clean) {
      onAddShortUrl(clean);
      setUrlSuccess(true);
      setInputUrl('');
      setTimeout(() => {
        setUrlSuccess(false);
        onClose();
      }, 900);
    }
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim();
    if (clean && onSelectTopic) {
      onSelectTopic(`#shorts ${clean}`, clean);
      onClose();
    }
  };

  const handleTopicClick = (query: string, label: string) => {
    if (onSelectTopic) {
      onSelectTopic(query, label);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">Watch Room Menu</h2>
            {currentRoom && (
              <span className="current-room-badge">
                <Users size={11} />
                <span>{currentRoom}</span>
              </span>
            )}
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation: Room / Join (Primary) | Explore Feed | Settings */}
        <div className="modal-tab-bar">
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'room' ? 'tab-active' : ''}`}
            onClick={() => {
              setActiveTab('room');
              setTimeout(() => joinInputRef.current?.focus(), 80);
            }}
          >
            <LogIn size={13} />
            <span>Join & Room</span>
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'feed' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Sparkles size={13} />
            <span>Explore Feed</span>
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'settings' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Zap size={13} />
            <span>API Settings</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="modal-body">
          {/* TAB 1: ROOM & JOIN (Primary Section for Mobile Users) */}
          {activeTab === 'room' && (
            <div className="tab-pane">
              {/* Join an Existing Room */}
              <div className="modal-section join-section-box">
                <div className="section-title-row">
                  <LogIn size={15} className="accent-red-icon" />
                  <span className="modal-label">Join a Watch Room</span>
                </div>
                <p className="section-desc">
                  Enter your friend's room code or paste the room link to sync playback in real time:
                </p>
                <form onSubmit={handleJoin} className="modal-form-row mt-4">
                  <input
                    ref={joinInputRef}
                    type="text"
                    className="modal-text-input join-room-input"
                    placeholder="e.g. WR-7429 or paste full link"
                    value={inputCode}
                    maxLength={40}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary modal-action-btn join-room-submit-btn"
                    disabled={!inputCode.trim()}
                  >
                    <LogIn size={14} />
                    <span>Join</span>
                  </button>
                </form>
              </div>

              <div className="modal-divider" />

              {/* Create a New Room */}
              <div className="modal-section">
                <div className="section-title-row">
                  <Plus size={15} className="accent-red-icon" />
                  <span className="modal-label">Start a New Watch Room</span>
                </div>
                <p className="section-desc">
                  Generate a fresh shareable room code to watch Shorts together with someone:
                </p>
                <button
                  type="button"
                  className="btn btn-secondary full-width-btn create-room-btn mt-4"
                  onClick={() => {
                    onCreateRoom();
                    onClose();
                  }}
                >
                  <Plus size={15} />
                  <span>Create New Room</span>
                </button>
              </div>

              {/* Active Room Card & Sharing Options */}
              {currentRoom && (
                <>
                  <div className="modal-divider" />
                  <div className="modal-section active-room-box">
                    <div className="current-room-card">
                      <div className="current-room-header">
                        <div className="room-meta-left">
                          <span className="room-status-indicator" />
                          <span className="current-room-text">
                            Active Room: <strong>{currentRoom}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary modal-leave-btn"
                          onClick={() => {
                            onLeaveRoom();
                            onClose();
                          }}
                        >
                          <LogOut size={13} />
                          <span>Leave</span>
                        </button>
                      </div>

                      <div className="share-actions-group mt-6">
                        <button
                          type="button"
                          className="btn btn-primary share-full-btn"
                          onClick={handleShare}
                        >
                          <Share2 size={14} />
                          <span>{isCopied ? 'Link Copied!' : 'Share Room Link (WhatsApp / Share)'}</span>
                        </button>
                        {onCopyLink && (
                          <button
                            type="button"
                            className="btn btn-secondary copy-link-btn"
                            onClick={onCopyLink}
                            title="Copy link to clipboard"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            <span>Copy Link</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: EXPLORE LIVE SHORTS FEED & TOPICS */}
          {activeTab === 'feed' && (
            <div className="tab-pane">
              <div className="modal-section">
                <div className="section-title-row">
                  <Sparkles size={14} className="accent-red-icon" />
                  <span className="modal-label">Explore Shorts Topics</span>
                </div>
                <div className="modal-topics-grid mt-4">
                  {POPULAR_SHORTS_TOPICS.map((topic) => (
                    <button
                      key={topic.query}
                      type="button"
                      className={`modal-topic-chip ${activeTopic === topic.query ? 'chip-active' : ''}`}
                      onClick={() => handleTopicClick(topic.query, topic.label)}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleCustomSearch} className="modal-form-row mt-6">
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="Search any topic (e.g. comedy, anime, tech)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary modal-action-btn" disabled={!searchQuery.trim()}>
                    <Search size={14} />
                    <span>Search</span>
                  </button>
                </form>
              </div>

              <div className="modal-divider" />

              <div className="modal-section">
                <div className="section-title-row">
                  <Link2 size={14} className="accent-red-icon" />
                  <span className="modal-label">Paste Specific Shorts URL</span>
                </div>
                <form onSubmit={handleAddUrl} className="modal-form-row mt-4">
                  <input
                    type="url"
                    className="modal-text-input"
                    placeholder="https://youtube.com/shorts/..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary modal-action-btn" disabled={!inputUrl.trim()}>
                    {urlSuccess ? <Check size={15} /> : <span>Add to Feed</span>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: API SETTINGS */}
          {activeTab === 'settings' && (
            <div className="tab-pane">
              <div className="modal-section">
                <div className="section-title-row">
                  <Zap size={14} className="accent-red-icon" />
                  <span className="modal-label">Shorts API Provider</span>
                </div>
                <div className="provider-toggle-row mt-4">
                  <button
                    type="button"
                    className={`provider-tab-btn ${apiProvider === 'youtube' ? 'provider-active' : ''}`}
                    onClick={() => onChangeProvider && onChangeProvider('youtube')}
                  >
                    <Key size={14} />
                    <div className="provider-tab-text">
                      <strong>YouTube API v3</strong>
                      <small>Official Google Cloud (Default)</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`provider-tab-btn ${apiProvider === 'piped' ? 'provider-active' : ''}`}
                    onClick={() => onChangeProvider && onChangeProvider('piped')}
                  >
                    <Zap size={14} />
                    <div className="provider-tab-text">
                      <strong>Piped API</strong>
                      <small>No Quota Limit (Free)</small>
                    </div>
                  </button>
                </div>

                {apiProvider === 'piped' && (
                  <div className="piped-config-box mt-4">
                    <div className="piped-failover-pill">
                      <span>🛡️ Auto-fallback to YouTube Data API if public Piped nodes are slow.</span>
                    </div>
                    <div className="custom-piped-input-wrap mt-4">
                      <label className="input-sublabel">Custom Self-Hosted Piped URL (Optional):</label>
                      <input
                        type="text"
                        className="modal-text-input text-xs mt-2"
                        placeholder="e.g. http://localhost:8080 or custom proxy"
                        value={customPipedUrl}
                        onChange={(e) => onChangeCustomPipedUrl && onChangeCustomPipedUrl(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
