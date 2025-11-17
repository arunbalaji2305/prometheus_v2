import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { transformPrometheusData, getSeriesNames, getChartColor } from '../utils/chartUtils';

export default function MetricsChart({ prometheusData }) {
  if (!prometheusData || !prometheusData.result || prometheusData.result.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No data to display</p>
        </div>
      </div>
    );
  }

  const chartData = transformPrometheusData(prometheusData);
  const seriesNames = getSeriesNames(prometheusData);

  if (chartData.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No data points found in the selected time range</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          Metrics Visualization
        </h2>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
            />
            {seriesNames.map((name, idx) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={getChartColor(idx)}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 text-sm text-gray-400">
          <p>
            Showing {seriesNames.length} series with {chartData.length} data points
          </p>
        </div>
      </div>
    </div>
  );
}

