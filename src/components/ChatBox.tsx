import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  partnerName?: string;
}

const SHORTS_QUICK_REACTIONS = [
  'LOL 😂',
  'Next one! ⏭️',
  'Replay this! 🔁',
  'Wait pause! ⏸️',
  'Love this ❤️',
  'Show another 🍿',
];

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  partnerName = 'Partner',
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    onSendMessage(clean);
    setInputText('');
  };

  const handleQuickChip = (text: string) => {
    onSendMessage(text);
  };

  return (
    <section className="chat-box-section card-block">
      <div className="chat-header">
        <div className="chat-header-title">
          <MessageSquare size={14} />
          <span>Room Chat</span>
          <span className="chat-with-badge">with {partnerName}</span>
        </div>
        <span className="chat-count-label">{messages.length}</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-container chat-messages-shorts">
        {messages
          .filter((msg) => msg.sender !== 'system' && !msg.text?.includes('joined the room') && !msg.text?.includes('left the room'))
          .map((msg) => {
            const isYou = msg.sender === 'you';
          return (
            <div
              key={msg.id}
              className={`chat-message ${isYou ? 'msg-you' : 'msg-partner'}`}
            >
              <div className="msg-meta">
                <span className="sender-name">{isYou ? 'You' : partnerName}</span>
                <span className="msg-time">{msg.time}</span>
              </div>
              <div className="msg-bubble">
                <p className="msg-text">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Chips */}
      <div className="quick-chat-chips">
        {SHORTS_QUICK_REACTIONS.map((quickText, idx) => (
          <button
            key={idx}
            type="button"
            className="quick-chip-btn"
            onClick={() => handleQuickChip(quickText)}
          >
            {quickText}
          </button>
        ))}
      </div>

      {/* Chat Input Form */}
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-text-input"
          placeholder={`Message ${partnerName}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary chat-send-btn"
          disabled={!inputText.trim()}
          title="Send message"
          aria-label="Send message"
        >
          <Send size={15} strokeWidth={2.2} />
          <span className="send-text">Send</span>
        </button>
      </form>
    </section>
  );
};
