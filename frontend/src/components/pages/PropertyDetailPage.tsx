import React from "react";
import { useParams } from "react-router-dom";
import CardSkeleton from "@app/components/skeleton/CardSkeleton";
import FetchErrorText from "@app/components/FetchErrorText";
import PropertyDetailContent from "@app/components/properties/PropertyDetailContent";
import { useGetProperty } from "@app/hooks/properties";

const PropertyDetailPage: React.FC = () => {
  const { propertyID } = useParams<{ propertyID: string }>();
  const propertyIDStr: string = propertyID as string;

  const { data, status } = useGetProperty(propertyIDStr);

  if (status === "pending") {
    return <CardSkeleton />;
  }

  if (status === "error") {
    return (
      <FetchErrorText>
        Sorry, we are unable to find that particular property.
      </FetchErrorText>
    );
  }

  return <PropertyDetailContent property={data}></PropertyDetailContent>;
};

export default PropertyDetailPage;
