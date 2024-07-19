import React from "react";
import { Link } from "react-router-dom";
import { Property } from "../types/Types";
import { Card, CardContent, CardMedia } from "@mui/material";
import { propertiesPageLink } from "../urls";

interface PropertyCardProps {
  property: Property;
  openOnLoad?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const propertyDetailPage = `${propertiesPageLink}/${property.details.propertyId}`;
  let cardImage = URL.createObjectURL(property.images[0].file);

  const costNumsToPresentableString = (
    costDollars: number,
    costCents: number,
  ) => {
    var start = `${costDollars}`;
    var res = "";
    var count = 0;
    for (var i = start.length - 1; i >= 0; i--) {
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

  // console.log(property.details.propertyId);
  // console.log("PropertyCard");

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

// only use memo if certain PropertyCard is pure!
// (only re-render this comp if the props change.)
export default React.memo(PropertyCard);
// export default PropertyCard;
