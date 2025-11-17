import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ErrorAlert({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-400 mb-1">Error</h3>
          <p className="text-sm text-red-300">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

