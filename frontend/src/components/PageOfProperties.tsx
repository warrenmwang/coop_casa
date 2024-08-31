import React from "react";
import PropertyCard from "./PropertyCard";

import { Property } from "../types/Types";
import { useGetPropertiesInfo } from "../hooks/properties";

type PageOfPropertiesProps = {
  propertyIDs: string[];
};

// TODO: is propertyIDs array being reconstructed?
// if so, memo's shallow copy will consider a new array of the same IDs
// to be different and will re-render.
const PageOfProperties: React.FC<PageOfPropertiesProps> = ({ propertyIDs }) => {
  const propertyQueries = useGetPropertiesInfo(propertyIDs);
  const properties = propertyQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    });

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {properties.map((value: Property | undefined) => {
          if (value) {
            return (
              <PropertyCard key={value.details.propertyId} property={value} />
            );
          }
        })}
      </div>
    </div>
  );
};

export default React.memo(PageOfProperties);
