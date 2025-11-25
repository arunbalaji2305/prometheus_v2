import React, { useState } from 'react';
import { Copy, CheckCheck, ExternalLink, LayoutDashboard } from 'lucide-react';
import { isGrafanaEnabled, generateGrafanaExploreUrl, generateGrafanaDashboardUrl } from '../utils/grafanaUtils';

export default function PromQLDisplay({ naturalQuery, promqlQuery, lookback }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promqlQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleOpenInGrafana = () => {
    const url = generateGrafanaExploreUrl(promqlQuery, lookback);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenDashboard = () => {
    const url = generateGrafanaDashboardUrl(naturalQuery, promqlQuery, lookback);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const showGrafanaButton = isGrafanaEnabled();

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">Generated PromQL Query</h2>
      </div>
      <div className="card-body space-y-4">
        {/* Natural Language Query */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Your Query
          </label>
          <p className="text-gray-200 italic">"{naturalQuery}"</p>
        </div>

        {/* PromQL Query */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-400">
              PromQL
            </label>
            <div className="flex gap-2">
              {showGrafanaButton && (
                <>
                  <button
                    onClick={handleOpenDashboard}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                    title="Open Smart Dashboard with relevant panels"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={handleOpenInGrafana}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                    title="Open in Grafana Explore"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Explore
                  </button>
                </>
              )}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
            <code>{promqlQuery}</code>
          </div>
        </div>

        {showGrafanaButton && (
          <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
            <LayoutDashboard className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-300">
              <p className="mb-1">
                <strong>Dashboard:</strong> Opens the comprehensive Windows Exporter Dashboard with all system metrics (CPU, Memory, Disk, Network).
              </p>
              <p>
                <strong>Explore:</strong> Opens Grafana Explore view with just your specific query for detailed investigation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

