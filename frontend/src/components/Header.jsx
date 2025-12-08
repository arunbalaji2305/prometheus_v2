import React from 'react';
import { Activity, Github } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Natural Language to PromQL</h1>
              <p className="text-sm text-gray-400">
                Query Prometheus metrics using plain English
              </p>
            </div>
          </div>
          
          <a
            href="https://github.com/arunbalaji2305/prometheus_v2"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="GitHub Repository"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
      </div>
    </header>
  );
}

