import React, { useMemo } from "react";
import { UserProfile } from "@app/types/Types";
import { usersPageLink } from "@app/urls";
import { Link } from "react-router-dom";
import Card from "@app/components/Card";
import DefaultUserProfileIcon from "@app/components/icons/DefaultUserProfileIcon";

const UserProfileCard: React.FC<{ userProfile: UserProfile }> = ({
  userProfile,
}) => {
  const userProfileDetailPage = `${usersPageLink}/${userProfile.details.userId}`;

  const profileImage = useMemo(() => {
    if (userProfile.images.length === 0 || userProfile.images[0] === null) {
      return <DefaultUserProfileIcon color="black" className="w-full h-full" />;
    }
    return userProfile.images[0];
  }, [userProfile.images]);

  const description = (
    <div className="space-y-3">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          {userProfile.details.firstName} {userProfile.details.lastName}
        </h3>
        <p className="text-lg text-gray-600">
          {userProfile.details.ageInYears} y/o
        </p>
      </div>
      {userProfile.details.location && (
        <p className="text-gray-600 flex items-center">
          <span className="mr-2">📍</span>
          {userProfile.details.location}
        </p>
      )}
      {userProfile.details.interests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {userProfile.details.interests.map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Link
      to={userProfileDetailPage}
      className="block transition-transform hover:scale-102 duration-200"
    >
      <Card
        title=""
        imageUrl={profileImage}
        description={description}
        imageSize="lg"
      />
    </Link>
  );
};

export default React.memo(UserProfileCard);
