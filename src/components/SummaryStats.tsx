import React from 'react';
import { Clock, DollarSign, Phone } from 'lucide-react';
import { SummaryStats } from '../types/retell';

interface SummaryStatsComponentProps {
  stats: SummaryStats;
  isLoading: boolean;
}

const SummaryStatsDisplay: React.FC<SummaryStatsComponentProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
      <StatCard
        icon={<Phone className="w-6 h-6 text-blue-600" />}
        title="Total Calls"
        value={stats.totalCalls.toString()}
        isLoading={isLoading}
      />
      
      <StatCard
        icon={<Clock className="w-6 h-6 text-teal-600" />}
        title="Total Minutes"
        value={`${stats.totalMinutes.toFixed(2)}`}
        isLoading={isLoading}
      />
      
      <StatCard
        icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
        title="Total Cost"
        value={`$${stats.totalCost.toFixed(2)}`}
        isLoading={isLoading}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, isLoading }) => {
  return (
    <div className="stat-card">
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="text-gray-600 ml-2 font-medium">{title}</h3>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );
};

export default SummaryStatsDisplay;