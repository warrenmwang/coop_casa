import React, { useMemo } from "react";
import { UserProfile } from "../types/Types";
import { usersPageLink } from "../urls";
import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia } from "@mui/material";

const UserProfileCard: React.FC<{ userProfile: UserProfile }> = ({
  userProfile,
}) => {
  const userProfileDetailPage = `${usersPageLink}/${userProfile.details.userId}`;
  let cardImage: string = useMemo(
    () => URL.createObjectURL(userProfile.images[0]),
    [userProfile.images],
  );

  return (
    <>
      <Link to={userProfileDetailPage}>
        <Card sx={{ maxWidth: 400, maxHeight: 600 }}>
          <CardMedia
            sx={{ width: 400, height: 300 }}
            image={cardImage}
            title=""
          />
          <CardContent>
            <div className="text-3xl font-bold">{`${userProfile.details.firstName} ${userProfile.details.lastName}, ${userProfile.details.ageInYears}`}</div>
            <div className="text-2xl">{userProfile.details.location}</div>
            <div className="text-2xl">
              {userProfile.details.interests.join(", ")}
            </div>
          </CardContent>
        </Card>
      </Link>
    </>
  );
};

export default UserProfileCard;
