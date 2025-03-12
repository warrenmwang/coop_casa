import React from "react";
import { Link } from "react-router-dom";

import Card from "@app/components/Card";
import { Property } from "@app/types/Types";
import { propertiesPageLink } from "@app/urls";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const propertyDetailPage = `${propertiesPageLink}/${property.details.propertyId}`;

  const costNumsToPresentableString = (
    costDollars: number,
    costCents: number,
  ) => {
    const start = `${costDollars}`;
    let res = "";
    let count = 0;
    for (let i = start.length - 1; i >= 0; i--) {
      count++;
      if (count === 4) {
        res = `${start[i]},${res}`;
        count = 1;
      } else {
        res = `${start[i]}${res}`;
      }
    }
    return "$" + res + "." + String(costCents).padStart(2, "0");
  };

  const costString = costNumsToPresentableString(
    property.details.costDollars,
    property.details.costCents,
  );

  const addressString =
    property.details.address2 === ""
      ? `${property.details.address1}, ${property.details.city}, ${property.details.state} ${property.details.zipcode}, ${property.details.country}`
      : `${property.details.address1}, ${property.details.address2}, ${property.details.city}, ${property.details.state} ${property.details.zipcode}, ${property.details.country}`;

  const description = (
    <div className="space-y-3">
      <div>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
          {costString}
        </p>
        <p className="mt-1 text-gray-600 line-clamp-1">{addressString}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-600">
        <div className="flex items-center">
          <span className="text-lg font-semibold">
            {property.details.numBedrooms}
          </span>
          <span className="ml-1.5">beds</span>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-semibold">
            {property.details.numShowersBaths}
          </span>
          <span className="ml-1.5">ba</span>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-semibold">
            {property.details.numToilets}
          </span>
          <span className="ml-1.5">toil</span>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-semibold">
            {property.details.squareFeet}
          </span>
          <span className="ml-1.5">sqft</span>
        </div>
      </div>
    </div>
  );

  return (
    <Link
      to={propertyDetailPage}
      className="block transition-transform hover:scale-102 duration-200"
    >
      <Card
        title=""
        imageUrl={property.images[0].file}
        description={description}
        imageSize="lg"
      />
    </Link>
  );
};

export default React.memo(PropertyCard);
