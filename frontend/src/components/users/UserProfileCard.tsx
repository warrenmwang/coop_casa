import React, { useMemo } from "react";
import { UserProfile } from "@app/types/Types";
import { usersPageLink } from "@app/urls";
import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia } from "@mui/material";
import DefaultUserProfileIcon from "@app/components/icons/DefaultUserProfileIcon";

const UserProfileCard: React.FC<{ userProfile: UserProfile }> = ({
  userProfile,
}) => {
  const userProfileDetailPage = `${usersPageLink}/${userProfile.details.userId}`;
  const cardImage: JSX.Element = useMemo(() => {
    // Return a default image if user account has no image
    if (userProfile.images.length === 0 || userProfile.images[0] === null) {
      return <DefaultUserProfileIcon color="black" className="w-72 ml-10" />;
    }
    // O.W. return their first image for card
    return <img src={URL.createObjectURL(userProfile.images[0])} />;
  }, [userProfile.images]);

  return (
    <>
      <Link to={userProfileDetailPage}>
        <Card className="mui__card">
          <CardMedia
            title="User Profile first image"
            className="mui__card_media"
          >
            {cardImage}
          </CardMedia>
          <CardContent className="mui__card_content">
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

export default React.memo(UserProfileCard);
