import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api';

export default function HealthStatus() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    try {
      const response = await apiClient.checkHealth();
      setHealth(response.data);
    } catch (error) {
      setHealth({ ok: false, services: { prometheusUp: false, aiConfigured: false } });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  const getStatusIcon = (isUp) => {
    if (isUp) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const overallStatus = health?.ok;

  return (
    <div className={`card ${overallStatus ? 'border-green-600' : 'border-red-600'}`}>
      <div className="card-body py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {overallStatus ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium text-white">
              {overallStatus ? 'All Systems Operational' : 'System Issues Detected'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              {getStatusIcon(health?.services?.prometheusUp)}
              <span className="text-gray-300">Prometheus</span>
            </div>
            <div className="flex items-center gap-1.5">
              {getStatusIcon(health?.services?.aiConfigured)}
              <span className="text-gray-300">Gemini AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

