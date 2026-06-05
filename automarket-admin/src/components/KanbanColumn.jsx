import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ status, listings, loading }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status.id}`,
  });

  const cardIds = listings.map((_, index) => `${status.id}-${index}`);

  return (
    <div
      className={`bg-gray-50 rounded-lg p-4 min-w-80 w-80 h-[calc(100vh-120px)] flex flex-col transition-colors duration-200 ${
        isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
      }`}
    >
      {/* Column Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-lg">{status.name}</h3>
          <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
            {listings.length}
          </span>
        </div>
        {status.description && <p className="text-gray-600 text-sm mt-1">{status.description}</p>}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Cards Container */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-3">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {listings.map((listing, index) => (
            <KanbanCard
              key={`${status.id}-${index}`}
              id={`${status.id}-${index}`}
              listing={listing}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm text-center">
              {isOver ? 'Drop here to add to this status' : 'No listings in this status'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
