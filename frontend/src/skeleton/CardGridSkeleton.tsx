import { Grid } from "@mui/material";
import React from "react";
import CardSkeleton from "./CardSkeleton";

interface CardGridSkeletonProps {
  numPerRow?: number; // Note: this should divide 12, where 12 is the default number of entities to align things in the Grid comp.
  numRows?: number;
}

const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({
  numPerRow = 3,
  numRows = 3,
}) => {
  const foo = Array.from({ length: numPerRow * numRows }, (_, index) => index);

  return (
    <>
      <Grid container spacing={2}>
        {foo.map((index) => (
          <Grid
            key={index}
            item
            xs={12}
            sm={12}
            md={6}
            lg={6}
            xl={12 / numPerRow}
            style={{ gap: "0 24px" }}
          >
            <CardSkeleton />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CardGridSkeleton;
