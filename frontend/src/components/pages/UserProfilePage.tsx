import React from "react";
import { useParams } from "react-router-dom";

import CardSkeleton from "@app/components/skeleton/CardSkeleton";
import UserError from "@app/components/users/UserError";
import UserProfileContent from "@app/components/users/UserProfileContent";
import { useGetUserProfile } from "@app/hooks/users";

const UserProfilePage: React.FC = () => {
  const { userID } = useParams<{ userID: string }>();
  const userIDStr: string = userID as string;

  const { data, status, refetch } = useGetUserProfile(userIDStr);

  return (
    <div className="min-h-screen">
      {status === "pending" && (
        <div className="animate-fade-in">
          <CardSkeleton />
        </div>
      )}

      {status === "error" && (
        <div className="animate-fade-in">
          <UserError onRetry={refetch} />
        </div>
      )}

      {status === "success" && data && (
        <div className="animate-fade-in">
          <UserProfileContent userProfile={data} />
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
