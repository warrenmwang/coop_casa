import React from "react";
import { ImageList, ImageListItem } from "@mui/material";

type QuiltedImageListProps = {
  imageData: {
    img: string;
    title: string;
    rows: number;
    cols: number;
  }[];
};

const QuiltedImageList: React.FC<QuiltedImageListProps> = ({ imageData }) => {
  return (
    <ImageList
      sx={{ width: 800, height: 450 }}
      variant="quilted"
      cols={8}
      rowHeight={121}
    >
      {imageData.map((item) => (
        <ImageListItem
          key={item.img}
          cols={item.cols || 1}
          rows={item.rows || 1}
        >
          <img src={item.img} alt={item.title} loading="lazy" />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default QuiltedImageList;
