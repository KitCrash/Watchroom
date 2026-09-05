import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import type { ChatMessage } from '../types';

interface CompactChatDrawerProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  partnerName?: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
}

const SHORTS_REACTIONS = [
  'LOL 😂',
  'Next one! ⏭️',
  'Replay this! 🔁',
  'Wait pause! ⏸️',
  'So cute ❤️',
];

export const CompactChatDrawer: React.FC<CompactChatDrawerProps> = ({
  messages,
  onSendMessage,
  partnerName = 'Partner',
  isOpen,
  onToggleOpen,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    onSendMessage(clean);
    setInputText('');
  };

  const handleQuickReaction = (text: string) => {
    onSendMessage(text);
  };

  return (
    <div className={`side-bubble-chat-wrapper ${isOpen ? 'is-open' : 'is-collapsed'}`}>
      {/* 1. Small Little Bubble Button (When chat is closed or toggleable) */}
      {!isOpen && (
        <button
          type="button"
          className="little-chat-bubble-btn"
          onClick={onToggleOpen}
          title="Open side-by-side chat"
          aria-label="Open side chat"
        >
          <div className="bubble-icon-wrap">
            <MessageSquare size={16} strokeWidth={2.2} />
            <span className="bubble-live-dot" />
          </div>
          <span className="bubble-btn-label">Chat</span>
          <span className="bubble-count-pill">{messages.length}</span>
        </button>
      )}

      {/* 2. Side-by-Side Chat Card (Appears when little bubble is pressed) */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="side-bubble-backdrop mobile-only-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="side-chat-bubble-card" role="dialog" aria-label="Side-by-side Room Chat">
            {/* Bubble Card Header */}
            <div className="bubble-card-header">
              <div className="bubble-header-title">
                <MessageSquare size={14} strokeWidth={2.2} />
                <span className="bubble-title-text">Room Chat</span>
                <span className="bubble-partner-pill">with {partnerName}</span>
              </div>
              <button
                type="button"
                className="bubble-card-close"
                onClick={onClose}
                title="Close chat to bubble"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable messages inside bubble */}
            <div className="bubble-messages-body">
              {messages
                .filter((msg) => msg.sender !== 'system' && !msg.text?.includes('joined the room') && !msg.text?.includes('left the room'))
                .map((msg) => {
                  const isYou = msg.sender === 'you';
                  return (
                    <div
                      key={msg.id}
                      className={`bubble-msg ${isYou ? 'msg-you' : 'msg-partner'}`}
                    >
                      <div className="bubble-msg-meta">
                        <span className="bubble-author">{isYou ? 'You' : partnerName}</span>
                        <span className="bubble-time">{msg.time}</span>
                      </div>
                      <div className="bubble-text-box">
                        <p className="bubble-text">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick reaction chips */}
            <div className="bubble-reaction-bar">
              {SHORTS_REACTIONS.map((react, i) => (
                <button
                  key={i}
                  type="button"
                  className="bubble-chip-btn"
                  onClick={() => handleQuickReaction(react)}
                >
                  {react}
                </button>
              ))}
            </div>

            {/* Message input */}
            <form onSubmit={handleSubmit} className="bubble-input-container">
              <input
                type="text"
                className="bubble-input-field"
                placeholder={`Message ${partnerName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary bubble-send-button"
                disabled={!inputText.trim()}
                title="Send message"
                aria-label="Send message"
              >
                <Send size={14} strokeWidth={2.2} />
              </button>
            </form>

            {/* Pointer tail on mobile */}
            <div className="bubble-pointer-tail-right" />
          </div>
        </>
      )}
    </div>
  );
};
