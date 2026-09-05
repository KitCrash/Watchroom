import React from 'react';
import { Radio, RefreshCw } from 'lucide-react';

interface StatusAreaProps {
  isUserConnected: boolean;
  isPartnerConnected: boolean;
  partnerName?: string;
  lastSyncedText?: string;
  onTogglePartnerSim?: () => void;
}

export const StatusArea: React.FC<StatusAreaProps> = ({
  isUserConnected,
  isPartnerConnected,
  lastSyncedText = 'In sync',
  onTogglePartnerSim,
}) => {
  return (
    <div className="status-area">
      <div className="status-item you-status">
        <span
          className={`status-dot ${isUserConnected ? 'dot-active' : 'dot-inactive'}`}
        />
        <span className="status-text">
          {isUserConnected ? 'You connected' : 'You disconnected'}
        </span>
      </div>

      <div className="status-divider" />

      <div className="status-item partner-status">
        <span
          className={`status-dot ${isPartnerConnected ? 'dot-partner' : 'dot-waiting'}`}
        />
        <span className="status-text">
          {isPartnerConnected ? 'Partner connected' : 'Partner disconnected'}
        </span>
      </div>

      {isUserConnected && isPartnerConnected && (
        <div className="sync-badge" title="Synchronization health">
          <Radio size={12} className="sync-pulse-icon" />
          <span>{lastSyncedText}</span>
        </div>
      )}

      {onTogglePartnerSim && (
        <button
          type="button"
          className="sim-partner-btn"
          onClick={onTogglePartnerSim}
          title="Toggle simulated partner status"
        >
          <RefreshCw size={11} />
          <span>{isPartnerConnected ? 'Sim Off' : 'Sim On'}</span>
        </button>
      )}
    </div>
  );
};
