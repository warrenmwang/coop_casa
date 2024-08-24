import React from "react";
import { useParams } from "react-router-dom";
import { apiGetProperty } from "../api/property";
import { Property } from "../types/Types";
import { useQuery } from "@tanstack/react-query";
import CardSkeleton from "../skeleton/CardSkeleton";
import FetchErrorText from "../components/FetchErrorText";
import PropertyDetailContent from "../components/PropertyDetailContent";

const PropertyDetailPage: React.FC = () => {
  const { propertyID } = useParams<{ propertyID: string }>();

  const propertyIDStr: string = propertyID as string;

  const propertyQuery = useQuery({
    queryKey: ["properties", propertyIDStr],
    queryFn: () => apiGetProperty(propertyIDStr),
  });

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
