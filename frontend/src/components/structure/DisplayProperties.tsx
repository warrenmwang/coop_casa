import { Grid } from "@mui/material";
import React from "react";
import { useAPIGetProperties } from "../../api/api";
import CardGridSkeleton from "./CardGridSkeleton";
import { GlobalStore } from "../../globalStore";
import PropertyCard from "./PropertyCard";

interface DisplayPropertiesProps {

}

// Display property information
// We would like to be able to control whether we want to display the properties at random or 
// in a specific order (for testing).
const DEV_LISTING_TOGGLE = true;

const DisplayProperties : React.FC<DisplayPropertiesProps> = () => {

  const globalStore = GlobalStore();
  const { currProperties } = globalStore;

  const getPropertiesMode = (DEV_LISTING_TOGGLE) ? "deterministic" : "random";
  const limit : number = 9;
  var offset : number;
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

  const loading = useAPIGetProperties(limit, offset);

  return(
    <>
      {loading && <CardGridSkeleton/>}
      {!loading && (
        <div className="flex justify-center">
          <Grid
            container
            spacing={2}
          >
            { currProperties && 
              currProperties.map((value, index) => (
                <Grid
                  key={index}
                  item
                  xs={12} sm={12} md={6} lg={6} xl={4}
                  style={{ gap: "0 24px" }}
                >
                  <PropertyCard property={value}/>
                </Grid>
              ))
            }
          </Grid>
        </div>
      )}
    </>
  );
}

export default DisplayProperties;