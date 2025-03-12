import React from "react";

import PropertyCard from "@app/components/properties/PropertyCard";
import { useGetProperties } from "@app/hooks/properties";
import { Property } from "@app/types/Types";

type PageOfPropertiesProps = {
  propertyIDs: string[];
};

const PageOfProperties: React.FC<PageOfPropertiesProps> = ({ propertyIDs }) => {
  const propertyQueries = useGetProperties(propertyIDs);
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
