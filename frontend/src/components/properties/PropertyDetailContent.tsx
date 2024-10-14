import React from "react";
import { propertiesPageLink } from "urls";
import { Box } from "@mui/material";
import CustomImageGallery, {
  ImageGalleryItemsInput,
} from "../CustomImageGallery";
import ShareLinkButton from "../buttons/ShareLinkButton";
import ListerInfo from "./ListerInfo";
import { Property } from "../../types/Types";
import {
  constructAddressString,
  costNumsToPresentableString,
} from "../../utils/property";
import {
  useGetLikedProperties,
  useLikeProperty,
  useUnlikeProperty,
} from "hooks/account";
import debounce from "lodash.debounce";
import LikeButton from "../buttons/LikeButton";
import BackButton from "../buttons/BackButton";
import BrowsePageButton from "../users/BrowsePageButton";
import { mutationErrorCallbackCreator } from "utils/callbacks";

type PropertyDetailContentProps = {
  property: Property;
};

const PropertyDetailContent: React.FC<PropertyDetailContentProps> = ({
  property,
}) => {
  const images = property.images.map((image) =>
    URL.createObjectURL(image.file),
  );
  const imageData: ImageGalleryItemsInput[] = images.map((image) => ({
    img: image,
    title: "default title",
    rows: 2,
    cols: 4,
  }));

  const basicInfoConstructor = (property: Property) => {
    return (
      <div className="flex">
        <div className="font-bold mx-1">{property.details.numBedrooms}</div>
        <div> beds | </div>
        <div className="font-bold mx-1">{property.details.numShowersBaths}</div>
        <div> ba | </div>
        <div className="font-bold mx-1">{property.details.numToilets}</div>
        <div> toil | </div>
        <div className="font-bold mx-1">{property.details.squareFeet}</div>
        <div> sqft </div>
      </div>
    );
  };

  const costString = costNumsToPresentableString(
    property.details.costDollars,
    property.details.costCents,
  );
  const addressString = constructAddressString(property.details);

  const basicInfoElement: JSX.Element = basicInfoConstructor(property);

  // For like button
  // ------ LIKE BUTTON ------
  const likeProperty = useLikeProperty();
  const unlikeProperty = useUnlikeProperty();

  const debounceToggleLikeProperty = debounce((isLiked: boolean) => {
    if (isLiked) {
      unlikeProperty.mutate(
        { propertyID: property.details.propertyId },
        {
          onError: mutationErrorCallbackCreator("Unable to unlike property"),
        },
      );
    } else {
      likeProperty.mutate(
        { propertyID: property.details.propertyId },
        {
          onError: mutationErrorCallbackCreator("Unable to like property"),
        },
      );
    }
  }, 250);

  let showLikedButton = false;
  let isLiked = false;

  const likedQuery = useGetLikedProperties();
  if (likedQuery.status === "success") {
    showLikedButton = true;
    isLiked = likedQuery.data.includes(property.details.propertyId);
  }

  // ------ LIKE BUTTON ------

  return (
    <Box className="bg-white p-4 shadow-lg rounded-lg mx-auto w-11/12 md:w-3/5 lg:w-1/2 z-50">
      {/* Top row of buttons */}
      <div className="flex">
        <BackButton />
        <BrowsePageButton
          pageLink={propertiesPageLink}
          displayText="Browse Properties"
        />
        <ShareLinkButton />
        {showLikedButton && (
          <LikeButton
            initState={isLiked}
            onClick={() => debounceToggleLikeProperty(isLiked)}
          />
        )}
      </div>
      {/* Images */}
      <CustomImageGallery imageData={imageData} />
      {/* Cost, Address, core property details */}
      <div id="transition-modal-title">
        <div className="text-3xl font-bold">{costString}</div>
        <div className="text-2xl">{addressString}</div>
        {basicInfoElement}
      </div>
      {/* Lister given name and description of listing */}
      <div id="transition-modal-description">
        <div className="text-xl font-bold pt-2">Property Description</div>
        <div className="flex gap-2">
          <div className="text-lg">Property Name: </div>
          <div className="text-lg">{property.details.name}</div>
        </div>
        <div className="flex gap-2">
          <div className="text-lg">Description: </div>
          <div className="text-lg">{property.details.description}</div>
        </div>
        {/* Lister name and contact information */}
        <ListerInfo listerID={property.details.listerUserId} />
        <div className="text-lg">Miscellaneous Lister Comments: </div>
        <div className="text-lg">{property.details.miscNote}</div>
        <div className="text-sm pt-5">
          Property ID: {property.details.propertyId}
        </div>
      </div>
    </Box>
  );
};

export default PropertyDetailContent;
