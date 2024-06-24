import React, { useState, useEffect } from "react";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { createThumbnail } from "./Thumbnail";

type ImageGalleryItemsInput = {
  img: string;
  title: string;
  rows: number;
  cols: number;
};

type CustomImageGalleryProps = {
  imageData: ImageGalleryItemsInput[];
};

const CustomImageGallery: React.FC<CustomImageGalleryProps> = ({
  imageData,
}) => {
  const getImageThumbnail = async (
    origImg: string,
    width: number,
    height: number,
  ) => {
    var result: string;
    try {
      result = await createThumbnail(origImg, width, height);
    } catch (err) {
      result = "";
    }
    return result;
  };

  const [imagesReadyForGallery, setImagesReadyForGallery] = useState<
    ReactImageGalleryItem[]
  >([]);

  useEffect(() => {
    const foo = async () => {
      var result: ReactImageGalleryItem[] = [];
      for (var i = 0; i < imageData.length; i++) {
        result.push({
          original: imageData[i].img,
          thumbnail: await getImageThumbnail(
            imageData[i].img,
            imageData[i].cols * 20,
            imageData[i].rows * 20,
          ),
          loading: "lazy",
        });
      }
      setImagesReadyForGallery(result);
    };
    foo();
  }, []);

  return <ImageGallery items={imagesReadyForGallery} showNav={true} />;
};

export default CustomImageGallery;
