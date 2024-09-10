import React, { useState, useEffect } from "react";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { createThumbnail } from "./Thumbnail";

export type ImageGalleryItemsInput = {
  img: string;
  title: string;
  rows: number;
  cols: number;
};

const CustomImageGallery: React.FC<{ imageData: ImageGalleryItemsInput[] }> = ({
  imageData,
}) => {
  const getImageThumbnail = async (
    origImg: string,
    width: number,
    height: number,
  ) => {
    let result: string;
    try {
      result = await createThumbnail(origImg, width, height);
    } catch (err) {
      console.error(`unable to create thumbnail: ${err}`);
      result = "";
    }
    return result;
  };

  const [imagesReadyForGallery, setImagesReadyForGallery] = useState<
    ReactImageGalleryItem[]
  >([]);

  useEffect(() => {
    const foo = async () => {
      const result: ReactImageGalleryItem[] = [];
      for (let i = 0; i < imageData.length; i++) {
        result.push({
          original: imageData[i].img,
          thumbnail: await getImageThumbnail(
            imageData[i].img,
            imageData[i].cols * 20,
            imageData[i].rows * 20,
          ),
          loading: "eager",
        });
      }
      setImagesReadyForGallery(result);
    };
    foo();
  }, []);

  return (
    <ImageGallery
      items={imagesReadyForGallery}
      showNav={true}
      additionalClass="z-10"
    />
  );
};

export default CustomImageGallery;
