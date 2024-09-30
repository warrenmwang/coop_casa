import React, { useEffect, useState } from "react";
import { OrderedFile, Property, PropertyDetails } from "../types/Types";
import TextInput from "../input/TextInput";
import MultipleImageUploader from "../input/MultipleImageUploader";
import { MAX_PROPERTY_IMGS_ALLOWED } from "../constants";

import { validateNumber } from "../utils/inputValidation";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";
import { useUpdateProperty } from "../hooks/properties";

const UpdatePropertyForm: React.FC<{
  property: Property;
  setProperty: React.Dispatch<React.SetStateAction<Property | null>>;
}> = ({ property, setProperty }) => {
  const [formDetails, setFormDetails] = useState<PropertyDetails>({
    ...property.details,
  });
  const [formImages, setFormImages] = useState<OrderedFile[]>([
    ...property.images,
  ]);
  const [isChanged, setIsChanged] = useState(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProperty = useUpdateProperty();

  const setErrors = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  const handleDiscardChanges = () => {
    setFormDetails({ ...property.details });
    setFormImages([...property.images]);
    setIsChanged(false);
  };

  const textInputSetFormData = (id: string, value: string) => {
    // need to convert the text input type=number values
    // from variable type string into number
    if (
      id === "squareFeet" ||
      id === "numBedrooms" ||
      id === "numToilets" ||
      id === "numShowersBaths" ||
      id === "costDollars" ||
      id === "costCents"
    ) {
      // Validate string is a number
      const { data, success } = validateNumber(value);
      if (!success) {
        toast.error(`Value in field ${id} is not a number.`);
        return;
      }

      // convert to number and save value
      setFormDetails((prevState) => ({
        ...prevState,
        [id]: data,
      }));
      return;
    }

    // text value
    setFormDetails((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleImagesUpload = (files: OrderedFile[]) => {
    // update errors
    if (files.length > MAX_PROPERTY_IMGS_ALLOWED) {
      setFormImages([]);
      toast.error(
        `Uploaded more than the maximum allowable images (${MAX_PROPERTY_IMGS_ALLOWED}).`,
      );
      return;
    } else if (files.length === 0) {
      setErrors("images", true);
    } else {
      setErrors("images", false);
    }

    // save images state
    setFormImages(files);
  };

  const handleSaveChanges = async () => {
    // save property details and images and start submission request.
    setProperty((prevState) => ({
      ...prevState,
      details: formDetails,
      images: formImages,
    }));
    setIsSubmitting(true);
  };

  useEffect(() => {
    if (isSubmitting) {
      // ensure no errors
      for (const key of errors.keys()) {
        if (errors.get(key)) {
          setIsSubmitting(false);
          toast.error(
            `Resolve error in field "${key}" first before submitting.`,
          );
          return;
        }
      }
      updateProperty.mutate(
        { property },
        {
          onSuccess: () => {
            setFormDetails({ ...property.details });
            setFormImages([...property.images]);
            setIsChanged(false);
            toast.success("Property updated.");
          },
          onError: (error: Error | AxiosError) => {
            let errMsg: string = error.message;
            if (axios.isAxiosError(error)) {
              errMsg = `${(error as AxiosError).response?.data}`;
            }
            toast.error(`Failed to update because: ${errMsg}`);
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        },
      );
    }
  }, [isSubmitting]);

  return (
    <>
      {/* update form */}
      <form className="form__update_property">
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Property Name"
          id="name"
          value={formDetails.name}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Description"
          id="description"
          value={formDetails.description}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Address 1"
          id="address1"
          value={formDetails.address1}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Address 2"
          id="address2"
          value={formDetails.address2}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="City"
          id="city"
          value={formDetails.city}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="State"
          id="state"
          value={formDetails.state}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Zipcode"
          id="zipcode"
          value={formDetails.zipcode}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Country"
          id="country"
          value={formDetails.country}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Square Feet"
          id="squareFeet"
          value={`${formDetails.squareFeet}`}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Number of Bedrooms"
          id="numBedrooms"
          value={`${formDetails.numBedrooms}`}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Number of Toilets"
          id="numToilets"
          value={`${formDetails.numToilets}`}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Number of Showers and/or Baths"
          id="numShowersBaths"
          value={`${formDetails.numShowersBaths}`}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Cost, Dollar Amount"
          id="costDollars"
          value={`${formDetails.costDollars}`}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Cost, Cents Amount"
          id="costCents"
          value={`${formDetails.costCents}`}
          required={true}
          classNameCustom="w-full"
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Misc. Notes"
          id="miscNote"
          value={`${formDetails.miscNote}`}
          classNameCustom="w-full"
        />
      </form>
      <div className="px-3">
        <label className="label__text_input_gray">
          Upload some images of the property. At least 1 image is required.
          <span className="text-red-500">*</span>
        </label>
        <MultipleImageUploader
          onImagesUploaded={handleImagesUpload}
          images={formImages}
          setIsChanged={setIsChanged}
        />
      </div>

      <div className="pt-3">
        {/* Save / discard buttons */}
        {isChanged && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleDiscardChanges}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Discard Changes
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UpdatePropertyForm;
