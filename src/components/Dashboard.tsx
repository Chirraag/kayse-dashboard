import React, { useEffect, useState } from 'react';
import { fetchAgents, fetchAllCalls, calculateSummaryStats, createDateFilter, initializeClient } from '../api/retellApi';
import { downloadCSV } from '../utils/csvExport';
import SummaryStats from './SummaryStats';
import FilterPanel from './FilterPanel';
import CallsTable from './CallsTable';
import Pagination from './Pagination';
import WorkspaceSelector from './WorkspaceSelector';
import { useWorkspace } from '../context/WorkspaceContext';
import { FilterCriteria, RetellCall, Agent } from '../types/retell';

const Dashboard: React.FC = () => {
  const { selectedWorkspace } = useWorkspace();
  const [calls, setCalls] = useState<RetellCall[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterCriteria>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      start_timestamp: {
        lower_threshold: today.getTime(),
        upper_threshold: tomorrow.getTime()
      }
    };
  });
  const [stats, setStats] = useState<SummaryStats>({
    totalCalls: 0,
    totalMinutes: 0,
    agentCost: 0,
    telephonyCost: 0,
    totalCost: 0,
  });
  const [isDataReady, setIsDataReady] = useState(false);
  const [filteredCalls, setFilteredCalls] = useState<RetellCall[]>([]);
  const [displayCalls, setDisplayCalls] = useState<RetellCall[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (!selectedWorkspace) return;
        
        setIsLoading(true);
        initializeClient(selectedWorkspace.apiKey);
        
        // Fetch agents
        const agentsData = await fetchAgents();
        setAgents(agentsData);
        
        // Fetch initial calls
        await loadCalls();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [selectedWorkspace]);

  useEffect(() => {
    // Update summary stats whenever filtered calls change
    const newStats = calculateSummaryStats(filteredCalls);
    setStats(newStats);
    
    // Update displayed calls based on current page
    const start = currentPage * ITEMS_PER_PAGE;
    setDisplayCalls(filteredCalls.slice(start, start + ITEMS_PER_PAGE));
  }, [filteredCalls, currentPage]);

  const loadCalls = async (newFilters?: FilterCriteria) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const appliedFilters = newFilters !== undefined ? newFilters : filters;
      console.log('Loading all calls with filters:', JSON.stringify(appliedFilters, null, 2));
      
      // Fetch all calls with applied filters
      const allCallsData = await fetchAllCalls(appliedFilters);
      
      setCurrentPage(0);
      
      // Update stats with all filtered data
      const newStats = calculateSummaryStats(allCallsData);
      setStats(newStats);
      
      // Set initial page of data
      setFilteredCalls(allCallsData);
      setDisplayCalls(allCallsData.slice(0, ITEMS_PER_PAGE));
      
      console.log('Fetched all calls:', allCallsData.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterCriteria) => {
    console.log('Filter change requested:', JSON.stringify(newFilters, null, 2));
    setFilters(newFilters);
    loadCalls(newFilters);
  };

  const handleExport = () => {
    const startDate = filters.start_timestamp?.lower_threshold
      ? new Date(filters.start_timestamp.lower_threshold)
      : undefined;
    const endDate = filters.start_timestamp?.upper_threshold
      ? new Date(filters.start_timestamp.upper_threshold)
      : undefined;
    
    if (selectedWorkspace) {
      downloadCSV(filteredCalls, agents, selectedWorkspace.name, startDate, endDate);
    }
  };

  const handleRefresh = () => {
    loadCalls(filters);
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(filteredCalls.length / ITEMS_PER_PAGE) - 1;
    setCurrentPage(prev => Math.min(prev + 1, maxPage));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen">
      {selectedWorkspace ? (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-blue-50/30">
          <div className="mb-8">
            <WorkspaceSelector />
          </div>
          
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-center text-blue-900 tracking-tight">AI Agents Call Dashboard</h1>
            <p className="text-blue-600 mt-3 text-lg text-center">
              Monitor and analyze your AI agent conversations
            </p>
          </header>
          
          <SummaryStats stats={stats} isLoading={isLoading} />
          
          <FilterPanel
            agents={agents}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {!isLoading ? (
            <div className="space-y-6">
              <CallsTable calls={displayCalls} isLoading={isLoading} />
              
              <Pagination
                hasMore={currentPage < Math.ceil(filteredCalls.length / ITEMS_PER_PAGE) - 1}
                isLoading={isLoading}
                onLoadMore={handleNextPage}
                onLoadPrevious={handlePreviousPage}
                hasPrevious={currentPage > 0}
                currentPage={currentPage + 1}
                totalPages={Math.ceil(filteredCalls.length / ITEMS_PER_PAGE)}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-200 border-t-blue-600"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen bg-blue-50/30 flex items-center justify-center p-4">
          <WorkspaceSelector />
        </div>
      )}
    </div>
  );
};

export default Dashboard;