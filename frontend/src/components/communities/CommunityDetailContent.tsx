import React from "react";
import { Box } from "@mui/material";
import { communitiesPageLink } from "../../urls";
import ShareLinkButton from "../buttons/ShareLinkButton";
import CustomImageGallery, {
  ImageGalleryItemsInput,
} from "../CustomImageGallery";
import { useNavigate } from "react-router-dom";
import { Community } from "../../types/Types";
import CommunityUsersProfilesSection from "./CommunityUsersProfilesSection";
import CommunityPropertiesSection from "./CommunityPropertiesSection";

const CommunityDetailContent: React.FC<{ community: Community }> = ({
  community,
}) => {
  const navigate = useNavigate();
  const images = community.images.map((image) => URL.createObjectURL(image));
  const imageData: ImageGalleryItemsInput[] = images.map((image) => ({
    img: image,
    title: "default title",
    rows: 2,
    cols: 4,
  }));

  return (
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
          onClick={() => navigate(communitiesPageLink)}
        >
          Browse Communities
        </button>
        <ShareLinkButton />
      </div>
      {/* Images */}
      <CustomImageGallery imageData={imageData} />
      {/* Name, description */}
      <div id="transition-modal-title">
        <div className="text-3xl font-bold">{community.details.name}</div>
        <div className="text-2xl">{community.details.description}</div>
      </div>
      {/* Community Users' Profiles */}
      <CommunityUsersProfilesSection userIDs={community.users} />

      {/* Community Properties' Listings */}
      <CommunityPropertiesSection propertyIDs={community.properties} />
    </Box>
  );
};

export default CommunityDetailContent;
