import { RetellCall, Agent } from "../types/retell";

// Fixed values for cost calculations
const COST_PER_MINUTE = 0.15;
const COST_FAILED_CALLS = 0.014;

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const generateCSV = (calls: RetellCall[], agents: Agent[]): string => {
  // Create agent lookup map for getting agent names
  const agentMap = new Map<string, string>();
  agents.forEach((agent) => {
    agentMap.set(agent.id, agent.name);
  });

  // Define CSV headers
  const headers = [
    "Start Date",
    "Start Time",
    "Case ID",
    "From Number",
    "To Number",
    "Post Call Status",
    "Agent Name",
    "Duration (Minutes)",
    "Cost per Minute",
    "Total Cost",
  ].join(",");

  // Convert each call to a CSV row
  const rows = calls.map((call) => {
    const date = new Date(call.start_timestamp);
    const startDate = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const startTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Calculate duration values
    const durationSeconds = call.duration_ms / 1000;
    const durationMinutes = durationSeconds / 60;

    // Convert 0 to 1 and round up all other durations
    const roundedMinutes =
      durationMinutes === 0 ? 1 : Math.ceil(durationMinutes);

    let totalCost = 0;
    if (durationMinutes === 0) {
      totalCost = COST_FAILED_CALLS;
    } else {
      totalCost = COST_PER_MINUTE * roundedMinutes;
    }

    // Extract post-call-status from custom_analysis_data if it exists
    let postCallStatus = "N/A";
    if (call.call_analysis?.custom_analysis_data) {
      postCallStatus =
        call.call_analysis.custom_analysis_data["post-call-status"] || "N/A";
    }

    // Get agent name from agent map
    const agentName = agentMap.get(call.agent_id) || call.agent_id;

    return [
      startDate,
      startTime,
      call.metadata?.case_id || "N/A",
      call.from_number || "N/A",
      call.to_number || "N/A",
      postCallStatus,
      agentName,
      roundedMinutes.toFixed(3),
      COST_PER_MINUTE.toFixed(2),
      totalCost.toFixed(3),
    ].join(",");
  });

  // Combine headers and rows
  return [headers, ...rows].join("\n");
};

export const downloadCSV = (
  calls: RetellCall[],
  agents: Agent[],
  workspaceName: string,
  startDate?: Date,
  endDate?: Date,
): void => {
  const csv = generateCSV(calls, agents);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const formattedWorkspace = workspaceName.toLowerCase().replace(/\s+/g, "_");
  const dateStr =
    startDate && endDate
      ? `_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}`
      : `_${new Date().toISOString().split("T")[0]}`;

  link.setAttribute("href", url);
  link.setAttribute("download", `${formattedWorkspace}${dateStr}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
