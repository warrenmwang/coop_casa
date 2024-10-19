import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import SubmitButton from "../buttons/SubmitButton";
import MultipleImageUploader from "../input/MultipleImageUploader";
import { MAX_PROPERTY_IMGS_ALLOWED } from "appConstants";
import {
  APIUserReceived,
  FormPropertyDetails,
  OrderedFile,
  Property,
  PropertyDetails,
  UserDetails,
} from "../../types/Types";
import TextSkeleton from "components/skeleton/TextSkeleton";

import { toast } from "react-toastify";
import { useGetUserAccountDetails } from "hooks/account";
import { useCreateProperty } from "hooks/properties";
import { mutationErrorCallbackCreator } from "utils/callbacks";
import { PropertyDetailsSchema } from "types/Schema";

export const EmptyPropertyDetails: FormPropertyDetails = {
  propertyId: "",
  listerUserId: "",
  name: "",
  description: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  squareFeet: "",
  numBedrooms: "",
  numToilets: "",
  numShowersBaths: "",
  costDollars: "",
  costCents: "",
  miscNote: "",
};

// This component lets the user create a property,
// and be able to view and modify their created properties.
// (for authorized users: admin or lister roles)
const CreatePropertyForm: React.FC = () => {
  const [formPropertyDetails, setFormPropertyDetails] =
    useState<FormPropertyDetails>(EmptyPropertyDetails);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [images, setImages] = useState<OrderedFile[]>([]);

  const userQuery = useGetUserAccountDetails();
  const createProperty = useCreateProperty();

  // FIXME: city state should probably be like user acc setup, where we use the autocomplete menu.

  const textInputHandleChange = (id: string, value: string) => {
    setFormPropertyDetails((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleImagesUploaded = (files: OrderedFile[]) => {
    setImages(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate details (html form should already provide good UX for input problems)
    // this to cast types correctly.
    const { data, success } =
      PropertyDetailsSchema.safeParse(formPropertyDetails);
    if (!success) {
      setIsSubmitting(false);
      toast.error("Something went wrong, check the property details.");
      return;
    }

    // Validate images
    if (images.length === 0 || images.length > MAX_PROPERTY_IMGS_ALLOWED) {
      setIsSubmitting(false);
      toast.error(
        `For property images, you must attach between 1 and 10 images inclusively. You have attached ${images.length}.`,
      );
      return;
    }

    // Format property with the details and images
    const property: Property = {
      details: data as PropertyDetails,
      images: images,
    };

    // Send data to backend
    createProperty.mutate(
      { property },
      {
        onSuccess: () => {
          setFormPropertyDetails(EmptyPropertyDetails);
          setImages([]);
          toast.success("Property created.");
        },
        onError: mutationErrorCallbackCreator("Could not create property"),
        onSettled: () => setIsSubmitting(false),
      },
    );
  };

  useEffect(() => {
    if (userQuery.status === "success") {
      const received: APIUserReceived = userQuery.data;
      const userDetails: UserDetails = received.userDetails;

      // Set values that we don't want the user to fill in themselves.
      // > property id as a UUIDV4, lister id (openauth id)
      setFormPropertyDetails((prevState) => ({
        ...prevState,
        propertyId: uuidv4(),
        listerUserId: userDetails.userId,
      }));
    }
  }, [userQuery.status]);

  if (!userQuery.isFetched) {
    return <TextSkeleton />;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="h1_custom">Add Property Listing</h1>
      <h4 className="h4_custom">
        This form allows you to upload a new property listing to the platform.
      </h4>
      <form className="form__vertical_inputs" onSubmit={handleSubmit}>
        <label htmlFor="name" className="label__text_input_gray">
          Property Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          placeholder=""
          value={formPropertyDetails.name}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="text"
          className="input__text_gray_box"
        />

        <label htmlFor="description" className="label__text_input_gray">
          Description
        </label>
        <input
          id="description"
          placeholder=""
          value={formPropertyDetails.description}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          type="text"
          className="input__text_gray_box"
        />

        <label htmlFor="address1" className="label__text_input_gray">
          Address 1 <span className="text-red-500">*</span>
        </label>
        <input
          id="address1"
          placeholder=""
          value={formPropertyDetails.address1}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="text"
          className="input__text_gray_box"
        />

        <label htmlFor="address2" className="label__text_input_gray">
          Address 2
        </label>
        <input
          id="address2"
          placeholder=""
          value={formPropertyDetails.address2}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          type="text"
          className="input__text_gray_box"
        />

        <label htmlFor="city" className="label__text_input_gray">
          City <span className="text-red-500">*</span>
        </label>
        <input
          id="city"
          placeholder=""
          value={formPropertyDetails.city}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="text"
          className="input__text_gray_box"
        />

        <label htmlFor="state" className="label__text_input_gray">
          State <span className="text-red-500">*</span>
        </label>
        <input
          id="state"
          placeholder=""
          value={formPropertyDetails.state}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="text"
          className="input__text_gray_box"
        />

        <label htmlFor="zipcode" className="label__text_input_gray">
          Zipcode <span className="text-red-500">*</span>
        </label>
        <input
          id="zipcode"
          placeholder=""
          value={formPropertyDetails.zipcode}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="text"
          className="input__text_gray_box"
        />

        <label htmlFor="country" className="label__text_input_gray">
          Country <span className="text-red-500">*</span>
        </label>
        <input
          id="country"
          placeholder=""
          value={formPropertyDetails.country}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="text"
          className="input__text_gray_box"
        />

        <label htmlFor="squareFeet" className="label__text_input_gray">
          Square Feet <span className="text-red-500">*</span>
        </label>
        <input
          id="squareFeet"
          placeholder=""
          value={formPropertyDetails.squareFeet}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="number"
          min="1"
          max="999999999"
          className="input__text_gray_box"
        />

        <label htmlFor="numBedrooms" className="label__text_input_gray">
          Number of Bedrooms <span className="text-red-500">*</span>
        </label>
        <input
          id="numBedrooms"
          placeholder=""
          value={formPropertyDetails.numBedrooms}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="number"
          min="0"
          max="32767"
          className="input__text_gray_box"
        />

        <label htmlFor="numToilets" className="label__text_input_gray">
          Number of Toilets <span className="text-red-500">*</span>
        </label>
        <input
          id="numToilets"
          placeholder=""
          value={formPropertyDetails.numToilets}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="number"
          min="0"
          max="32767"
          className="input__text_gray_box"
        />

        <label htmlFor="numShowersBaths" className="label__text_input_gray">
          Number of Showers and/or Baths <span className="text-red-500">*</span>
        </label>
        <input
          id="numShowersBaths"
          placeholder=""
          value={formPropertyDetails.numShowersBaths}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="number"
          min="0"
          max="32767"
          className="input__text_gray_box"
        />

        <label htmlFor="costDollars" className="label__text_input_gray">
          Cost, Dollar Amount with no comma or dollar sign (e.g. 150000){" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          id="costDollars"
          placeholder=""
          value={formPropertyDetails.costDollars}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="number"
          min="0"
          max="999999999999"
          className="input__text_gray_box"
        />

        <label htmlFor="costCents" className="label__text_input_gray">
          Cost, cents portion, between 00 - 99{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          id="costCents"
          placeholder=""
          value={formPropertyDetails.costCents}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          required={true}
          type="number"
          min="0"
          max="99"
          className="input__text_gray_box"
        />

        <label htmlFor="miscNote" className="label__text_input_gray">
          Misc. Notes (any comment that may not have been appropriate to put in
          the property description that the lister feels the buyer should know
          about should go here)
        </label>
        <input
          id="miscNote"
          placeholder=""
          value={formPropertyDetails.miscNote}
          onChange={(e) => textInputHandleChange(e.target.id, e.target.value)}
          type="string"
          className="input__text_gray_box"
        />

        {/* Images */}
        <div className="px-3">
          <label className="label__text_input_gray">
            Upload some images of the property. At least 1 image is required.
            <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            <MultipleImageUploader
              images={images}
              onImagesUploaded={handleImagesUploaded}
            />
            <SubmitButton isSubmitting={isSubmitting} className="w-3/5" />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePropertyForm;
