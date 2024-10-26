import React from "react";
import { useParams } from "react-router-dom";
import CardSkeleton from "@app/components/skeleton/CardSkeleton";
import { Community } from "@app/types/Types";
import FetchErrorText from "@app/components/FetchErrorText";
import CommunityDetailContent from "@app/components/communities/CommunityDetailContent";
import { useGetCommunity } from "@app/hooks/communities";

const CommunityDetailPage: React.FC = () => {
  const { communityID } = useParams<{ communityID: string }>();
  const communityIDStr: string = communityID as string;

  const communityQuery = useGetCommunity(communityIDStr);

  return (
    <>
      {communityQuery.status === "pending" && (
        <div className="flex justify-center">
          {" "}
          <CardSkeleton />
        </div>
      )}
      {communityQuery.status === "success" && (
        <CommunityDetailContent
          community={communityQuery.data as Community}
        ></CommunityDetailContent>
      )}
      {communityQuery.status === "error" && (
        <FetchErrorText>
          Sorry, we are unable to find that particular property.
        </FetchErrorText>
      )}
    </>
  );
};

export default CommunityDetailPage;
