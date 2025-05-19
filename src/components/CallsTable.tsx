import React, { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { RetellCall } from '../types/retell';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface CallsTableProps {
  calls: RetellCall[];
  isLoading: boolean;
}

// Fixed values for cost calculations
const TWILIO_COST_PER_MINUTE = 0.145;

const CallsTable: React.FC<CallsTableProps> = ({ calls, isLoading }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'start_timestamp', desc: true }
  ]);

  const columnHelper = createColumnHelper<RetellCall>();

  const columns = [
    columnHelper.accessor('id', {
      header: 'Call ID',
      size: 200,
      cell: info => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('agent_id', {
      header: 'Agent ID',
      size: 200,
      cell: info => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('start_timestamp', {
      header: 'Start Date',
      size: 120,
      cell: info => formatDate(info.getValue()).split(' ')[0],
      sortingFn: 'datetime',
    }),
    columnHelper.accessor('start_timestamp', {
      id: 'start_time',
      header: 'Start Time',
      size: 120,
      cell: info => formatDate(info.getValue()).split(' ')[1],
      sortingFn: 'datetime',
    }),
    columnHelper.accessor('from_number', {
      header: 'From Number',
      size: 150,
      cell: info => info.getValue() || 'N/A',
    }),
    columnHelper.accessor('to_number', {
      header: 'To Number',
      size: 150,
      cell: info => info.getValue() || 'N/A',
    }),
    columnHelper.accessor(
      row => row.duration_ms / 1000,
      {
        id: 'duration_seconds',
        header: 'Duration (Seconds)',
        size: 150,
        cell: info => info.getValue().toFixed(5),
      }
    ),
    columnHelper.accessor(
      row => row.duration_ms / 1000 / 60,
      {
        id: 'duration_minutes',
        header: 'Duration (Minutes)',
        size: 150,
        cell: info => info.getValue().toFixed(5),
      }
    ),
    columnHelper.accessor('call_status', {
      header: 'Status',
      size: 120,
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('call_type', {
      header: 'Call Type',
      size: 120,
      cell: info => info.getValue(),
    }),
    columnHelper.accessor(
      row => {
        // Extract post-call-status from custom_analysis_data if it exists
        if (row.call_analysis?.custom_analysis_data) {
          return row.call_analysis.custom_analysis_data['post-call-status'] || 'N/A';
        }
        return 'N/A';
      },
      {
        id: 'post_call_status',
        header: 'Post Call Status',
        size: 150,
        cell: info => info.getValue(),
      }
    ),
    columnHelper.accessor(
      row => {
        // Get Retell AI cost directly from the API (convert from cents to dollars)
        const retellCostDollars = (row.call_cost?.combined_cost || 0) / 100;
        
        // Get duration in minutes (for per-minute calculation)
        const durationMinutes = row.duration_ms / 1000 / 60;
        
        // Calculate AI cost per minute
        return durationMinutes > 0 ? retellCostDollars / durationMinutes : 0;
      },
      {
        id: 'ai_cost_per_minute',
        header: 'AI Cost per Minute (without Twilio)',
        size: 240,
        cell: info => info.getValue().toFixed(5),
      }
    ),
    columnHelper.accessor(
      row => {
        // Get Retell AI cost from the API
        const retellCostDollars = (row.call_cost?.combined_cost || 0) / 100;
        
        // Get duration in minutes and seconds
        const durationMinutes = row.duration_ms / 1000 / 60;
        const durationSeconds = row.duration_ms / 1000;
        
        // Calculate AI cost per second
        return durationSeconds > 0 ? retellCostDollars / durationSeconds : 0;
      },
      {
        id: 'ai_cost_per_second',
        header: 'AI Cost per Second',
        size: 150,
        cell: info => info.getValue().toFixed(5),
      }
    ),
    columnHelper.accessor(
      row => {
        // Get Retell AI cost directly from the API (in dollars)
        return (row.call_cost?.combined_cost || 0) / 100;
      },
      {
        id: 'ai_cost',
        header: 'AI Cost',
        size: 120,
        cell: info => info.getValue().toFixed(5),
      }
    ),
    columnHelper.accessor(
      row => TWILIO_COST_PER_MINUTE,
      {
        id: 'twilio_cost_per_minute',
        header: 'Twilio Cost per Minute',
        size: 180,
        cell: info => info.getValue().toFixed(5),
      }
    ),
    columnHelper.accessor(
      row => {
        const durationMinutes = row.duration_ms / 1000 / 60;
        // Twilio bills by rounding up to the next full minute
        const billableMinutes = Math.ceil(durationMinutes);
        return billableMinutes * TWILIO_COST_PER_MINUTE;
      },
      {
        id: 'twilio_cost',
        header: 'Twilio Cost',
        size: 120,
        cell: info => info.getValue().toFixed(5),
      }
    ),
    columnHelper.accessor(
      row => {
        // Get Retell AI cost directly from the API (convert from cents to dollars)
        const retellCostDollars = (row.call_cost?.combined_cost || 0) / 100;
        
        // Calculate Twilio cost (rounding up to next full minute)
        const durationMinutes = row.duration_ms / 1000 / 60;
        const billableMinutes = Math.ceil(durationMinutes);
        const twilioCost = billableMinutes * TWILIO_COST_PER_MINUTE;
        
        // Total cost is Retell AI cost + Twilio cost
        return retellCostDollars + twilioCost;
      },
      {
        id: 'total_cost',
        header: 'Total Cost',
        size: 120,
        cell: info => info.getValue().toFixed(5),
      }
    ),
  ];

  const table = useReactTable<RetellCall>({
    data: calls,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Helper functions
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    scope="col"
                    style={{ width: header.column.columnDef.size }}
                    className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider cursor-pointer bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span>
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 opacity-30" />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  No calls found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TableSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-10 bg-gray-200 mb-1"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 mb-1"></div>
      ))}
    </div>
  );
};

export default CallsTable;