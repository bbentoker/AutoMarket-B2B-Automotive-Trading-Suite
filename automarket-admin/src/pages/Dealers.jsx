import React from 'react';
import DealersTable from '../components/DealersTable';

const Dealers = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Dealers Management</h1>
        <p className="text-gray-400 mt-2">Manage and view all registered dealers</p>
      </div>
      <DealersTable />
    </div>
  );
};

export default Dealers;
