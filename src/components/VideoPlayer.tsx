import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Smartphone, Film } from 'lucide-react';

export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  sync: () => void;
}

interface VideoPlayerProps {
  videoId: string | null;
  videoTitle?: string;
  isPlaying: boolean;
  isShort?: boolean;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ videoId, videoTitle, isPlaying, isShort = true }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const postToPlayer = (command: string, args: any[] = []) => {
      if (!iframeRef.current || !iframeRef.current.contentWindow) return;
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: command,
          args: args,
        }),
        '*'
      );
    };

    useImperativeHandle(ref, () => ({
      play: () => {
        postToPlayer('playVideo');
      },
      pause: () => {
        postToPlayer('pauseVideo');
      },
      sync: () => {
        postToPlayer('playVideo');
      },
    }));

    return (
      <div className="shorts-player-card">
        {/* Reel Header / Category Bar */}
        <div className="shorts-header-tag">
          <div className="tag-left">
            <span className={`reel-type-badge ${isShort ? 'badge-short' : 'badge-standard'}`}>
              {isShort ? 'SHORTS 9:16' : 'YOUTUBE VIDEO'}
            </span>
            <span className="shorts-title-text" title={videoTitle}>
              {videoTitle || 'Short Video'}
            </span>
          </div>
          <span className={`playback-indicator ${isPlaying ? 'is-playing' : 'is-paused'}`}>
            {isPlaying ? 'PLAYING' : 'PAUSED'}
          </span>
        </div>

        {/* 9:16 Vertical Video Frame */}
        <div className="vertical-player-wrapper">
          <div className="vertical-aspect-container">
            {videoId ? (
              <iframe
                ref={iframeRef}
                id="shorts-player-frame"
                className="vertical-yt-iframe"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&loop=1`}
                title={videoTitle || 'YouTube Shorts Player'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="vertical-placeholder">
                <div className="placeholder-icon-wrap">
                  <Smartphone size={34} strokeWidth={1.5} />
                </div>
                <p className="placeholder-title">No Short Loaded</p>
                <p className="placeholder-subtitle">
                  Paste a YouTube Shorts link below or tap Next to start watching together
                </p>
                <div className="placeholder-helper">
                  <Film size={12} />
                  <span>Supports Shorts & standard YouTube links</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
