import React from 'react';
import { Activity, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { calculateKPIs, formatNumber, detectUnit } from '../utils/chartUtils';

export default function KPIMetrics({ prometheusData, promqlQuery }) {
  if (!prometheusData) {
    return null;
  }

  const kpis = calculateKPIs(prometheusData);

  if (!kpis) {
    return null;
  }

  // Detect the unit from the PromQL query
  const unit = promqlQuery ? detectUnit(promqlQuery) : null;

  const metrics = [
    {
      label: 'Current',
      value: kpis.current,
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Average',
      value: kpis.average,
      icon: BarChart3,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Maximum',
      value: kpis.maximum,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Minimum',
      value: kpis.minimum,
      icon: TrendingDown,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">{metric.label}</span>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(metric.value, 2, unit)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

