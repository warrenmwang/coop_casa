import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGetUserProfile } from "../api/user";
import CardSkeleton from "../skeleton/CardSkeleton";
import FetchErrorText from "../components/FetchErrorText";
import UserProfileContent from "../components/UserProfileContent";

const UserProfilePage: React.FC = () => {
  const { userID } = useParams<{ userID: string }>();
  const userIDStr: string = userID as string;

  const { data: userProfile, status } = useQuery({
    queryKey: ["userProfile", userID],
    queryFn: () => apiGetUserProfile(userIDStr),
  });
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
          Sorry, we are unable to find that user's profile.
        </FetchErrorText>
      )}

      {status === "success" && <UserProfileContent userProfile={userProfile} />}
    </>
  );
};

export default UserProfilePage;
