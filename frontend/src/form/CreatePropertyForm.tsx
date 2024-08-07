import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { apiCreateNewProperty } from "../api/api";
import { validateNumber } from "../utils/inputValidation";

import { AuthData } from "../auth/AuthWrapper";
import TextInput from "../input/TextInput";
import SubmitButton from "../components/SubmitButton";
import MultipleImageUploader from "../input/MultipleImageUploader";
import { MAX_PROPERTY_IMGS_ALLOWED } from "../constants";

import "../styles/font.css";
import {
  ErrorBody,
  OrderedFile,
  Property,
  PropertyDetails,
} from "../types/Types";
import { useMutation } from "@tanstack/react-query";

type TextFieldsConstruct = {
  id: string;
  label: string;
  placeholder: string;
  value: string | number;
  required: boolean;
  type: string;
  min?: string;
  max?: string;
};

export const EmptyPropertyDetails: PropertyDetails = {
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
  squareFeet: -1,
  numBedrooms: -1,
  numToilets: -1,
  numShowersBaths: -1,
  costDollars: -1,
  costCents: -1,
  miscNote: "",
};

// This component lets the user create a property,
// and be able to view and modify their created properties.
// (for authorized users: admin or lister roles)
const CreatePropertyForm: React.FC = () => {
  const auth = AuthData();
  const { user } = auth;

  const [propertyDetails, setPropertyDetails] =
    useState<PropertyDetails>(EmptyPropertyDetails);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  ); // if any key value in errors is true, then there is a problem.
  const [images, setImages] = useState<OrderedFile[]>([]);

  const { mutate: mutateCreate } = useMutation({
    mutationFn: (property: Property) => apiCreateNewProperty(property),
  });

  // for user inputs
  const propertyRequiredFields: string[] = [
    "name",
    "address1",
    "city",
    "state",
    "zipcode",
    "country",
    "squareFeet",
    "numBedrooms",
    "numToilets",
    "numShowersBaths",
    "costDollars",
    "costCents",
    "images",
  ];

  // FIXME: city state should probably be like user acc setup, where we use the autocomplete menu.

  const setErrors = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  // Initialize with errots for all required fields, thus needing to make sure that
  // the required fields are entered.
  useEffect(() => {
    // Set Errors for required fields that the user needs to fill in
    propertyRequiredFields.forEach((field) => {
      setErrors(field, true);
    });
  }, []);

  // for constructing the textinputs
  const propertyTextFieldsConstructs: TextFieldsConstruct[] = [
    {
      id: "name",
      label: "Property Name",
      placeholder: "",
      value: propertyDetails.name,
      required: true,
      type: "text",
    },
    {
      id: "description",
      label: "Description",
      placeholder: "",
      value: propertyDetails.description,
      required: false,
      type: "text",
    },
    {
      id: "address1",
      label: "Address 1",
      placeholder: "",
      value: propertyDetails.address1,
      required: true,
      type: "text",
    },
    {
      id: "address2",
      label: "Address 2",
      placeholder: "",
      value: propertyDetails.address2,
      required: false,
      type: "text",
    },
    {
      id: "city",
      label: "City",
      placeholder: "",
      value: propertyDetails.city,
      required: true,
      type: "text",
    },
    {
      id: "state",
      label: "State",
      placeholder: "",
      value: propertyDetails.state,
      required: true,
      type: "text",
    },
    {
      id: "zipcode",
      label: "Zipcode",
      placeholder: "",
      value: propertyDetails.zipcode,
      required: true,
      type: "text",
    },
    {
      id: "country",
      label: "country",
      placeholder: "",
      value: propertyDetails.country,
      required: true,
      type: "text",
    },
    {
      id: "squareFeet",
      label: "Square Feet",
      placeholder: "",
      value: propertyDetails.squareFeet,
      required: true,
      type: "number",
      min: "1",
      max: "999999999",
    },
    {
      id: "numBedrooms",
      label: "Number of Bedrooms",
      placeholder: "",
      value: propertyDetails.numBedrooms,
      required: true,
      type: "number",
      min: "0",
      max: "32767",
    },
    {
      id: "numToilets",
      label: "Number of Toilets",
      placeholder: "",
      value: propertyDetails.numToilets,
      required: true,
      type: "number",
      min: "0",
      max: "32767",
    },
    {
      id: "numShowersBaths",
      label: "Number of Showers and/or Baths",
      placeholder: "",
      value: propertyDetails.numShowersBaths,
      required: true,
      type: "number",
      min: "0",
      max: "32767",
    },
    {
      id: "costDollars",
      label: "Cost, Dollar Amount with no comma or dollar sign (e.g. 150000)",
      placeholder: "",
      value: propertyDetails.costDollars,
      required: true,
      type: "number",
      min: "0",
      max: "999999999999",
    },
    {
      id: "costCents",
      label: "Cost, cents portion, between 00 - 99",
      placeholder: "",
      value: propertyDetails.costCents,
      required: true,
      type: "number",
      min: "0",
      max: "99",
    },
    {
      id: "miscNote",
      label:
        "Misc. Notes (any comment that may not have been appropriate to put in the property description that the lister feels the buyer should know about should go here)",
      placeholder: "",
      value: propertyDetails.miscNote,
      required: false,
      type: "string",
    },
  ];

  const textInputHandleChange = (id: string, value: string) => {
    // need to convert the text input type=number values from variable type string into number
    if (
      id === "squareFeet" ||
      id === "numBedrooms" ||
      id === "numToilets" ||
      id === "numShowersBaths" ||
      id === "costDollars" ||
      id === "costCents"
    ) {
      // Validate string is a number
      if (!validateNumber(value)) {
        alert(`Value in field ${id} is not a number.`);
        return;
      }
      // save value for this field
      setPropertyDetails((prevState: any) => ({
        ...prevState,
        [id]: Number(value),
      }));
      return;
    }

    // o.w. set string value
    setPropertyDetails((prevState: any) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleImagesUploaded = (files: OrderedFile[]) => {
    // update errors
    if (files.length > MAX_PROPERTY_IMGS_ALLOWED) {
      setErrors("images", true);
      alert(
        `Uploaded more than the maximum allowable images (${MAX_PROPERTY_IMGS_ALLOWED}).`,
      );
      return;
    } else if (files.length === 0) {
      setErrors("images", true);
      return;
    }

    // no errors (at least 1 image)
    setErrors("images", false);
    // save images state
    setImages(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set values that we don't want the user to fill in themselves.
    // property id as a UUIDV4, lister id (openauth id)
    setPropertyDetails((prevState: any) => ({
      ...prevState,
      propertyId: uuidv4(),
      listerUserId: user.userId,
    }));

    // Set is submitting true, prevent spamming submit and start submission process.
    setIsSubmitting(true);
  };

  // Submit data if can submit
  useEffect(() => {
    if (isSubmitting) {
      // Only progress if no errors
      for (let [k, v] of errors) {
        if (v) {
          setIsSubmitting(false);
          alert(`Fix field: ${k}`);
          return;
        }
      }

      // Format property with the details and images
      const property: Property = {
        details: propertyDetails,
        images: images,
      };

      // Send data to backend
      mutateCreate(property, {
        onSuccess: () => {
          setPropertyDetails(EmptyPropertyDetails);
          setImages([]);
          setIsSubmitting(false);
          alert("Property created.");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data || error.message;
          alert("Could not create property because: " + errorMessage);
        },
      });
    }
  }, [isSubmitting, propertyDetails]);

  return (
    <div className="flex flex-col justify-center items-center space-x-4 mt-4">
      <h1 className="h1_custom">Add Property Listing</h1>
      <h4 className="h4_custom">
        This form allows you to upload a new property listing to the platform.
      </h4>
      {/* create a new property */}
      <form className="default-form-1" onSubmit={handleSubmit}>
        {propertyTextFieldsConstructs.map((value, index) => (
          <TextInput
            key={index}
            setFormData={textInputHandleChange}
            setError={setErrors}
            type={value.type}
            id={value.id}
            label={value.label}
            placeholder={value.placeholder}
            value={`${value.value}`}
            required={value.required}
            min={value.min}
            max={value.max}
            classNameCustom="w-full"
          />
        ))}

        {/* Images */}
        <label className="text_input_field_label_gray">
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
      </form>
    </div>
  );
};

export default CreatePropertyForm;
