
import React from 'react';
import { ApplyLeaveForm } from '@/components/forms/ApplyLeaveForm';

const ApplyLeavePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-corporate-black mb-2">
            Apply for Leave
          </h1>
          <p className="text-gray-600">
            Submit your leave application for approval. Make sure to plan ahead and provide all necessary details.
          </p>
        </div>
        
        <ApplyLeaveForm />
      </div>
    </div>
  );
};

export default ApplyLeavePage;
