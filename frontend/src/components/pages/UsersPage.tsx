import React from "react";
import UserProfilesMainBody from "@app/components/users/UserProfilesMainBody";
import Title from "@app/components/Title";

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
