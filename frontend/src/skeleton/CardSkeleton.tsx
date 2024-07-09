import React from "react";
import { Card, Skeleton } from "@mui/material";

const CardSkeleton: React.FC = () => {
  return (
    <Card>
      <Skeleton
        variant="rectangular"
        animation="wave"
        width={400}
        height={300}
        sx={{ my: 1 }}
      />
      <Skeleton
        variant="rectangular"
        animation="wave"
        width={400}
        sx={{ my: 1 }}
      />
      <Skeleton
        variant="rectangular"
        animation="wave"
        width="60%"
        sx={{ my: 1 }}
      />
    </Card>
  );
};

export default CardSkeleton;
