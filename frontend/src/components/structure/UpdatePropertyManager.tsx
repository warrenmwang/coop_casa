import React, { useState, useEffect } from "react";
import SubmitButton from "./SubmitButton";
import { validate as uuidValidate } from "uuid";
import {
  apiDeleteProperty,
  apiGetProperty,
  apiUpdateProperty,
} from "../../api/api";
import { OrderedFile, Property, PropertyDetails } from "../../types/Types";
import TextInput from "./TextInput";
import MultipleImageUploader from "./MultipleImageUploader";
import { MAX_PROPERTY_IMGS_ALLOWED } from "../../constants";
import { useMutation } from "@tanstack/react-query";
import { validateNumber } from "../../utils/inputValidation";

const UpdatePropertyForm: React.FC<{
  property: Property;
  setProperty: React.Dispatch<React.SetStateAction<Property | null>>;
}> = ({ property, setProperty }) => {
  // ------------- For Updating the property details
  const [formDetails, setFormDetails] = useState<PropertyDetails>(
    property.details,
  );
  const [formImages, setFormImages] = useState<OrderedFile[]>(property.images);
  const [isChanged, setIsChanged] = useState(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    mutate: updateMutate,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (property: Property) => apiUpdateProperty(property),
  });

  const handleDelete = async () => {};

  const setErrors = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  const handleSaveChanges = async () => {
    // ensure no errors
    for (let key of errors.keys()) {
      if (errors.get(key)) {
        alert(`Resolve error in field "${key}" first before submitting.`);
        return;
      }
    }

    // save property details and images and start submission request.
    setProperty((prevState) => ({
      ...prevState,
      details: formDetails,
      images: formImages,
    }));
    setIsSubmitting(true);
  };

  const handleDiscardChanges = () => {
    setFormDetails(property.details);
    setFormImages(property.images);
    setIsChanged(false);
  };

  const textInputSetFormData = (id: string, value: string) => {
    // need to convert the text input type=number values
    // from variable type string into number
    var numberValue: number;
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
      setErrors(id, false);

      // convert to number and save value
      numberValue = Number(value);
      setFormDetails((prevState) => ({
        ...prevState,
        [id]: numberValue,
      }));
      return;
    }

    // text value
    setErrors(id, false);
    setFormDetails((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleImagesUpload = (files: OrderedFile[]) => {
    // update errors
    if (files.length > MAX_PROPERTY_IMGS_ALLOWED) {
      setFormImages([]);
      alert(
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

  useEffect(() => {
    if (isSubmitting) {
      updateMutate(property);
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return (
    <>
      {isPending && <p>Updating property...</p>}
      {isSuccess && <p>Property updated.</p>}
      {/* update form */}
      <form className="default-form-1">
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Property Name"
          id="name"
          value={formDetails.name}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Description"
          id="description"
          value={formDetails.description}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Address 1"
          id="address1"
          value={formDetails.address1}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Address 2"
          id="address2"
          value={formDetails.address2}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="City"
          id="city"
          value={formDetails.city}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="State"
          id="state"
          value={formDetails.state}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Zipcode"
          id="zipcode"
          value={formDetails.zipcode}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Country"
          id="country"
          value={formDetails.country}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Square Feet"
          id="squareFeet"
          value={`${formDetails.squareFeet}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Number of Bedrooms"
          id="numBedrooms"
          value={`${formDetails.numBedrooms}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Number of Toilets"
          id="numToilets"
          value={`${formDetails.numToilets}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Number of Showers and/or Baths"
          id="numShowersBaths"
          value={`${formDetails.numShowersBaths}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Cost, Dollar Amount"
          id="costDollars"
          value={`${formDetails.costDollars}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Cost, Cents Amount"
          id="costCents"
          value={`${formDetails.costCents}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Misc. Notes"
          id="miscNote"
          value={`${formDetails.miscNote}`}
        />
      </form>
      <label className="text_input_field_label_gray">
        Upload some images of the property. At least 1 image is required.
        <span className="text-red-500">*</span>
      </label>
      <MultipleImageUploader
        onImagesUploaded={handleImagesUpload}
        images={formImages}
        setIsChanged={setIsChanged}
      />

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
    </>
  );
};

const UpdatePropertyManager: React.FC = () => {
  // ------------ For Getting the property details
  const [getPropertyDetailsIsSubmitting, setGetPropertyDetailsIsSubmitting] =
    useState(false);
  const [propertyID, setPropertyID] = useState<string>("");
  const [property, setProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const getPropertyDetails = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(propertyID)) {
      alert("Not a valid property ID.");
      return;
    }

    setGetPropertyDetailsIsSubmitting(true);
  };

  const {
    mutate: deleteMutate,
    isPending: isPendingDeletion,
    isSuccess: isDeletionSuccess,
  } = useMutation({
    mutationFn: (propertyID: string) => apiDeleteProperty(propertyID),
  });

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(propertyID)) {
      alert("Not a valid property ID.");
      return;
    }
    setIsDeleting(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setPropertyID(e.target.value);
  };

  const clearForm = (e: React.FormEvent) => {
    e.preventDefault();
    setPropertyID("");
    setProperty(null);
  };

  useEffect(() => {
    const foo = async () => {
      // get the property data using the propertID
      try {
        const property = await apiGetProperty(propertyID);
        setProperty(property);
      } catch (err) {
        alert(`Error in getting requested property: ${err}`);
      }
      setGetPropertyDetailsIsSubmitting(false);
    };
    if (getPropertyDetailsIsSubmitting) {
      foo();
    }
  }, [getPropertyDetailsIsSubmitting]);

  useEffect(() => {
    if (isDeleting) {
      deleteMutate(propertyID);
      setPropertyID("");
      setProperty(null);
      setIsDeleting(false);
    }
  }, [isDeleting]);

  return (
    <div className="w-1/2 mx-auto">
      <h1 className="h1_custom">Update Property</h1>
      {/* query property data form */}
      <form className="" onSubmit={getPropertyDetails}>
        <div className="flex flex-col">
          <label className="text_input_field_label_gray">
            Get property details via ID.
          </label>
          <input
            type="text"
            id="getPropertyDetails"
            placeholder="Property ID"
            value={propertyID}
            onChange={handleChange}
            className="text_input_field_box_gray w-3/5"
          />
        </div>
        <div className="flex gap-2">
          <SubmitButton isSubmitting={getPropertyDetailsIsSubmitting} />
          <button
            id="clear"
            className="bg-gray-500 hover:bg-gray-600 text-white rounded p-3"
            onClick={clearForm}
          >
            Clear
          </button>
          <button
            id="delete"
            className="bg-red-500 hover:bg-red-600 rounded p-3"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </form>
      {isDeleting ? (
        isPendingDeletion ? (
          <p>Deleting property...</p>
        ) : isDeletionSuccess ? (
          <p>Deleted.</p>
        ) : (
          <p>Couldn't delete property. Try again.</p>
        )
      ) : (
        <></>
      )}
      {property !== null && (
        <UpdatePropertyForm property={property} setProperty={setProperty} />
      )}
    </div>
  );
};

export default UpdatePropertyManager;
