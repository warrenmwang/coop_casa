import React, { useState, useEffect } from "react";
import SubmitButton from "./SubmitButton";
import { validate as uuidValidate } from "uuid";
import { apiGetProperty } from "../../api/api";
import { Property } from "./CreatePropertyForm";
import TextInput from "./TextInput";
import MultipleImageUploader from "./MultipleImageUploader";
import { MAX_PROPERTY_IMGS_ALLOWED } from "../../constants";

const UpdatePropertyForm: React.FC<{
  property: Property;
  setProperty: React.Dispatch<React.SetStateAction<Property | null>>;
}> = ({ property, setProperty }) => {
  // ------------- For Updating the property details
  const [formData, setFormData] = useState<Property>(property);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setErrors = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  const handleSaveChanges = async () => {
    // manipulate the (images: File[]) into a (images: string)

    setProperty(property);
    setIsSubmitting(true);
  };

  const handleDiscardChanges = () => {
    setFormData(property);
    setIsChanged(false);
  };

  const textInputSetFormData = (id: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleImagesUpload = (files: File[]) => {
    // update errors
    if (files.length > MAX_PROPERTY_IMGS_ALLOWED) {
      setImages([]);
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
    setImages(files);
  };

  useEffect(() => {
    if (isSubmitting) {
      // submit the data to the backend
      // TODO: update the property by hitting POST /api/properties endpoint
      // with the property data in the body

      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return (
    <>
      {/* update form */}
      <form className="default-form-1">
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Property Name"
          id="name"
          value={formData.name}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Description"
          id="description"
          value={formData.description}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Address 1"
          id="address1"
          value={formData.address1}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Address 2"
          id="address2"
          value={formData.address2}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="City"
          id="city"
          value={formData.city}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="State"
          id="state"
          value={formData.state}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Zipcode"
          id="zipcode"
          value={formData.zipcode}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Country"
          id="country"
          value={formData.country}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Square Feet"
          id="squareFeet"
          value={`${formData.squareFeet}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Number of Bedrooms"
          id="numBedrooms"
          value={`${formData.numBedrooms}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Number of Toilets"
          id="numToilets"
          value={`${formData.numToilets}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Number of Showers and/or Baths"
          id="numShowersBaths"
          value={`${formData.numShowersBaths}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Cost, Dollar Amount"
          id="costDollars"
          value={`${formData.costDollars}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="number"
          label="Cost, Cents Amount"
          id="costCents"
          value={`${formData.costCents}`}
          required={true}
        />
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Misc. Notes"
          id="miscNote"
          value={`${formData.miscNote}`}
        />
      </form>
      <MultipleImageUploader
        onImagesUploaded={handleImagesUpload}
        imageFiles={images}
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

  const getPropertyDetails = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(propertyID)) {
      alert("Not a valid property ID.");
      return;
    }

    setGetPropertyDetailsIsSubmitting(true);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setPropertyID(e.target.value);
  };

  useEffect(() => {
    const foo = async () => {
      if (getPropertyDetailsIsSubmitting) {
        // get the property data using the propertID
        try {
          const property = await apiGetProperty(propertyID);
          setProperty(property);
        } catch (err) {
          alert(`Error in getting requested property: ${err}`);
        }
        setGetPropertyDetailsIsSubmitting(false);
      }
    };
    foo();
  }, [getPropertyDetailsIsSubmitting]);

  return (
    <div className="mx-auto">
      <h1 className="h1_custom">Update Property</h1>
      {/* query property data form */}
      <form onSubmit={getPropertyDetails}>
        <label>Get property details via ID.</label>
        <div className="flex col-span-2">
          <input
            type="text"
            id="getPropertyDetails"
            placeholder="Property ID"
            value={propertyID}
            onChange={handleChange}
            className="text_input_field_box_gray"
          />
          <SubmitButton isSubmitting={getPropertyDetailsIsSubmitting} />
        </div>
      </form>
      {property !== null && (
        <UpdatePropertyForm property={property} setProperty={setProperty} />
      )}
    </div>
  );
};

export default UpdatePropertyManager;
