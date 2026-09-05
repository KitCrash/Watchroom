import React, { useRef, useEffect } from 'react';
import { Play, Pause, RefreshCw, SkipForward, Smartphone } from 'lucide-react';
import type { ShortItem } from '../utils/youtube';

interface ShortsFeedProps {
  shorts: ShortItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSync: () => void;
  onNext: () => void;
}

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
  shorts,
  activeIndex,
  onActiveIndexChange,
  isPlaying,
  onPlay,
  onPause,
  onSync,
  onNext,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeIframeRef = useRef<HTMLIFrameElement | null>(null);
  const isScrollingProgrammatically = useRef(false);

  const postToActivePlayer = (command: string, args: any[] = []) => {
    if (!activeIframeRef.current || !activeIframeRef.current.contentWindow) return;
    activeIframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: command,
        args: args,
      }),
      '*'
    );
  };

  // Smoothly scroll to active index when changed and auto-start playback
  useEffect(() => {
    if (!containerRef.current) return;
    const targetElement = containerRef.current.children[activeIndex] as HTMLElement;
    if (targetElement) {
      isScrollingProgrammatically.current = true;
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const timer = setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  // When activeIndex changes, automatically start playing the new video
  useEffect(() => {
    onPlay();
    const playTimer = setTimeout(() => {
      postToActivePlayer('playVideo');
      postToActivePlayer('unMute');
    }, 200);
    return () => clearTimeout(playTimer);
  }, [activeIndex]);

  // When iframe finishes loading, immediately send playVideo command
  const handleIframeLoad = () => {
    postToActivePlayer('playVideo');
    postToActivePlayer('unMute');
  };

  // Handle manual scroll snapping to detect visible item
  const handleScroll = () => {
    if (isScrollingProgrammatically.current || !containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex >= 0 && newIndex < shorts.length && newIndex !== activeIndex) {
      onActiveIndexChange(newIndex);
      onPlay();
    }
  };

  const handlePlayClick = () => {
    onPlay();
    postToActivePlayer('playVideo');
  };

  const handlePauseClick = () => {
    onPause();
    postToActivePlayer('pauseVideo');
  };

  const handleSyncClick = () => {
    onSync();
    postToActivePlayer('playVideo');
  };

  return (
    <div
      ref={containerRef}
      className="shorts-feed-viewport"
      onScroll={handleScroll}
    >
      {shorts.map((item, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={item.id}
            className={`shorts-item-card ${isActive ? 'item-active' : 'item-inactive'}`}
          >
            {/* 9:16 Vertical Video Area without unwanted overlay widgets */}
            <div className="shorts-916-frame">
              {isActive ? (
                <iframe
                  ref={activeIframeRef}
                  id={`yt-short-frame-${index}`}
                  className="feed-yt-iframe"
                  src={`https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&mute=0&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${item.videoId}`}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                />
              ) : (
                <div
                  className="feed-inactive-poster"
                  onClick={() => {
                    onActiveIndexChange(index);
                    onPlay();
                  }}
                  title="Tap to watch this Short"
                >
                  <div className="poster-center-icon">
                    <Smartphone size={32} strokeWidth={1.5} />
                    <span className="poster-play-hint">Tap to Watch</span>
                  </div>
                </div>
              )}

              {/* Bottom info text */}
              <div className="short-bottom-info">
                <p className="short-channel-name">{item.channel}</p>
                <p className="short-item-title">{item.title}</p>
              </div>
            </div>

            {/* Simple video controls on each item: Play, Pause, Sync, Next */}
            <div className="item-controls-bar">
              <button
                type="button"
                className={`btn feed-ctrl-btn btn-play ${isActive && isPlaying ? 'btn-active-red' : ''}`}
                onClick={handlePlayClick}
                title="Play short for both"
                aria-label="Play"
              >
                <Play size={15} fill={isActive && isPlaying ? 'currentColor' : 'none'} strokeWidth={2.2} />
                <span>Play</span>
              </button>

              <button
                type="button"
                className={`btn feed-ctrl-btn btn-pause ${isActive && !isPlaying ? 'btn-active-dark' : ''}`}
                onClick={handlePauseClick}
                title="Pause short for both"
                aria-label="Pause"
              >
                <Pause size={15} strokeWidth={2.2} />
                <span>Pause</span>
              </button>

              <button
                type="button"
                className="btn feed-ctrl-btn btn-sync"
                onClick={handleSyncClick}
                title="Sync playback with partner"
                aria-label="Sync"
              >
                <RefreshCw size={14} strokeWidth={2.2} />
                <span>Sync</span>
              </button>

              <button
                type="button"
                className="btn feed-ctrl-btn btn-next"
                onClick={onNext}
                title="Next Short"
                aria-label="Next Short"
              >
                <SkipForward size={15} strokeWidth={2.2} />
                <span>Next</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
