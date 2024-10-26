import React from "react";
import { Community } from "@app/types/Types";
import CommunityCard from "@app/components/communities/CommunityCard";
import { useGetCommunities } from "@app/hooks/communities";

type PageOfCommunitiesProps = {
  communityIDs: string[];
};

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
