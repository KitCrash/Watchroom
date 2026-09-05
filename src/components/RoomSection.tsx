import React, { useState } from 'react';
import { Plus, LogIn, Users } from 'lucide-react';

interface RoomSectionProps {
  currentRoom: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
}

export const RoomSection: React.FC<RoomSectionProps> = ({
  currentRoom,
  onCreateRoom,
  onJoinRoom,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean) {
      setError('Please enter a room code');
      return;
    }
    setError(null);
    onJoinRoom(clean);
  };

  return (
    <section className="room-section card-block">
      <div className="section-header">
        <span className="section-title">
          <Users size={15} />
          <span>Room Setup</span>
        </span>
        {currentRoom && (
          <span className="active-room-pill">Active: {currentRoom}</span>
        )}
      </div>

      <div className="room-actions">
        {/* Create Room Button */}
        <button
          type="button"
          className="btn btn-secondary create-room-btn"
          onClick={onCreateRoom}
        >
          <Plus size={16} strokeWidth={2.2} />
          <span>Create Room</span>
        </button>

        <span className="room-divider">or</span>

        {/* Join Room Form */}
        <form className="join-room-form" onSubmit={handleJoin}>
          <input
            type="text"
            className="room-code-input"
            placeholder="Room code (e.g. 7429)"
            value={inputCode}
            maxLength={10}
            onChange={(e) => {
              setInputCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
          />
          <button type="submit" className="btn btn-primary join-room-btn">
            <LogIn size={15} strokeWidth={2.2} />
            <span>Join Room</span>
          </button>
        </form>
      </div>

      {error && <p className="input-error-msg">{error}</p>}
    </section>
  );
};
