import React from "react";

import UserProfileCard from "@app/components/users/UserProfileCard";
import { useGetUserProfiles } from "@app/hooks/users";
import { UserProfile } from "@app/types/Types";

const PageOfUserProfiles: React.FC<{ userIDs: string[] }> = ({ userIDs }) => {
  const userProfileQueries = useGetUserProfiles(userIDs);

  const userProfiles = userProfileQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    });

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {userProfiles.map((value: UserProfile | undefined) => {
          if (value) {
            return (
              <UserProfileCard key={value.details.userId} userProfile={value} />
            );
          }
        })}
      </div>
    </div>
  );
};

export default React.memo(PageOfUserProfiles);
