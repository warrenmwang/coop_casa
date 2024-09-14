import * as React from "react";
import "../styles/font.css";
import LayoutSectionUsersProfilesWithModal from "./LayoutSectionUsersProfilesWithModal";
import LayoutSectionCommunitiesWithModal from "./LayoutSectionCommunitiesWithModal";
import LayoutSectionPropertiesWithModal from "./LayoutSectionProperiesWithModal";
import {
  useGetLikedEntities,
  useGetUserAccountDetails,
} from "../hooks/account";
import TextSkeleton from "../skeleton/TextSkeleton";
import FetchErrorText from "./FetchErrorText";

const RegularDashboard: React.FC = () => {
  const likedEntities = useGetLikedEntities();
  const pending = likedEntities.reduce(
    (accum, curr) => accum || curr.isFetching,
    false,
  );
  const error = likedEntities.reduce(
    (accum, curr) => accum || curr.isError,
    false,
  );

  if (pending) {
    return <TextSkeleton />;
  }
  if (error || likedEntities.length !== 3) {
    return (
      <FetchErrorText>
        Unable to fetch your data at this time. Please try again later.
      </FetchErrorText>
    );
  }
  const likedEntitiesData: string[][] = likedEntities.map(
    (query) => query.data as string[],
  );

  const likedUserIDs: string[] = likedEntitiesData[0];
  const likedCommunityIDs: string[] = likedEntitiesData[1];
  const likedPropertyIDs: string[] = likedEntitiesData[2];

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
