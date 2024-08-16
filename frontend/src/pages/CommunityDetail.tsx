import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGetCommunity } from "../api/api";
import CardSkeleton from "../skeleton/CardSkeleton";
import { Community } from "../types/Types";
import { Box } from "@mui/material";
import { communitiesPageLink } from "../urls";
import ShareLinkButton from "../components/ShareLinkButton";
import CustomImageGallery, {
  ImageGalleryItemsInput,
} from "../components/CustomImageGallery";
import FetchErrorText from "../components/FetchErrorText";

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
      {/* TODO: How do we show the community's users and properties? */}
      {/* how much information do we want to show for the users? just their name? */}
      {/* how about some point of contact? a public email addr they setup in their account? */}
    </Box>
  );
};

const CommunityDetail: React.FC = () => {
  const { communityID } = useParams<{ communityID: string }>();
  const communityIDStr: string = communityID as string;

  const communityQuery = useQuery({
    queryKey: ["communities", communityID],
    queryFn: () => apiGetCommunity(communityIDStr),
  });

  return (
    <>
      {communityQuery.status === "pending" && (
        <div className="flex justify-center">
          {" "}
          <CardSkeleton />
        </div>
      )}
      {communityQuery.status === "success" && (
        <CommunityDetailContent
          community={communityQuery.data as Community}
        ></CommunityDetailContent>
      )}
      {communityQuery.status === "error" && (
        <FetchErrorText>
          Sorry, we are unable to find that particular property.
        </FetchErrorText>
      )}
    </>
  );
};

export default CommunityDetail;
