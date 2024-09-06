import React from "react";
import { useGetUserProfiles } from "../../hooks/users";

type CommunityUsersProfilesSectionProps = {
  userIDs: string[];
};
const CommunityUsersProfilesSection: React.FC<
  CommunityUsersProfilesSectionProps
> = ({ userIDs }) => {
  const userProfileQueries = useGetUserProfiles(userIDs);

  return (
    <>
      <div className="text-3xl font-bold">Community Members</div>
      <div>TODO:</div>
      <div className="flex">
        should be some user cards here that let you open a modal
      </div>
    </>
  );
};

export default CommunityUsersProfilesSection;
