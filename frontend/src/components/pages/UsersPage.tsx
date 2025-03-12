import React from "react";

import Title from "@app/components/Title";
import UserProfilesMainBody from "@app/components/users/UserProfilesMainBody";

const UsersPage: React.FC = () => {
  return (
    <div className="content-body">
      <div className="banner__red">
        <Title
          title="Search Users"
          description="You can use optional filters to narrow down your search here."
        />
      </div>
      <UserProfilesMainBody />
    </div>
  );
};

export default UsersPage;
