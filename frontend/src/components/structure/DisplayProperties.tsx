import React from "react";
import { useSearchParams } from "react-router-dom";
import { Grid } from "@mui/material";
import { apiGetProperties } from "../../api/api";
import CardGridSkeleton from "./CardGridSkeleton";
import PropertyCard from "./PropertyCard";
import SearchProperties from "./SearchProperties";
import { Property } from "./CreatePropertyForm";
import { useQuery } from "@tanstack/react-query";

interface DisplayPropertiesProps {}

// Display property information
// We would like to be able to control whether we want to display the properties at random or
// in a specific order (for testing).
const DEV_LISTING_TOGGLE = true;

const DisplayProperties: React.FC<DisplayPropertiesProps> = () => {
  // TODO: need this for filtering search information?
  const [searchParams, setSearchParams] = useSearchParams();

  const getPropertiesMode = DEV_LISTING_TOGGLE ? "deterministic" : "random";
  const limit: number = 9;
  var offset: number;
  if (getPropertiesMode == "deterministic") {
    offset = 0;
  } else if (getPropertiesMode == "random") {
    // TODO: we need to know how many properties are the in the db,
    // if there are more than the default number of properties being showed, then
    // we can do a random number gen with the offset between some range
    // [0, N] where N = int(TOTAL / limit)
    offset = 0;
  } else {
    offset = 0;
  }

  const {
    status,
    error,
    data: currProperties,
  } = useQuery({
    queryKey: ["properties", limit, offset],
    queryFn: () => apiGetProperties(limit, offset),
  });

  return (
    <>
      <SearchProperties />
      {status == "pending" && <CardGridSkeleton />}
      {status == "success" && (
        <div className="flex justify-center">
          <Grid container spacing={2}>
            {currProperties &&
              currProperties.map((value: Property, index: number) => (
                <Grid
                  key={index}
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  lg={6}
                  xl={4}
                  style={{ gap: "0 24px" }}
                >
                  <PropertyCard property={value} />
                </Grid>
              ))}
          </Grid>
        </div>
      )}
      {status == "error" && JSON.stringify(error)}
    </>
  );
};

export default DisplayProperties;
