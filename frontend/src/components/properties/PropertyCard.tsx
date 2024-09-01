import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Property } from "../../types/Types";
import { Card, CardContent, CardMedia } from "@mui/material";
import { propertiesPageLink } from "../../urls";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const propertyDetailPage = `${propertiesPageLink}/${property.details.propertyId}`;
  const cardImage: string = useMemo(
    () => URL.createObjectURL(property.images[0].file),
    [property.images],
  );

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

  const basicInfoConstructor = (property: Property) => {
    return (
      <div className="flex">
        <div className="font-bold mx-1">{property.details.numBedrooms}</div>
        <div> beds | </div>
        <div className="font-bold mx-1">{property.details.numShowersBaths}</div>
        <div> ba | </div>
        <div className="font-bold mx-1">{property.details.numToilets}</div>
        <div> toil | </div>
        <div className="font-bold mx-1">{property.details.squareFeet}</div>
        <div> sqft </div>
      </div>
    );
  };

  const costString = costNumsToPresentableString(
    property.details.costDollars,
    property.details.costCents,
  );
  const addressString =
    property.details.address2 === ""
      ? `${property.details.address1}, ${property.details.city}, ${property.details.state} ${property.details.zipcode}, ${property.details.country}`
      : `${property.details.address1}, ${property.details.address2}, ${property.details.city}, ${property.details.state} ${property.details.zipcode}, ${property.details.country}`;

  const basicInfoElement = basicInfoConstructor(property);

  return (
    <>
      <Link to={propertyDetailPage}>
        <Card sx={{ maxWidth: 400, maxHeight: 600 }}>
          <CardMedia
            sx={{ width: 400, height: 300 }}
            image={cardImage}
            title="default first image"
          />
          <CardContent>
            <div className="text-3xl font-bold">{costString}</div>
            <div className="text-2xl">{addressString}</div>
            {basicInfoElement}
          </CardContent>
        </Card>
      </Link>
    </>
  );
};

// Export memoized version, since PropertyCard is pure.
export default React.memo(PropertyCard);
