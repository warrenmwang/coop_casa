import React from "react";
import { useQueries } from "@tanstack/react-query";
import { Grid } from "@mui/material";
import { apiGetProperty } from "../api/api";
import PropertyCard from "./PropertyCard";

import { Property } from "../types/Types";

type PageOfPropertiesProps = {
  propertyIDs: string[];
};
const PageOfProperties: React.FC<PageOfPropertiesProps> = ({ propertyIDs }) => {
  const propertyQueries = useQueries({
    queries: propertyIDs.map((propertyID) => {
      return {
        queryKey: ["properties", propertyID],
        queryFn: () => apiGetProperty(propertyID),
      };
    }),
  });

  const properties = propertyQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    });

  return (
    <Grid container spacing={2}>
      {properties.map((value: Property) => (
        <Grid
          key={value.details.propertyId}
          item
          xs={12}
          sm={12}
          md={6}
          lg={6}
          xl={4}
          style={{ gap: "0 24px" }}
        >
          <PropertyCard key={value.details.propertyId} property={value} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PageOfProperties;
