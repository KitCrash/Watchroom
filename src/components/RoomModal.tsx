import React, { useState } from 'react';
import { X, Plus, LogIn, Link2, LogOut, Check, Sparkles, Search, Radio, Zap, Key, Copy } from 'lucide-react';
import { POPULAR_SHORTS_TOPICS } from '../services/youtubeApi';
import type { ApiProvider } from '../services/shortsProvider';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: string | null;
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
  isCopied?: boolean;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onAddShortUrl,
  onSelectTopic,
  activeTopic = '#shorts trending viral',
  apiProvider = 'piped',
  onChangeProvider,
  customPipedUrl = '',
  onChangeCustomPipedUrl,
  onCopyLink,
  isCopied = false,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlSuccess, setUrlSuccess] = useState(false);

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
      onClose();
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
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">Room & Shorts Feed</h2>
            <span className="api-active-pill">
              <Radio size={10} className="api-dot-icon" />
              <span>{apiProvider === 'piped' ? 'Piped API (Unlimited)' : 'YouTube API Live'}</span>
            </span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Section 0: API Source Selection (Piped vs YouTube API) */}
          <div className="modal-section">
            <label className="modal-label">
              <Zap size={14} />
              <span>Shorts API Provider</span>
            </label>
            <div className="provider-toggle-row">
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
              <button
                type="button"
                className={`provider-tab-btn ${apiProvider === 'youtube' ? 'provider-active' : ''}`}
                onClick={() => onChangeProvider && onChangeProvider('youtube')}
              >
                <Key size={14} />
                <div className="provider-tab-text">
                  <strong>YouTube API v3</strong>
                  <small>Official Google Cloud Key</small>
                </div>
              </button>
            </div>

            {apiProvider === 'piped' && (
              <div className="piped-config-box mt-4">
                <div className="piped-failover-pill">
                  <span>🛡️ Seamless auto-fallback to YouTube Data API if public Piped nodes are slow or busy.</span>
                </div>
                <div className="custom-piped-input-wrap mt-4">
                  <label className="input-sublabel">Custom Self-Hosted Piped URL (Optional):</label>
                  <input
                    type="text"
                    className="modal-text-input text-xs"
                    placeholder="e.g. http://localhost:8080 or custom proxy"
                    value={customPipedUrl}
                    onChange={(e) => onChangeCustomPipedUrl && onChangeCustomPipedUrl(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-divider" />

          {/* Section 1: Live YouTube Shorts Topic Picker */}
          <div className="modal-section">
            <label className="modal-label">
              <Sparkles size={14} />
              <span>Explore Unlimited Live Shorts</span>
            </label>
            <div className="modal-topics-grid">
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

            {/* Custom Search in YouTube Shorts */}
            <form onSubmit={handleCustomSearch} className="modal-form-row mt-6">
              <input
                type="text"
                className="modal-text-input"
                placeholder="Search topics (e.g. funny cats, travel, dance)..."
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

          {/* Section 2: Paste YouTube Shorts Link */}
          <div className="modal-section">
            <label className="modal-label">
              <Link2 size={14} />
              <span>Paste Specific Shorts URL</span>
            </label>
            <form onSubmit={handleAddUrl} className="modal-form-row">
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

          <div className="modal-divider" />

          {/* Section 3: Room Code Management */}
          <div className="modal-section">
            <label className="modal-label">
              <span>Room Code & Sharing</span>
            </label>

            {currentRoom ? (
              <div className="current-room-card">
                <div className="current-room-header">
                  <span className="current-room-text">
                    Active Room: <strong>{currentRoom}</strong>
                  </span>
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

                <div className="share-url-group mt-6">
                  <label className="input-sublabel">Shareable Room Link:</label>
                  <div className="modal-form-row">
                    <input
                      type="text"
                      readOnly
                      className="modal-text-input text-xs"
                      value={`${window.location.origin}${import.meta.env.BASE_URL || '/'}room/${currentRoom}`.replace(/([^:]\/)\/+/g, '$1')}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary modal-action-btn"
                      onClick={onCopyLink}
                      title="Copy Share Link"
                    >
                      {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary full-width-btn"
                onClick={() => {
                  onCreateRoom();
                  onClose();
                }}
              >
                <Plus size={16} />
                <span>Create New Room</span>
              </button>
            )}

            <form onSubmit={handleJoin} className="modal-form-row mt-8">
              <input
                type="text"
                className="modal-text-input"
                placeholder="Enter room code (e.g. 7429)"
                value={inputCode}
                maxLength={10}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              />
              <button type="submit" className="btn btn-secondary modal-action-btn" disabled={!inputCode.trim()}>
                <LogIn size={14} />
                <span>Join</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
