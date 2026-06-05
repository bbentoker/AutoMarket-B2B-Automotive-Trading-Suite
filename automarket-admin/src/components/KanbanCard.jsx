import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const KanbanCard = ({ id, listing, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatPrice = (price) => {
    if (!price) return 'Price N/A';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'Price N/A';

    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatKilometers = (km) => {
    if (!km) return 'N/A';
    return new Intl.NumberFormat('sv-SE').format(km) + ' km';
  };

  const cardInnerContent = (
    <>
      {/* Registration Number Badge */}
      <div className="mb-3">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {listing.registration_number || 'No Registration'}
        </span>
      </div>

      {/* Brand + Model */}
      <div className="mb-3">
        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">
          {`${listing.brand_name || ''} ${listing.model || ''}`.trim() || 'Unknown Vehicle'}
        </h4>
      </div>

      {/* Price */}
      <div className="mb-3">
        <span className="text-lg font-bold text-green-600">
          {formatPrice(listing.listing_price)}
        </span>
      </div>

      {/* Vehicle Details */}
      <div className="text-xs text-gray-600 space-y-1 mb-3">
        {listing.first_registration && (
          <div className="flex justify-between">
            <span>Year:</span>
            <span className="font-medium">
              {new Date(listing.first_registration).getFullYear()}
            </span>
          </div>
        )}
        {listing.km_stand && (
          <div className="flex justify-between">
            <span>Mileage:</span>
            <span className="font-medium">{formatKilometers(listing.km_stand)}</span>
          </div>
        )}
        {listing.fuel_type && (
          <div className="flex justify-between">
            <span>Fuel:</span>
            <span className="font-medium">{listing.fuel_type}</span>
          </div>
        )}
        {listing.color && (
          <div className="flex justify-between">
            <span>Color:</span>
            <span className="font-medium">{listing.color}</span>
          </div>
        )}
        {listing.horsepower && (
          <div className="flex justify-between">
            <span>Power:</span>
            <span className="font-medium">{listing.horsepower}</span>
          </div>
        )}
      </div>

      {/* Listing Meta */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span>ID: {listing.id}</span>
        <span>{formatDate(listing.created_at)}</span>
      </div>

      {/* Internal URL indicator */}
      {listing.internal_url && (
        <div className="mt-2 text-xs">
          <a
            href={listing.internal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 cursor-pointer inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            🔗 Source Link
          </a>
        </div>
      )}
    </>
  );

  // Style for drag overlay
  if (isDragging) {
    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-400 p-4 cursor-grabbing">
        {cardInnerContent}
      </div>
    );
  }
  // Don't render the card if it's being dragged (will be shown in DragOverlay)
  if (isSortableDragging) {
    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-400 p-4 cursor-grabbing">
        {cardInnerContent}
      </div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-grab hover:shadow-md transition-shadow duration-200 active:cursor-grabbing"
    >
      {cardInnerContent}
    </div>
  );
};

export default KanbanCard;
