import React from "react";
import CreatePropertyForm from "../form/CreatePropertyForm";
import UpdatePropertyManager from "../form/UpdatePropertyManager";
import { Grid } from "@mui/material";
import CreateCommunityForm from "../form/CreateCommunityForm";
import UpdateCommunityManager from "../form/UpdateCommunityManager";

const ListerDashboard: React.FC = () => {
  return (
    <>
      <div className="min-w-full mx-auto">
        <Grid container spacing={2}>
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
            {/* Update Community Form*/}
            <UpdateCommunityManager />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default ListerDashboard;
