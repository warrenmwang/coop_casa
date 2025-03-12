import React from "react";
import MemoizedImageElement from "@app/components/MemoizedImageElement";

interface CardProps {
  title: string;
  imageUrl: string | File | React.ReactNode;
  description: React.ReactNode;
  reverse?: boolean;
  imageSize?: "sm" | "md" | "lg";
}

const Card: React.FC<CardProps> = ({
  title,
  imageUrl,
  description,
  reverse = false,
  imageSize = "md",
}) => {
  const imageSizeClasses = {
    sm: "h-48 sm:h-56",
    md: "h-56 sm:h-64",
    lg: "h-64 sm:h-72 md:h-80",
  };

  const renderImage = () => {
    if (React.isValidElement(imageUrl)) {
      return (
        <div
          className={`${imageSizeClasses[imageSize]} w-full flex items-center justify-center overflow-hidden rounded-t-lg bg-gray-50`}
        >
          {imageUrl}
        </div>
      );
    }

    if (typeof imageUrl === "string") {
      return (
        <div className={`${imageSizeClasses[imageSize]} w-full`}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-t-lg"
          />
        </div>
      );
    }

    return (
      <div className={`${imageSizeClasses[imageSize]} w-full`}>
        <MemoizedImageElement
          image={imageUrl as File}
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {renderImage()}
      <div className="p-4 sm:p-5">
        {title && (
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
        )}
        <div>{description}</div>
      </div>
    </div>
  );
};

export default Card;
