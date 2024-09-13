import * as React from "react";
import { UserProfile } from "../../types/Types";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usersPageLink } from "../../urls";
import ShareLinkButton from "../buttons/ShareLinkButton";
import CustomImageGallery, {
  ImageGalleryItemsInput,
} from "../CustomImageGallery";
import defaultProfileImage from "../../assets/profile.jpg";
import LayoutSectionCommunitiesWithModal from "../LayoutSectionCommunitiesWithModal";
import LayoutSectionPropertiesWithModal from "../LayoutSectionProperiesWithModal";
import LikeButton from "../buttons/LikeButton";
import { useGetUserAccountDetails } from "../../hooks/account";
import TextSkeleton from "../../skeleton/TextSkeleton";

const UserProfileContent: React.FC<{ userProfile: UserProfile }> = ({
  userProfile,
}) => {
  const navigate = useNavigate();
  const images = userProfile.images.map((image) =>
    image !== null ? URL.createObjectURL(image) : defaultProfileImage,
  );
  const imageData: ImageGalleryItemsInput[] = images.map((image) => ({
    img: image,
    title: "default title",
    rows: 2,
    cols: 4,
  }));

  const userQuery = useGetUserAccountDetails();
  if (userQuery.status === "pending") {
    return <TextSkeleton />;
  }

  // initialize whether or not the user has liked this user...
  const isLiked: boolean =
    userQuery.data?.likedUserIDs.includes(userProfile.details.userId) ?? false;

  // TODO: need a mutation as well for updating that the logged in user has liked someone
  // needs to update 2 state -- local and server side

  // probably should refactor the useMutations first ?

  return (
    <>
      <Box className="bg-white p-4 shadow-lg rounded-lg mx-auto w-11/12 md:w-3/5 lg:w-1/2 z-50">
        {/* Top row of buttons */}
        <div className="flex">
          <button
            className="block m-3 p-3 bg-gray-500 hover:bg-gray-400 text-white rounded"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className="block m-3 p-3 bg-gray-500 hover:bg-gray-400 text-white rounded"
            onClick={() => navigate(usersPageLink)}
          >
            Browse User Profiles
          </button>
          <ShareLinkButton />
          {userQuery.status !== "error" && <LikeButton initState={isLiked} />}
        </div>

        {/* Images */}
        <CustomImageGallery imageData={imageData} />
        {/* Cost, Address, core property details */}
        <div id="transition-modal-title">
          <div className="text-3xl font-bold">{`${userProfile.details.firstName} ${userProfile.details.lastName}, ${userProfile.details.ageInYears}`}</div>
          <div className="text-2xl">Gender: {userProfile.details.gender}</div>
          <div className="text-2xl">
            Location: {userProfile.details.location}
          </div>
          <div className="text-2xl">
            Interests: {userProfile.details.interests.join(", ")}
          </div>
          <div className="text-sm pt-5">
            User ID: {userProfile.details.userId}
          </div>
        </div>

        {/* User's communities */}
        {userProfile.communityIDs.length > 0 && (
          <LayoutSectionCommunitiesWithModal
            communityIDs={userProfile.communityIDs}
          />
        )}

        {/* User's properties */}
        {userProfile.propertyIDs.length > 0 && (
          <LayoutSectionPropertiesWithModal
            propertyIDs={userProfile.propertyIDs}
          />
        )}
      </Box>
    </>
  );
};

export default UserProfileContent;
