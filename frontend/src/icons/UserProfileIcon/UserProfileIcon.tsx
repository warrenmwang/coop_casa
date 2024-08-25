import React from "react";

const UserProfileIcon: React.FC<{ userProfileImage: string }> = ({
  userProfileImage,
}) => {
  return (
    <img
      className="h-8 w-8 rounded-full"
      src={userProfileImage}
      alt="user profile icon"
    />
  );
};

export default UserProfileIcon;
