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
import AllLikedEntitiesSection from "../AllLikedEntitiesSection";
import Title from "../Title";

const AdminDashboard: React.FC = () => {
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
          <Grid item lg={6}>
            <UserOwnedPropertiesTable />
          </Grid>
          <Grid item lg={6}>
            <UserOwnedCommunitiesTable />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <CreatePropertyForm />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <UpdatePropertyManager />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            {/* Create Community Form */}
            <CreateCommunityForm />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} style={{ gap: "0 24px" }}>
            <UpdateCommunityManager />
          </Grid>
        </Grid>
        <Title
          title="Your Liked Collections"
          description="If you're not seeing anything, go browse the users, properties, and communities that exist on Coop now!"
        />
        <AllLikedEntitiesSection />
      </div>
    </>
  );
};

export default AdminDashboard;