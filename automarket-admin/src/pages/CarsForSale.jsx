import React from 'react';
import ListingTable from '../components/ListingTable';

const CarsForSale = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Cars Cars</h1>
        <p className="text-gray-400 mt-2">Manage your Cars car listings</p>
      </div>
      <ListingTable statusText="Cars For Sale" statusId={1} />
    </div>
  );
};

export default CarsForSale;
