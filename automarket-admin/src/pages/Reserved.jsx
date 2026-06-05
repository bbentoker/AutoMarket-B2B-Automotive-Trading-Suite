import React from 'react';
import ListingTable from '../components/ListingTable';

const Reserved = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Reserved Cars</h1>
        <p className="text-gray-400 mt-2">Manage your reserved car listings</p>
      </div>
      <ListingTable statusText="Reserved" statusId={2} showReserver={true} />
    </div>
  );
};

export default Reserved;
