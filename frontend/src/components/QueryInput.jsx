import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { DEMO_QUERIES } from '../config';

export default function QueryInput({ onSubmit, loading }) {
  const [query, setQuery] = useState('');
  const [lookback, setLookback] = useState(15);
  const [step, setStep] = useState('15s');

  // Extract time from query (e.g., "for 5 minutes", "last 30 min", "15m")
  const extractTimeFromQuery = (queryText) => {
    const text = queryText.toLowerCase();
    
    // Pattern: "for X minutes/mins/min/m"
    const forPattern = /for\s+(\d+)\s*(minutes?|mins?|m)\b/i;
    // Pattern: "last X minutes/mins/min/m"
    const lastPattern = /last\s+(\d+)\s*(minutes?|mins?|m)\b/i;
    // Pattern: "X minutes/mins/min/m"
    const directPattern = /\b(\d+)\s*(minutes?|mins?|m)\b/i;
    
    let match = text.match(forPattern) || text.match(lastPattern) || text.match(directPattern);
    
    if (match) {
      return parseInt(match[1]);
    }
    
    // Check for hours
    const hourPattern = /(\d+)\s*(hours?|hrs?|h)\b/i;
    match = text.match(hourPattern);
    if (match) {
      return parseInt(match[1]) * 60; // Convert to minutes
    }
    
    return null; // No time found, use current lookback
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      // Try to extract time from query
      const extractedTime = extractTimeFromQuery(query);
      const finalLookback = extractedTime !== null ? extractedTime : lookback;
      
      // Update lookback field to show extracted value
      if (extractedTime !== null) {
        setLookback(extractedTime);
      }
      
      onSubmit({ query: query.trim(), lookback: finalLookback, step });
    }
  };

  const handleDemoClick = (demo) => {
    setQuery(demo.query);
    setLookback(demo.lookback);
    // Auto-submit
    setTimeout(() => {
      onSubmit({ query: demo.query, lookback: demo.lookback, step });
    }, 100);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          Query Builder
        </h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Natural Language Input */}
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-300 mb-2">
              Natural Language Query
            </label>
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., CPU usage for the last 15 minutes"
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Parameters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lookback" className="block text-sm font-medium text-gray-300 mb-2">
                Lookback (minutes)
              </label>
              <input
                id="lookback"
                type="number"
                min="1"
                max="1440"
                value={lookback}
                onChange={(e) => setLookback(parseInt(e.target.value) || 15)}
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="step" className="block text-sm font-medium text-gray-300 mb-2">
                Step (resolution)
              </label>
              <select
                id="step"
                value={step}
                onChange={(e) => setStep(e.target.value)}
                className="input-field"
                disabled={loading}
              >
                <option value="10s">10 seconds</option>
                <option value="15s">15 seconds</option>
                <option value="30s">30 seconds</option>
                <option value="1m">1 minute</option>
                <option value="5m">5 minutes</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Convert & Visualize
              </>
            )}
          </button>
        </form>

        {/* Demo Queries */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Demo Queries</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_QUERIES.map((demo) => (
              <button
                key={demo.id}
                onClick={() => handleDemoClick(demo)}
                disabled={loading}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

