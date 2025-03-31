import React from "react";
import { useParams } from "react-router-dom";

import PropertyDetailContent from "@app/components/properties/PropertyDetailContent";
import PropertyError from "@app/components/properties/PropertyError";
import CardSkeleton from "@app/components/skeleton/CardSkeleton";
import { useGetProperty } from "@app/hooks/properties";

const PropertyDetailPage: React.FC = () => {
  const { propertyID } = useParams<{ propertyID: string }>();
  const propertyIDStr: string = propertyID as string;

  const { data, status, refetch } = useGetProperty(propertyIDStr);

  return (
    <div className="animate-fade-in">
      {status === "pending" && (
        <div className="animate-fade-in">
          <CardSkeleton />
        </div>
      )}

      {status === "error" && (
        <div className="animate-fade-in">
          <PropertyError onRetry={refetch} />
        </div>
      )}

      {status === "success" && data && (
        <div className="animate-fade-in">
          <PropertyDetailContent property={data} />
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
