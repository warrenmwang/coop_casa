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
      <div className="flex">{}</div>
    </>
  );
};

export default CommunityUsersProfilesSection;
