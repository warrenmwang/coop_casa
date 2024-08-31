import React from "react";
import { Community } from "../types/Types";
import CommunityCard from "./CommunityCard";
import { useGetCommunities } from "../hooks/communities";

type PageOfCommunitiesProps = {
  communityIDs: string[];
};

// TODO: is communityIDs array being reconstructed?
// if so, memo's shallow copy will consider a new array of the same IDs
// to be different and will re-render.
const PageOfCommunities: React.FC<PageOfCommunitiesProps> = ({
  communityIDs,
}) => {
  const communityQueries = useGetCommunities(communityIDs);

  const communities = communityQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    });

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {communities.map((value: Community | undefined) => {
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
