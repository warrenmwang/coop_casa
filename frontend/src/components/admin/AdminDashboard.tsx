import React from "react";
import CreatePropertyForm from "../../form/CreatePropertyForm";
import AdminManageUserRoles from "../../form/AdminManageUserRoles";
import { Grid } from "@mui/material";
import UpdatePropertyManager from "../../form/UpdatePropertyManager";
import CreateCommunityForm from "../../form/CreateCommunityForm";
import UpdateCommunityManager from "../../form/UpdateCommunityManager";
import AdminDisplayUsers from "./AdminDisplayUsers";
import UserOwnedPropertiesTable from "../properties/UserOwnedPropertiesTable";
import UserOwnedCommunitiesTable from "../communities/UserOwnedCommunitiesTable";
import {
  useGetLikedEntities,
  useGetUserAccountDetails,
} from "../../hooks/account";
import TextSkeleton from "../../skeleton/TextSkeleton";
import FetchErrorText from "../FetchErrorText";
import LayoutSectionUsersProfilesWithModal from "../LayoutSectionUsersProfilesWithModal";
import LayoutSectionCommunitiesWithModal from "../LayoutSectionCommunitiesWithModal";
import LayoutSectionPropertiesWithModal from "../LayoutSectionProperiesWithModal";

const AdminDashboard: React.FC = () => {
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
    <>
      <div className="min-w-full mx-auto">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <AdminDisplayUsers />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            {/* Component to be able to update the role of a user */}
            <AdminManageUserRoles />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <CreatePropertyForm />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <UserOwnedPropertiesTable />
            <UpdatePropertyManager />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            {/* Create Community Form */}
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

export default AdminDashboard;
