import React, { useState } from "react";
import { Property } from "./CreatePropertyForm";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Modal,
  Fade,
  Box,
  Backdrop,
  Button,
} from "@mui/material";
import CustomImageGallery from "./CustomImageGallery";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const images = property.images.split("#");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const imageData = images.map((image) => ({
    img: image,
    title: "default title",
    rows: 2,
    cols: 4,
  }));

  return (
    <>
      <CardActionArea
        onClick={handleOpen}
        sx={{ maxWidth: 400, maxHeight: 400 }}
      >
        <Card sx={{ maxWidth: 400, maxHeight: 400 }}>
          <CardMedia
            sx={{ width: 400, height: 300 }}
            image={images[0]}
            title="default first image"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {property.name}
            </Typography>
            <Typography gutterBottom variant="h6" component="div">
              {`${property.description}`}
            </Typography>
          </CardContent>
        </Card>
      </CardActionArea>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 100,
            className: "z-40",
          },
        }}
        className="flex items-center justify-center z-50"
      >
        <Fade in={open}>
          <Box className="bg-white p-4 shadow-lg rounded-lg mx-auto w-11/12 md:w-3/5 lg:w-1/2 z-50">
            <div className="flex justify-end">
              <button
                className="block m-3 p-3 bg-gray-500 hover:bg-gray-400 text-white md:hidden rounded"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
            <CustomImageGallery imageData={imageData} />
            <Typography id="transition-modal-title" variant="h2" component="h2">
              {property.name}
            </Typography>
            <Typography variant="h3" component="div">
              {`\$${property.costDollars}.${property.costCents}`}
            </Typography>
            <Typography
              id="transition-modal-description"
              variant="h6"
              sx={{ mt: 2 }}
            >
              Address:{" "}
              {`${property.address1}, ${property.address2}, ${property.city}, ${property.state} ${property.zipcode}, ${property.country}`}
              <br></br>
              Square Feet: {property.squareFeet}
              <br></br>
              Bedrooms: {property.numBedrooms}
              <br></br>
              Toilets: {property.numToilets}
              <br></br>
              Showers/Baths: {property.numShowersBaths}
              <br></br>
              Misc. Lister Comments: {property.miscNote}
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default PropertyCard;
