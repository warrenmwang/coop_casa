import * as React from "react";
import "../styles/font.css";
import LayoutSectionUsersProfilesWithModal from "./LayoutSectionUsersProfilesWithModal";
import LayoutSectionCommunitiesWithModal from "./LayoutSectionCommunitiesWithModal";
import LayoutSectionPropertiesWithModal from "./LayoutSectionProperiesWithModal";
import { useGetUserAccountDetails } from "../hooks/account";
import TextSkeleton from "../skeleton/TextSkeleton";
import FetchErrorText from "./FetchErrorText";

const RegularDashboard: React.FC = () => {
  const userQuery = useGetUserAccountDetails();

  if (userQuery.status === "pending") {
    return <TextSkeleton />;
  }
  if (userQuery.status === "error") {
    return (
      <FetchErrorText>
        Unable to fetch your data at this time. Please try again later.
      </FetchErrorText>
    );
  }

  const likedUserIDs: string[] = userQuery.data.likedUserIDs;
  const likedCommunityIDs: string[] = userQuery.data.likedCommunityIDs;
  const likedPropertyIDs: string[] = userQuery.data.likedPropertyIDs;

  return (
    <>
      <div className="flex flex-col items-center mt-5">
        {likedUserIDs.length === 0 ? (
          <p>Go like some users!</p>
        ) : (
          <LayoutSectionUsersProfilesWithModal userIDs={likedUserIDs} />
        )}
        {likedCommunityIDs.length === 0 ? (
          <p>Go liked some commmunities!</p>
        ) : (
          <LayoutSectionCommunitiesWithModal communityIDs={likedCommunityIDs} />
        )}
        {likedPropertyIDs.length === 0 ? (
          <p>Go like some properties!</p>
        ) : (
          <LayoutSectionPropertiesWithModal propertyIDs={likedPropertyIDs} />
        )}
      </div>
    </>
  );
};

export default RegularDashboard;
