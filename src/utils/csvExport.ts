import { RetellCall } from '../types/retell';

// Fixed values for cost calculations
const TWILIO_COST_PER_MINUTE = 0.145;

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const generateCSV = (calls: RetellCall[]): string => {
  // Define CSV headers
  const headers = [
    'Call ID', 
    'Agent ID', 
    'Start Date', 
    'Start Time', 
    'From Number',
    'To Number',
    'Duration (Seconds)', 
    'Duration (Minutes)', 
    'Status', 
    'Call Type',
    'Post Call Status',
    'AI Cost per Minute (without Twilio)',
    'AI Cost per Second',
    'AI Cost',
    'Twilio Cost per Minute',
    'Twilio Cost',
    'Total Cost'
  ].join(',');

  // Convert each call to a CSV row
  const rows = calls.map(call => {
    const date = new Date(call.start_timestamp);
    const startDate = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    const startTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Calculate duration values
    const durationSeconds = call.duration_ms / 1000;
    const durationMinutes = durationSeconds / 60;
    
    // Get Retell AI cost directly from the API (in dollars)
    const retellCostDollars = (call.call_cost?.combined_cost || 0) / 100;
    
    // Calculate AI cost per minute and per second
    const aiCostPerMinute = durationMinutes > 0 ? retellCostDollars / durationMinutes : 0;
    const aiCostPerSecond = durationSeconds > 0 ? retellCostDollars / durationSeconds : 0;
    
    // Calculate Twilio costs (ceiling rounding to full minutes)
    const billableMinutes = Math.ceil(durationMinutes);
    const twilioCost = billableMinutes * TWILIO_COST_PER_MINUTE;
    
    // Total cost is Retell AI cost + Twilio cost
    const totalCost = retellCostDollars + twilioCost;
    
    // Extract post-call-status from custom_analysis_data if it exists
    let postCallStatus = 'N/A';
    if (call.call_analysis?.custom_analysis_data) {
      postCallStatus = call.call_analysis.custom_analysis_data['post-call-status'] || 'N/A';
    }
    
    return [
      call.id.replace('call_', ''),
      call.agent_id,
      startDate,
      startTime,
      call.from_number || 'N/A',
      call.to_number || 'N/A',
      durationSeconds.toFixed(5),
      durationMinutes.toFixed(5),
      call.call_status,
      call.call_type,
      postCallStatus,
      aiCostPerMinute.toFixed(5),
      aiCostPerSecond.toFixed(5),
      retellCostDollars.toFixed(5),
      TWILIO_COST_PER_MINUTE.toFixed(5),
      twilioCost.toFixed(5),
      totalCost.toFixed(5)
    ].join(',');
  });

  // Combine headers and rows
  return [headers, ...rows].join('\n');
};

export const downloadCSV = (calls: RetellCall[]): void => {
  const csv = generateCSV(calls);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `retell-calls-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};