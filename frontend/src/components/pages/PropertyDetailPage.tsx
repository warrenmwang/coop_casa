import React from "react";
import { useParams } from "react-router-dom";
import { Property } from "../types/Types";
import CardSkeleton from "components/skeleton/CardSkeleton";
import FetchErrorText from "components/FetchErrorText";
import PropertyDetailContent from "components/properties/PropertyDetailContent";
import { useGetProperty } from "hooks/properties";

const PropertyDetailPage: React.FC = () => {
  const { propertyID } = useParams<{ propertyID: string }>();
  const propertyIDStr: string = propertyID as string;

  const propertyQuery = useGetProperty(propertyIDStr);

  return (
    <>
      {propertyQuery.status === "pending" && (
        <div className="flex justify-center">
          {" "}
          <CardSkeleton />
        </div>
      )}
      {propertyQuery.status === "success" && (
        <PropertyDetailContent
          property={propertyQuery.data as Property}
        ></PropertyDetailContent>
      )}
      {propertyQuery.status === "error" && (
        <FetchErrorText>
          Sorry, we are unable to find that particular property.
        </FetchErrorText>
      )}
    </>
  );
};

export default PropertyDetailPage;
