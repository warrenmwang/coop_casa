import React from "react";
import { Box } from "@mui/material";
import { communitiesPageLink } from "@app/urls";
import ShareLinkButton from "@app/components/buttons/ShareLinkButton";
import CustomImageGallery, {
  ImageGalleryItemsInput,
} from "@app/components/CustomImageGallery";
import { Community } from "@app/types/Types";
import LayoutSectionUsersProfilesWithModal from "@app/components/LayoutSectionUsersProfilesWithModal";
import LayoutSectionPropertiesWithModal from "@app/components/LayoutSectionProperiesWithModal";
import BackButton from "@app/components/buttons/BackButton";
import BrowsePageButton from "@app/components/users/BrowsePageButton";
import LikeButton from "@app/components/buttons/LikeButton";
import {
  useGetLikedCommunities,
  useLikeCommunity,
  useUnlikeCommunity,
} from "@app/hooks/account";
import debounce from "lodash.debounce";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";

const CommunityDetailContent: React.FC<{ community: Community }> = ({
  community,
}) => {
  const images = community.images.map((image) => URL.createObjectURL(image));
  const imageData: ImageGalleryItemsInput[] = images.map((image) => ({
    img: image,
    title: "default title",
    rows: 2,
    cols: 4,
  }));

  const likeCommunity = useLikeCommunity();
  const unlikeCommunity = useUnlikeCommunity();

  const debounceToggleLikeCommunity = debounce((isLiked: boolean) => {
    if (isLiked) {
      unlikeCommunity.mutate(
        { communityID: community.details.communityId },
        {
          onError: mutationErrorCallbackCreator("Unable to like community"),
        },
      );
    } else {
      likeCommunity.mutate(
        { communityID: community.details.communityId },
        {
          onError: mutationErrorCallbackCreator("Unable to like community"),
        },
      );
    }
  }, 250);

  let showLikedButton = false;
  let isLiked = false;

  const likedQuery = useGetLikedCommunities();
  if (likedQuery.status === "success") {
    showLikedButton = true;
    isLiked = likedQuery.data.includes(community.details.communityId);
  }

  return (
    <Box className="bg-white p-4 shadow-lg rounded-lg mx-auto w-11/12 md:w-3/5 lg:w-4/5">
      {/* Top row of buttons */}
      <div className="flex">
        <BackButton />
        <BrowsePageButton
          pageLink={communitiesPageLink}
          displayText="Browse Communities"
        />
        <ShareLinkButton />
        {showLikedButton && (
          <LikeButton
            initState={isLiked}
            onClick={() => debounceToggleLikeCommunity(isLiked)}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        {/* Images */}
        <CustomImageGallery imageData={imageData} />
        {/* Name, description */}
        <div id="transition-modal-title">
          <div className="text-3xl font-bold">{community.details.name}</div>
          <div className="text-2xl">{community.details.description}</div>
        </div>

        {/* community id */}
        <p className="text-sm pt-5">
          Community ID: {community.details.communityId}{" "}
        </p>

        {/* Community Users' Profiles */}
        {community.users.length > 0 && (
          <>
            <h1 className="text-3xl font-bold">Community Members</h1>
            <LayoutSectionUsersProfilesWithModal
              userIDs={community.users}
              modalTitle="Community Members"
            />
          </>
        )}

        {/* Community Properties' Listings */}
        {community.properties.length > 0 && (
          <>
            <h1 className="text-3xl font-bold">Community Properties</h1>
            <LayoutSectionPropertiesWithModal
              propertyIDs={community.properties}
              modalTitle="Community Properties"
            />
          </>
        )}
      </div>
    </Box>
  );
};

export default CommunityDetailContent;
