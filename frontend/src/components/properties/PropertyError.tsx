import React from "react";
import { useNavigate } from "react-router-dom";

import { propertiesPageLink } from "@app/urls";

interface PropertyErrorProps {
  onRetry?: () => void;
}

const PropertyError: React.FC<PropertyErrorProps> = ({ onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="space-y-6">
        <div className="text-4xl font-bold text-gray-900">
          Property Not Found
        </div>
        <div className="text-lg text-gray-600 max-w-2xl mx-auto">
          We couldn&apos;t find the property you&apos;re looking for. It might
          have been removed or the link might be incorrect.
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(propertiesPageLink)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Browse Properties
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyError;
