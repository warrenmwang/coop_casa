import React from "react";
import { useQueries } from "@tanstack/react-query";
import { apiGetCommunity } from "../api/community";
import { Community } from "../types/Types";
import CommunityCard from "./CommunityCard";

type PageOfCommunitiesProps = {
  communityIDs: string[];
};

// TODO: is communityIDs array being reconstructed?
// if so, memo's shallow copy will consider a new array of the same IDs
// to be different and will re-render.
const PageOfCommunities: React.FC<PageOfCommunitiesProps> = ({
  communityIDs,
}) => {
  const propertyQueries = useQueries({
    queries: communityIDs.map((communityID) => {
      return {
        queryKey: ["communities", communityID],
        queryFn: () => apiGetCommunity(communityID),
      };
    }),
  });

  const properties = propertyQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    });

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {properties.map((value: Community | undefined) => {
          if (value) {
            return (
              <CommunityCard
                key={value.details.communityId}
                community={value}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default React.memo(PageOfCommunities);
