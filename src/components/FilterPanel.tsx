import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FilterIcon, Download, RefreshCw } from 'lucide-react';
import { Agent, FilterCriteria } from '../types/retell';

interface FilterPanelProps {
  agents: Agent[];
  onFilterChange: (filters: FilterCriteria) => void;
  onExport: () => void;
  isLoading: boolean;
  onRefresh: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  agents, 
  onFilterChange, 
  onExport, 
  isLoading, 
  onRefresh 
}) => {
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  };

  const applyFilters = () => {
    const filters: FilterCriteria = {};
    
    if (selectedAgentIds.length > 0) {
      filters.agent_id = selectedAgentIds.map(id => id);
    }
    
    if (startDate || endDate) {
      filters.start_timestamp = {
        lower_threshold: startDate ? startDate.getTime() : undefined,
        upper_threshold: endDate ? endDate.getTime() : undefined,
      };
    }
    
    console.log('Applying filters:', JSON.stringify(filters, null, 2));
    console.log('Selected agents:', selectedAgentIds);
    console.log('Date range:', { startDate, endDate });
    
    onFilterChange(filters);
  };

  const resetFilters = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setStartDate(today);
    setEndDate(tomorrow);
    setSelectedAgentIds([]);
    onFilterChange({
      start_timestamp: {
        lower_threshold: today.getTime(),
        upper_threshold: tomorrow.getTime()
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8 relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-lg font-medium text-blue-900">
          <FilterIcon className="w-5 h-5" />
          Filter Calls
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onExport}
            className="btn-success"
          >
            <Download className="w-4 h-4" />
            Export Client Bill
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block mb-3 text-sm font-medium text-blue-700">Date Range</label>
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white pr-8"
            placeholderText="Select date range"
            isClearable
            showTimeSelect={false}
            dateFormat="MM/dd/yyyy"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block mb-3 text-sm font-medium text-blue-700">Select Agents</label>
          <div className="relative">
            <div className="border border-blue-200 rounded-lg p-2 max-h-48 overflow-y-auto bg-white">
              <div className="mb-2 border-b border-blue-100 pb-2">
                <label className="flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-blue-300"
                    checked={selectedAgentIds.length === agents.length}
                    onChange={() => {
                      if (selectedAgentIds.length === agents.length) {
                        setSelectedAgentIds([]);
                      } else {
                        setSelectedAgentIds(agents.map(a => a.id));
                      }
                    }}
                  />
                  <span className="ml-2 text-sm text-blue-900">Select All</span>
                </label>
              </div>
              {agents.map(agent => (
                <label key={agent.id} className="flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-blue-300"
                    checked={selectedAgentIds.includes(agent.id)}
                    onChange={() => handleAgentChange(agent.id)}
                  />
                  <span className="ml-2 text-sm text-blue-900">{agent.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-span-2 flex justify-end gap-2 pt-4">
          <button
            onClick={resetFilters}
            className="btn-secondary"
          >
            Reset
          </button>
          <button
            onClick={applyFilters}
            className="btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;