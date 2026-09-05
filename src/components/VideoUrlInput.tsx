import React, { useState } from 'react';
import { Link2, ArrowRight, Sparkles, ClipboardPaste } from 'lucide-react';
import { SAMPLE_SHORTS, type SampleVideo } from '../utils/youtube';

interface VideoUrlInputProps {
  currentUrl?: string;
  onLoadUrl: (url: string, title?: string) => void;
  error?: string | null;
}

export const VideoUrlInput: React.FC<VideoUrlInputProps> = ({
  currentUrl = '',
  onLoadUrl,
  error,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputUrl.trim();
    if (!clean) {
      setLocalError('Please paste a YouTube Shorts or video link');
      return;
    }
    setLocalError(null);
    onLoadUrl(clean);
  };

  const handleSampleClick = (sample: SampleVideo) => {
    setInputUrl(sample.url);
    setLocalError(null);
    onLoadUrl(sample.url, sample.title);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text);
          setLocalError(null);
        }
      }
    } catch {
      // Clipboard unavailable or restricted
    }
  };

  return (
    <section className="video-url-section card-block">
      <label htmlFor="video-url-field" className="section-label">
        <Link2 size={15} />
        <span>YouTube Shorts or Video URL</span>
      </label>

      <form className="video-url-form" onSubmit={handleSubmit}>
        <div className="input-with-action">
          <input
            id="video-url-field"
            type="url"
            className="video-input"
            placeholder="Paste Shorts link (youtube.com/shorts/...)"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              if (localError) setLocalError(null);
            }}
          />
          {Boolean(navigator?.clipboard?.readText) && (
            <button
              type="button"
              className="btn-input-icon"
              onClick={handlePasteClipboard}
              title="Paste from clipboard"
              aria-label="Paste from clipboard"
            >
              <ClipboardPaste size={15} />
            </button>
          )}
        </div>

        <button type="submit" className="btn btn-primary load-video-btn">
          <span>Load</span>
          <ArrowRight size={15} strokeWidth={2.2} />
        </button>
      </form>

      {(error || localError) && (
        <p className="input-error-msg">{error || localError}</p>
      )}

      {/* Quick sample chips */}
      <div className="sample-chips-row">
        <span className="sample-label">
          <Sparkles size={12} />
          <span>Tap to load sample shorts:</span>
        </span>
        <div className="chips-list">
          {SAMPLE_SHORTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className={`chip-btn ${sample.isShort !== false ? 'chip-short' : ''}`}
              onClick={() => handleSampleClick(sample)}
            >
              {sample.label || sample.title}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
