import React, { useMemo } from "react";
import { UserProfile } from "../../types/Types";
import { usersPageLink } from "../../urls";
import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia } from "@mui/material";
import DefaultUserProfileIcon from "../../icons/DefaultUserProfile/DefaultUserProfileIcon";

const UserProfileCard: React.FC<{ userProfile: UserProfile }> = ({
  userProfile,
}) => {
  const userProfileDetailPage = `${usersPageLink}/${userProfile.details.userId}`;
  const cardImage: JSX.Element = useMemo(() => {
    // Return a default image if user account has no image
    if (userProfile.images.length === 0 || userProfile.images[0] === null) {
      return <DefaultUserProfileIcon color="black" className="w-72 ml-5" />;
    }
    // O.W. return their first image for card
    return (
      <img
        src={URL.createObjectURL(userProfile.images[0])}
        className="card__image"
      />
    );
  }, [userProfile.images]);

  return (
    <>
      <Link to={userProfileDetailPage}>
        <Card sx={{ maxWidth: 400, maxHeight: 600 }}>
          <CardMedia sx={{ width: 400, height: 300 }} title="">
            {cardImage}
          </CardMedia>
          <CardContent className="bg-white bg-opacity-40 backdrop-blur-xl">
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
