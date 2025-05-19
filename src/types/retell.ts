export interface RetellCall {
  id: string;
  agent_id: string;
  call_status: string;
  call_type: string;
  start_timestamp: number;
  duration_ms: number;
  disconnection_reason?: string;
  from_number: string;
  to_number: string;
  direction: string;
  latency?: {
    llm: LatencyMetrics;
    e2e: LatencyMetrics;
    tts: LatencyMetrics;
  };
  call_cost?: {
    combined_cost: number;
    total_duration_seconds: number;
    product_costs: {
      product: string;
      cost: number;
      unit_price: number;
    }[];
  };
  call_analysis?: {
    in_voicemail: boolean;
    call_summary?: string;
    user_sentiment?: string;
    call_successful: boolean;
    custom_analysis_data?: Record<string, unknown>;
  };
}

interface LatencyMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  num: number;
  values: number[];
}

export interface Agent {
  id: string;
  name: string;
}

export interface FilterCriteria {
  agent_id?: string[];
  version?: string[];
  call_status?: string[];
  in_voicemail?: boolean[];
  disconnection_reason?: string[];
  from_number?: string[];
  to_number?: string[];
  call_type?: string[];
  direction?: string[];
  user_sentiment?: string[];
  call_successful?: boolean[];
  start_timestamp?: {
    upper_threshold?: number;
    lower_threshold?: number;
  };
  duration_ms?: {
    upper_threshold?: number;
    lower_threshold?: number;
  };
  e2e_latency_p50?: {
    upper_threshold?: number;
    lower_threshold?: number;
  };
}

export interface ListCallsParams {
  filter_criteria?: FilterCriteria;
  sort_order?: 'ascending' | 'descending';
  limit?: number;
  pagination_key?: string;
}

export interface SummaryStats {
  totalCalls: number;
  totalMinutes: number;
  totalCost: number;
}