import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import FetchErrorText from "@app/components/FetchErrorText";
import { useGetUserOwnedPropertiesIDs } from "@app/hooks/account";
import { useGetProperties } from "@app/hooks/properties";
import { propertiesPageLink } from "@app/urls";
import {
  constructAddressString,
  costNumsToPresentableString,
} from "@app/utils/property";

const PropertyGrid: React.FC<{ propertyIDs: string[] }> = ({ propertyIDs }) => {
  if (propertyIDs === null) {
    propertyIDs = [];
  }
  const queries = useGetProperties(propertyIDs);

  const handleCopyId = (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault(); // Prevent navigation when clicking the copy button
    navigator.clipboard.writeText(propertyId);
    toast.success("Property ID copied to clipboard!");
  };

  if (queries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 italic mb-4">No properties found</div>
        <div className="text-sm text-gray-600">Create one to get started!</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {queries.map((query) => {
        if (query.data) {
          const property = query.data;
          const detailPage = `${propertiesPageLink}/${property.details.propertyId}`;
          const addressString = constructAddressString(property.details);
          const costString = costNumsToPresentableString(
            property.details.costDollars,
            property.details.costCents,
          );

          return (
            <Link
              key={property.details.propertyId}
              to={detailPage}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-100">
                {property.images[0] && (
                  <img
                    src={URL.createObjectURL(property.images[0].file)}
                    alt={addressString}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-100 transition-colors">
                    {costString}
                  </h3>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-4">
                <div className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {addressString}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {property.details.numBedrooms} Beds
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {property.details.numShowersBaths} Baths
                    </span>
                  </div>
                </div>

                {/* Copy ID Button */}
                <button
                  onClick={(e) => handleCopyId(e, property.details.propertyId)}
                  className="absolute bottom-4 right-4 p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors duration-200 group"
                  title="Copy Property ID"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 group-hover:text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
              </div>
            </Link>
          );
        }
        return null;
      })}
    </div>
  );
};

const UserOwnedPropertiesTable: React.FC = () => {
  const query = useGetUserOwnedPropertiesIDs();

  if (query.isFetching) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-4 animate-pulse"
          >
            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <FetchErrorText>
        Unable to fetch your properties at the moment.
      </FetchErrorText>
    );
  }

  const propertyIDs = query.data as string[];

  return (
    <div className="w-full">
      <PropertyGrid propertyIDs={propertyIDs} />
    </div>
  );
};

export default UserOwnedPropertiesTable;
