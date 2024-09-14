import React from "react";
import { Box } from "@mui/material";
import { communitiesPageLink } from "../../urls";
import ShareLinkButton from "../buttons/ShareLinkButton";
import CustomImageGallery, {
  ImageGalleryItemsInput,
} from "../CustomImageGallery";
import { useNavigate } from "react-router-dom";
import { Community } from "../../types/Types";
import LayoutSectionUsersProfilesWithModal from "../LayoutSectionUsersProfilesWithModal";
import LayoutSectionPropertiesWithModal from "../LayoutSectionProperiesWithModal";
import BackButton from "../buttons/BackButton";
import BrowsePageButton from "../users/BrowsePageButton";
import LikeButton from "../buttons/LikeButton";
import {
  useGetLikedCommunities,
  useLikeCommunity,
  useUnlikeCommunity,
} from "../../hooks/account";
import debounce from "lodash.debounce";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import TextSkeleton from "../../skeleton/TextSkeleton";

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
          onError: (error: Error | AxiosError) => {
            let errMsg: string = error.message;
            if (axios.isAxiosError(error)) {
              errMsg = `${(error as AxiosError).response?.data}`;
            }
            toast.error(`Unabled to unlike community: ${errMsg}`);
          },
        },
      );
    } else {
      likeCommunity.mutate(
        { communityID: community.details.communityId },
        {
          onError: (error: Error | AxiosError) => {
            let errMsg: string = error.message;
            if (axios.isAxiosError(error)) {
              errMsg = `${(error as AxiosError).response?.data}`;
            }
            toast.error(`Unabled to like community: ${errMsg}`);
          },
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

  if (likedQuery.status === "pending") {
    return <TextSkeleton />;
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
        {/* Community Users' Profiles */}
        <LayoutSectionUsersProfilesWithModal userIDs={community.users} />

        {/* Community Properties' Listings */}
        <LayoutSectionPropertiesWithModal propertyIDs={community.properties} />

        {/* community id */}
        <p className="text-sm pt-5">
          Community ID: {community.details.communityId}{" "}
        </p>
      </div>
    </Box>
  );
};

export default CommunityDetailContent;
