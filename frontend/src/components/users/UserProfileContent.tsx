import * as React from "react";
import { UserProfile } from "@app/types/Types";
import { Box } from "@mui/material";
import { usersPageLink } from "@app/urls";
import ShareLinkButton from "@app/components/buttons/ShareLinkButton";
import CustomImageGallery, {
  ImageGalleryItemsInput,
} from "@app/components/CustomImageGallery";
import defaultProfileImage from "@app/assets/profile.jpg";
import LayoutSectionCommunitiesWithModal from "@app/components/LayoutSectionCommunitiesWithModal";
import LayoutSectionPropertiesWithModal from "@app/components/LayoutSectionProperiesWithModal";
import LikeButton from "@app/components/buttons/LikeButton";
import {
  useGetLikedUsers,
  useLikeUser,
  useUnlikeUser,
} from "@app/hooks/account";
import BackButton from "@app/components/buttons/BackButton";
import BrowsePageButton from "@app/components/users/BrowsePageButton";
import debounce from "lodash.debounce";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";

const UserProfileContent: React.FC<{ userProfile: UserProfile }> = ({
  userProfile,
}) => {
  const images = userProfile.images.map((image) =>
    image !== null ? URL.createObjectURL(image) : defaultProfileImage,
  );
  const imageData: ImageGalleryItemsInput[] = images.map((image) => ({
    img: image,
    title: "default title",
    rows: 2,
    cols: 4,
  }));

  // Setup for user to like/unlike the user
  const likeUser = useLikeUser();
  const unlikeUser = useUnlikeUser();

  const debounceToggleLikeUser = debounce((isLiked: boolean) => {
    if (isLiked) {
      unlikeUser.mutate(
        { userID: userProfile.details.userId },
        {
          onError: mutationErrorCallbackCreator("Unable to unlike user"),
        },
      );
    } else {
      likeUser.mutate(
        { userID: userProfile.details.userId },
        {
          onError: mutationErrorCallbackCreator("Unable to like user"),
        },
      );
    }
  }, 250);

  let showLikedButton = false;
  let isLiked = false;

  const likedQuery = useGetLikedUsers();
  if (likedQuery.status === "success") {
    showLikedButton = true;
    isLiked = likedQuery.data.includes(userProfile.details.userId);
  }

  return (
    <>
      <Box className="bg-white p-4 shadow-lg rounded-lg mx-auto w-11/12 md:w-3/5 lg:w-1/2 z-50">
        {/* Top row of buttons */}
        <div className="flex">
          <BackButton />
          <BrowsePageButton
            pageLink={usersPageLink}
            displayText="Browse User Profiles"
          />
          <ShareLinkButton />
          {showLikedButton && (
            <LikeButton
              initState={isLiked}
              onClick={() => debounceToggleLikeUser(isLiked)}
            />
          )}
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
          <>
            <h1 className="h1_custom mt-3">User&apos;s Liked Communities</h1>
            <LayoutSectionCommunitiesWithModal
              communityIDs={userProfile.communityIDs}
              modalTitle="User's Liked Communities"
            />
          </>
        )}

        {/* User's properties */}
        {userProfile.propertyIDs.length > 0 && (
          <>
            <h1 className="h1_custom mt-3">User&apos;s Liked Properties</h1>
            <LayoutSectionPropertiesWithModal
              propertyIDs={userProfile.propertyIDs}
              modalTitle="User's Liked Properties"
            />
          </>
        )}
      </Box>
    </>
  );
};

export default UserProfileContent;
