import React from "react";
import { useParams } from "react-router-dom";
import CardSkeleton from "@app/components/skeleton/CardSkeleton";
import FetchErrorText from "@app/components/FetchErrorText";
import UserProfileContent from "@app/components/users/UserProfileContent";
import { useGetUserProfile } from "@app/hooks/users";

const UserProfilePage: React.FC = () => {
  const { userID } = useParams<{ userID: string }>();
  const userIDStr: string = userID as string;

  const { data: userProfile, status } = useGetUserProfile(userIDStr);

  if (status === "pending") {
    return (
      <div className="flex justify-center">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <>
      {status === "error" && (
        <FetchErrorText>
          Sorry, we are unable to find that user{"'"}s profile.
        </FetchErrorText>
      )}

      {status === "success" && <UserProfileContent userProfile={userProfile} />}
    </>
  );
};

export default UserProfilePage;
