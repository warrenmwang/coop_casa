import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import CustomImageGallery from "../structure/CustomImageGallery";
import { apiGetProperty } from "../../api/api";
import { propertiesPageLink } from "../../urls";
import { Property } from "../structure/CreatePropertyForm";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import { useQuery } from "@tanstack/react-query";
import CardSkeleton from "../structure/CardSkeleton";

type PropertyDetailContentProps = {
  property: Property;
};

const PropertyDetailContent: React.FC<PropertyDetailContentProps> = ({
  property,
}) => {
  const navigate = useNavigate();
  const images = property.images.split("#");
  const imageData = images.map((image) => ({
    img: image,
    title: "default title",
    rows: 2,
    cols: 4,
  }));

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

  const handleReturn = () => {
    navigate(propertiesPageLink);
  };

  return (
    <Box className="bg-white p-4 shadow-lg rounded-lg mx-auto w-11/12 md:w-3/5 lg:w-1/2 z-50">
      <div className="flex">
        <button
          className="block m-3 p-3 bg-gray-500 hover:bg-gray-400 text-white rounded"
          onClick={handleReturn}
        >
          Browse Properties
        </button>
      </div>
      <CustomImageGallery imageData={imageData} />
      <div id="transition-modal-title">
        <div className="text-3xl font-bold">{costString}</div>
        <div className="text-2xl">{addressString}</div>
        {basicInfoElement}
      </div>
      <div id="transition-modal-description">
        <div className="text-xl underline">Misc. Lister Comments</div>
        <div className="text-lg">{property.miscNote}</div>
        <div className="text-md">Property ID: {property.propertyId}</div>
      </div>
    </Box>
  );
};

const PropertyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { propertyID } = useParams<{ propertyID: string }>();

  if (propertyID === undefined) {
    navigate(propertiesPageLink);
  }
  const propertyIDStr = propertyID as string;

  const {
    status,
    error,
    data: property,
  } = useQuery({
    queryKey: ["properties", propertyIDStr],
    queryFn: () => apiGetProperty(propertyIDStr),
  });

  return (
    <>
      <TopNavbar />
      {status === "pending" && (
        <div className="flex justify-center">
          {" "}
          <CardSkeleton />
        </div>
      )}
      {status === "success" && (
        <PropertyDetailContent
          property={property as Property}
        ></PropertyDetailContent>
      )}
      {status === "error" && (
        <h1 className="text-xl text-red-600 font-bold flex justify-center">
          Sorry, we are unable to find that particular property. Server returned
          with error: {JSON.stringify(error)}
        </h1>
      )}
      <Footer />
    </>
  );
};

export default PropertyDetail;
