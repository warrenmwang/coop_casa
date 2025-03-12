import React from "react";
import { useParams } from "react-router-dom";

import FetchErrorText from "@app/components/FetchErrorText";
import CommunityDetailContent from "@app/components/communities/CommunityDetailContent";
import CardSkeleton from "@app/components/skeleton/CardSkeleton";
import { useGetCommunity } from "@app/hooks/communities";

const CommunityDetailPage: React.FC = () => {
  const { communityID } = useParams<{ communityID: string }>();
  const communityIDStr: string = communityID as string;

  const { data, status } = useGetCommunity(communityIDStr);

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

  return <CommunityDetailContent community={data}></CommunityDetailContent>;
};

export default CommunityDetailPage;
