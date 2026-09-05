import React from 'react';
import { Play, Pause, RefreshCw, SkipForward, LogOut } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSync: () => void;
  onNext: () => void;
  onLeaveRoom: () => void;
  disabled?: boolean;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onSync,
  onNext,
  onLeaveRoom,
  disabled = false,
}) => {
  return (
    <section className="playback-controls-section card-block">
      <div className="controls-grid controls-grid-5">
        {/* Play button with Red Accent */}
        <button
          type="button"
          className={`btn control-btn btn-play ${isPlaying ? 'btn-active-red' : ''}`}
          onClick={onPlay}
          disabled={disabled}
          title="Play short video"
          aria-label="Play"
        >
          <Play size={16} fill={isPlaying ? 'currentColor' : 'none'} strokeWidth={2.2} />
          <span>Play</span>
        </button>

        {/* Pause button */}
        <button
          type="button"
          className={`btn control-btn btn-pause ${!isPlaying ? 'btn-active-dark' : ''}`}
          onClick={onPause}
          disabled={disabled}
          title="Pause short video"
          aria-label="Pause"
        >
          <Pause size={16} strokeWidth={2.2} />
          <span>Pause</span>
        </button>

        {/* Sync button */}
        <button
          type="button"
          className="btn control-btn btn-sync"
          onClick={onSync}
          disabled={disabled}
          title="Resync playback with partner"
          aria-label="Sync"
        >
          <RefreshCw size={15} strokeWidth={2.2} />
          <span>Sync</span>
        </button>

        {/* Next Short button */}
        <button
          type="button"
          className="btn control-btn btn-next"
          onClick={onNext}
          disabled={disabled}
          title="Play next short video"
          aria-label="Next short"
        >
          <SkipForward size={16} strokeWidth={2.2} />
          <span>Next</span>
        </button>

        {/* Leave Room button */}
        <button
          type="button"
          className="btn control-btn btn-leave"
          onClick={onLeaveRoom}
          title="Leave watch room"
          aria-label="Leave"
        >
          <LogOut size={15} strokeWidth={2.2} />
          <span>Leave</span>
        </button>
      </div>
    </section>
  );
};
