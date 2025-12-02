import React, { useState } from 'react';
import Header from './components/Header';
import HealthStatus from './components/HealthStatus';
import QueryInput from './components/QueryInput';
import PromQLDisplay from './components/PromQLDisplay';
import MetricsChart from './components/MetricsChart';
import KPIMetrics from './components/KPIMetrics';
import ErrorAlert from './components/ErrorAlert';
import { apiClient } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [naturalQuery, setNaturalQuery] = useState('');
  const [promqlQuery, setPromqlQuery] = useState('');
  const [prometheusData, setPrometheusData] = useState(null);
  const [lookback, setLookback] = useState(15);

  const handleSubmit = async ({ query, lookback: lb, step }) => {
    setLoading(true);
    setError(null);
    setNaturalQuery(query);
    setLookback(lb);

    try {
      // Step 1: Convert NL to PromQL (pass lookback to sync the range selector)
      const conversionResult = await apiClient.convertToPromQL(query, lb);
      const generatedPromQL = conversionResult.data.promqlQuery;
      setPromqlQuery(generatedPromQL);

      // Step 2: Query Prometheus with the generated PromQL
      const prometheusResult = await apiClient.queryPrometheus(generatedPromQL, lb, step);
      setPrometheusData(prometheusResult.data);
    } catch (err) {
      console.error('Query error:', err);
      setError(err.message || 'An unexpected error occurred');
      setPromqlQuery('');
      setPrometheusData(null);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = promqlQuery && prometheusData;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Health Status */}
          <HealthStatus />

          {/* Error Alert */}
          {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

          {/* Query Input */}
          <QueryInput onSubmit={handleSubmit} loading={loading} />

          {/* Results Section */}
          {hasResults && (
            <>
              {/* PromQL Display */}
              <PromQLDisplay
                naturalQuery={naturalQuery}
                promqlQuery={promqlQuery}
                lookback={lookback}
              />

              {/* KPI Metrics */}
              <KPIMetrics prometheusData={prometheusData} promqlQuery={promqlQuery} />

              {/* Chart */}
              <MetricsChart prometheusData={prometheusData} />
            </>
          )}

          {/* Empty State */}
          {!hasResults && !loading && (
            <div className="card">
              <div className="card-body text-center py-16">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    Get Started
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Enter a natural language query above or try one of the demo queries to visualize your Prometheus metrics.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-400">
                    <span>Powered by</span>
                    <span className="font-semibold text-primary-500">Google Gemini AI</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            Built with React, Vite, Tailwind CSS, and Recharts • Powered by Gemini AI & Prometheus
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

