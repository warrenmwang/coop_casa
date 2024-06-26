import React from "react";
import { useNavigate } from "react-router-dom";
import { Property } from "./CreatePropertyForm";
import { Card, CardActionArea, CardContent, CardMedia } from "@mui/material";
import { propertiesPageLink } from "../../urls";

interface PropertyCardProps {
  property: Property;
  openOnLoad?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`${propertiesPageLink}/${property.propertyId}`);
  };

  const images = property.images.split("#");

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
        <div className="font-bold mx-1">{property.numBedrooms}</div>
        <div> beds | </div>
        <div className="font-bold mx-1">{property.numShowersBaths}</div>
        <div> ba | </div>
        <div className="font-bold mx-1">{property.numToilets}</div>
        <div> toil | </div>
        <div className="font-bold mx-1">{property.squareFeet}</div>
        <div> sqft </div>
      </div>
    );
  };

  const costString = costNumsToPresentableString(
    property.costDollars,
    property.costCents,
  );
  const addressString =
    property.address2 === ""
      ? `${property.address1}, ${property.city}, ${property.state} ${property.zipcode}, ${property.country}`
      : `${property.address1}, ${property.address2}, ${property.city}, ${property.state} ${property.zipcode}, ${property.country}`;

  const basicInfoElement = basicInfoConstructor(property);

  return (
    <>
      <CardActionArea
        onClick={handleCardClick}
        sx={{ maxWidth: 400, maxHeight: 600 }}
      >
        <Card sx={{ maxWidth: 400, maxHeight: 600 }}>
          <CardMedia
            sx={{ width: 400, height: 300 }}
            image={images[0]}
            title="default first image"
          />
          <CardContent>
            <div className="text-3xl font-bold">{costString}</div>
            <div className="text-2xl">{addressString}</div>
            {basicInfoElement}
          </CardContent>
        </Card>
      </CardActionArea>
    </>
  );
};

export default PropertyCard;
