import React from "react";
import { useParams } from "react-router-dom";

import CommunityDetailContent from "@app/components/communities/CommunityDetailContent";
import CommunityError from "@app/components/communities/CommunityError";
import CardSkeleton from "@app/components/skeleton/CardSkeleton";
import { useGetCommunity } from "@app/hooks/communities";

const CommunityDetailPage: React.FC = () => {
  const { communityID } = useParams<{ communityID: string }>();
  const communityIDStr: string = communityID as string;

  const { data, status, refetch } = useGetCommunity(communityIDStr);

  return (
    <div className="min-h-screen">
      {status === "pending" && (
        <div className="animate-fade-in">
          <CardSkeleton />
        </div>
      )}

      {status === "error" && (
        <div className="animate-fade-in">
          <CommunityError onRetry={refetch} />
        </div>
      )}

      {status === "success" && data && (
        <div className="animate-fade-in">
          <CommunityDetailContent community={data} />
        </div>
      )}
    </div>
  );
};

export default CommunityDetailPage;
