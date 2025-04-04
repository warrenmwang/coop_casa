import React from "react";

import FetchErrorText from "@app/components/FetchErrorText";
import LayoutSectionCommunitiesWithModal from "@app/components/LayoutSectionCommunitiesWithModal";
import LayoutSectionPropertiesWithModal from "@app/components/LayoutSectionProperiesWithModal";
import LayoutSectionUsersProfilesWithModal from "@app/components/LayoutSectionUsersProfilesWithModal";
import TextSkeleton from "@app/components/skeleton/TextSkeleton";
import BrowsePageButton from "@app/components/users/BrowsePageButton";
import { useGetLikedEntities } from "@app/hooks/account";
import {
  communitiesPageLink,
  propertiesPageLink,
  usersPageLink,
} from "@app/urls";

const AllLikedEntitiesSection: React.FC = () => {
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
  const likedPropertyIDs: string[] = likedEntitiesData[1];
  const likedCommunityIDs: string[] = likedEntitiesData[2];

  return (
    <div className="flex flex-col items-center space-y-2">
      {likedUserIDs.length === 0 ? (
        <BrowsePageButton
          pageLink={usersPageLink}
          displayText="Browse Users!"
        />
      ) : (
        <>
          <h1 className="h1_custom">Liked Users</h1>
          <LayoutSectionUsersProfilesWithModal
            userIDs={likedUserIDs}
            modalTitle="Your Liked Users"
          />
        </>
      )}
      {likedCommunityIDs.length === 0 ? (
        <BrowsePageButton
          pageLink={communitiesPageLink}
          displayText="Browse Communities!"
        />
      ) : (
        <>
          <h1 className="h1_custom">Liked Communities</h1>
          <LayoutSectionCommunitiesWithModal
            communityIDs={likedCommunityIDs}
            modalTitle="Your Liked Communities"
          />
        </>
      )}
      {likedPropertyIDs.length === 0 ? (
        <BrowsePageButton
          pageLink={propertiesPageLink}
          displayText="Browse Properties!"
        />
      ) : (
        <>
          <h1 className="h1_custom">Liked Properties</h1>
          <LayoutSectionPropertiesWithModal
            propertyIDs={likedPropertyIDs}
            modalTitle="Your Liked Properties"
          />
        </>
      )}
    </div>
  );
};
export default AllLikedEntitiesSection;
