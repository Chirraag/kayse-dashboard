import React from 'react';
import { Phone, Clock, DollarSign } from 'lucide-react';
import type { SummaryStats as SummaryStatsType } from '../types/retell';

interface SummaryStatsProps {
  stats: SummaryStatsType;
  isLoading: boolean;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  isLoading: boolean;
}> = ({ icon, label, value, subValue, isLoading }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-100 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        {isLoading ? (
          <>
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-1"></div>
            {subValue && <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>}
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold">{value}</p>
            {subValue && <p className="text-gray-500 text-sm">{subValue}</p>}
          </>
        )}
      </div>
    </div>
  </div>
);

const SummaryStats: React.FC<SummaryStatsProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        icon={<Phone className="w-6 h-6 text-blue-600" />}
        label="Total Calls"
        value={stats.totalCalls}
        subValue={`${stats.totalMinutes} minutes`}
        isLoading={isLoading}
      />
      <StatCard
        icon={<Clock className="w-6 h-6 text-blue-600" />}
        label="Agent Cost"
        value={`$${stats.agentCost.toFixed(2)}`}
        subValue={`Telephony: $${stats.telephonyCost.toFixed(2)}`}
        isLoading={isLoading}
      />
      <StatCard
        icon={<DollarSign className="w-6 h-6 text-blue-600" />}
        label="Total Cost"
        value={`$${stats.totalCost.toFixed(2)}`}
        isLoading={isLoading}
      />
    </div>
  );
};


export default SummaryStats