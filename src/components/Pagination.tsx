import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onLoadPrevious: () => void;
  hasPrevious: boolean;
  currentPage: number;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({
  hasMore,
  isLoading,
  onLoadMore,
  onLoadPrevious,
  hasPrevious,
  currentPage,
  totalPages,
}) => {
  return (
    <div className="flex justify-between items-center py-4">
      <button
        onClick={onLoadPrevious}
        disabled={!hasPrevious || isLoading}
        className={hasPrevious && !isLoading ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </button>
      
      <div className="text-sm text-gray-600 font-medium">
        {isLoading ? 'Loading...' : `Page ${currentPage} of ${totalPages}`}
      </div>
      
      <button
        onClick={onLoadMore}
        disabled={!hasMore || isLoading}
        className={hasMore && !isLoading ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
};

export default Pagination;