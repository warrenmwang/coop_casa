import React from "react";

import CardSkeleton from "@app/components/skeleton/CardSkeleton";

interface CardGridSkeletonProps {
  numPerRow?: number;
  numRows?: number;
}

const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({
  numPerRow = 3,
  numRows = 3,
}) => {
  const items = Array.from(
    { length: numPerRow * numRows },
    (_, index) => index,
  );

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      id="card-grid-skeleton"
    >
      {items.map((index) => (
        <div key={index}>
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default CardGridSkeleton;
