import React from "react";
import CreatePropertyForm from "../form/CreatePropertyForm";
import UpdatePropertyManager from "../form/UpdatePropertyManager";
import { Grid } from "@mui/material";
import CreateCommunityForm from "../form/CreateCommunityForm";
import UpdateCommunityManager from "../form/UpdateCommunityManager";
import UserOwnedPropertiesTable from "./properties/UserOwnedPropertiesTable";
import UserOwnedCommunitiesTable from "./communities/UserOwnedCommunitiesTable";
import { useGetUserAccountDetails } from "../hooks/account";
import TextSkeleton from "../skeleton/TextSkeleton";
import FetchErrorText from "./FetchErrorText";
import LayoutSectionUsersProfilesWithModal from "./LayoutSectionUsersProfilesWithModal";
import LayoutSectionCommunitiesWithModal from "./LayoutSectionCommunitiesWithModal";
import LayoutSectionPropertiesWithModal from "./LayoutSectionProperiesWithModal";

const ListerDashboard: React.FC = () => {
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
      <div className="min-w-full mx-auto">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <CreatePropertyForm />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <UserOwnedPropertiesTable />
            <UpdatePropertyManager />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <CreateCommunityForm />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <UserOwnedCommunitiesTable />
            <UpdateCommunityManager />
          </Grid>
        </Grid>

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

export default ListerDashboard;
