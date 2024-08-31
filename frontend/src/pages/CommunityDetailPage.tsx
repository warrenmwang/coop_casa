import React from "react";
import { useParams } from "react-router-dom";
import CardSkeleton from "../skeleton/CardSkeleton";
import { Community } from "../types/Types";
import FetchErrorText from "../components/FetchErrorText";
import CommunityDetailContent from "../components/CommunityDetailContent";
import { useGetCommunity } from "../hooks/communities";

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
