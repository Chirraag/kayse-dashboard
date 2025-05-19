import Retell from 'retell-sdk';
import type { FilterCriteria, ListCallsParams, RetellCall } from '../types/retell';

const PAGE_SIZE = 1000;

const client = new Retell({
  apiKey: 'key_d9516157342e35441ad9a1255d68',
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAllCalls = async (filterCriteria?: FilterCriteria): Promise<RetellCall[]> => {
  let allCalls: RetellCall[] = [];
  let lastCallId: string | undefined;
  let hasMore = true;

  try {
    while (hasMore) {
      const params: ListCallsParams = {
        filter_criteria: filterCriteria,
        sort_order: 'descending',
        limit: PAGE_SIZE,
        pagination_key: lastCallId,
      };

      console.log('Fetching calls page with params:', JSON.stringify(params, null, 2));
      const response = await client.call.list(params);

      if (!response || !Array.isArray(response)) {
        console.error('Invalid response format:', response);
        break;
      }

      const mappedCalls = response.map(call => ({
        ...call,
        id: call.call_id,
        call_status: call.call_status || 'unknown',
        agent_id: call.agent_id || 'unknown',
        start_timestamp: call.start_timestamp || 0,
        duration_ms: call.duration_ms || 0,
        from_number: call.from_number || '',
        to_number: call.to_number || '',
        direction: call.direction || 'unknown',
        call_type: call.call_type || 'unknown',
        call_analysis: {
          ...call.call_analysis,
          call_successful: call.call_analysis?.call_successful ?? false,
          user_sentiment: call.call_analysis?.user_sentiment || 'unknown',
          call_summary: call.call_analysis?.call_summary || ''
        }
      }));

      allCalls = [...allCalls, ...mappedCalls];
      
      // Check if we should continue fetching
      if (response.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        // Add a 1-second delay between requests to avoid rate limiting
        await sleep(1000);
        lastCallId = response[response.length - 1].call_id;
      }
    }

    return allCalls;
  } catch (error) {
    console.error('Error fetching calls:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const fetchAgents = async (): Promise<{ id: string; name: string }[]> => {
  try {
    console.log('Fetching agents...');
    const response = await client.agent.list();
    console.log('Raw agents response:', JSON.stringify(response, null, 2));
    
    if (!Array.isArray(response)) {
      console.error('Invalid agents response format:', response);
      return [];
    }
    
    return response.map(agent => ({
      id: agent.agent_id || 'unknown',
      name: agent.agent_name || agent.name || `Agent ${(agent.agent_id || '').substring(0, 8)}`,
    }));
  } catch (error) {
    console.error('Error fetching agents:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message === '429' ? 'Rate limit exceeded. Please try again later.' : error.message,
      stack: error.stack
    });
    return [];
  }
};

export const calculateSummaryStats = (calls: RetellCall[]) => {
  const totalCalls = calls.length;
  const totalMinutes = calls.reduce((sum, call) => 
    sum + ((call.call_cost?.total_duration_seconds || 0) / 60), 0
  );
  const totalCostCents = calls.reduce((sum, call) => 
    sum + ((call.call_cost?.combined_cost || 0)), 0
  );

  return {
    totalCalls,
    totalMinutes: parseFloat(totalMinutes.toFixed(2)),
    totalCost: parseFloat((totalCostCents / 100).toFixed(2))
  };
};

export const createDateFilter = (startDate?: Date, endDate?: Date): FilterCriteria['start_timestamp'] => {
  if (!startDate && !endDate) return undefined;

  const filter = {
    lower_threshold: startDate ? startDate.getTime() : undefined,
    upper_threshold: endDate ? endDate.getTime() : undefined,
  };
  console.log('Created date filter:', filter);
  return filter;
};