import React from "react";
import { propertiesPageLink } from "../urls";
import { Box } from "@mui/material";
import CustomImageGallery, {
  ImageGalleryItemsInput,
} from "../components/CustomImageGallery";
import ShareLinkButton from "./buttons/ShareLinkButton";
import ListerInfo from "../components/ListerInfo";
import { Property } from "../types/Types";
import { useNavigate } from "react-router-dom";

type PropertyDetailContentProps = {
  property: Property;
};

const PropertyDetailContent: React.FC<PropertyDetailContentProps> = ({
  property,
}) => {
  const navigate = useNavigate();
  const images = property.images.map((image) =>
    URL.createObjectURL(image.file),
  );
  const imageData: ImageGalleryItemsInput[] = images.map((image) => ({
    img: image,
    title: "default title",
    rows: 2,
    cols: 4,
  }));

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

  const basicInfoElement: JSX.Element = basicInfoConstructor(property);

  return (
    <Box className="bg-white p-4 shadow-lg rounded-lg mx-auto w-11/12 md:w-3/5 lg:w-1/2 z-50">
      {/* Top row of buttons */}
      <div className="flex">
        <button
          className="block m-3 p-3 bg-gray-500 hover:bg-gray-400 text-white rounded"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <button
          className="block m-3 p-3 bg-gray-500 hover:bg-gray-400 text-white rounded"
          onClick={() => navigate(propertiesPageLink)}
        >
          Browse Properties
        </button>
        <ShareLinkButton />
      </div>
      {/* Images */}
      <CustomImageGallery imageData={imageData} />
      {/* Cost, Address, core property details */}
      <div id="transition-modal-title">
        <div className="text-3xl font-bold">{costString}</div>
        <div className="text-2xl">{addressString}</div>
        {basicInfoElement}
      </div>
      {/* Lister given name and description of listing */}
      <div id="transition-modal-description">
        <div className="text-xl font-bold pt-2">Property Description</div>
        <div className="flex gap-2">
          <div className="text-lg">Property Name: </div>
          <div className="text-lg">{property.details.name}</div>
        </div>
        <div className="flex gap-2">
          <div className="text-lg">Description: </div>
          <div className="text-lg">{property.details.description}</div>
        </div>
        {/* Lister name and contact information */}
        <ListerInfo listerID={property.details.listerUserId} />
        <div className="text-lg">Miscellaneous Lister Comments: </div>
        <div className="text-lg">{property.details.miscNote}</div>
        <div className="text-sm pt-5">
          Property ID: {property.details.propertyId}
        </div>
      </div>
    </Box>
  );
};

export default PropertyDetailContent;
