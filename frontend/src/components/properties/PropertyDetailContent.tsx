import React from "react";

import CustomImageGallery, {
  ImageGalleryItemsInput,
} from "@app/components/CustomImageGallery";
import BackButton from "@app/components/buttons/BackButton";
import LikeButton from "@app/components/buttons/LikeButton";
import ShareLinkButton from "@app/components/buttons/ShareLinkButton";
import ListerInfo from "@app/components/properties/ListerInfo";
import BrowsePageButton from "@app/components/users/BrowsePageButton";
import {
  useGetLikedProperties,
  useLikeProperty,
  useUnlikeProperty,
} from "@app/hooks/account";
import { Property } from "@app/types/Types";
import { propertiesPageLink } from "@app/urls";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";
import {
  constructAddressString,
  costNumsToPresentableString,
} from "@app/utils/property";
import { Box } from "@mui/material";
import debounce from "lodash.debounce";

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
    <Box className="detail-page-body">
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
