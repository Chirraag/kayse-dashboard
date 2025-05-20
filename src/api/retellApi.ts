import Retell from 'retell-sdk';
import type { FilterCriteria, ListCallsParams, RetellCall } from '../types/retell';

const PAGE_SIZE = 1000;
const TELEPHONY_COST_PER_MINUTE = 0.014;

let client: Retell;

export const initializeClient = (apiKey: string) => {
  client = new Retell({ apiKey });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAllCalls = async (filterCriteria?: FilterCriteria): Promise<RetellCall[]> => {
  if (!client) {
    throw new Error('Retell client not initialized. Please select a workspace first.');
  }

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
    if (!client) {
      throw new Error('Retell client not initialized. Please select a workspace first.');
    }

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
  console.log('Calculating summary stats for', calls.length, 'calls');
  
  const totalCalls = calls.length;
  
  // Calculate agent cost (sum of costs received by API for all calls)
  const agentCost = calls.reduce((sum, call) => 
    sum + ((call.call_cost?.combined_cost || 0) / 100), 0
  );
  
  // Calculate telephony cost with detailed logging
  const telephonyCost = calls.reduce((sum, call, index) => {
    const durationSeconds = call.duration_ms / 1000;
    const durationMinutes = durationSeconds / 60;
    
    let callTelephonyCost;
    if (durationSeconds === 0) {
      callTelephonyCost = TELEPHONY_COST_PER_MINUTE; // 0.014 for zero duration calls
      console.log(`Call ${index + 1}: Zero duration, telephony cost: ${callTelephonyCost}`);
    } else {
      const roundedMinutes = Math.ceil(durationMinutes);
      callTelephonyCost = roundedMinutes * TELEPHONY_COST_PER_MINUTE;
      console.log(`Call ${index + 1}: ${durationSeconds}s (${durationMinutes.toFixed(2)}min) -> ${roundedMinutes} rounded min, telephony cost: ${callTelephonyCost}`);
    }
    
    return sum + callTelephonyCost;
  }, 0);
  
  // Total cost is sum of agent cost + telephony cost
  const totalCost = agentCost + telephonyCost;
  
  // Total minutes (actual duration, not rounded)
  const totalMinutes = calls.reduce((sum, call) => 
    sum + ((call.call_cost?.total_duration_seconds || call.duration_ms / 1000) / 60), 0
  );

  const result = {
    totalCalls,
    totalMinutes: parseFloat(totalMinutes.toFixed(2)),
    agentCost: parseFloat(agentCost.toFixed(3)),
    telephonyCost: parseFloat(telephonyCost.toFixed(3)),
    totalCost: parseFloat(totalCost.toFixed(3))
  };
  
  console.log('Summary stats calculated:', result);
  return result;
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