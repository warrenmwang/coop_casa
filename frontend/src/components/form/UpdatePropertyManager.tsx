import React, { useState, useEffect } from "react";
import SubmitButton from "../buttons/SubmitButton";
import { validate as uuidValidate } from "uuid";
import { apiGetProperty } from "../../api/property";
import { Property } from "../../types/Types";

import { toast } from "react-toastify";
import UpdatePropertyForm from "./UpdatePropertyForm";
import { useDeleteProperty } from "hooks/properties";
import axios, { AxiosError } from "axios";

const UpdatePropertyManager: React.FC = () => {
  const [getPropertyDetailsIsSubmitting, setGetPropertyDetailsIsSubmitting] =
    useState(false);
  const [propertyID, setPropertyID] = useState<string>("");
  const [property, setProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const getPropertyDetails = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(propertyID)) {
      toast.error("Not a valid property ID.");
      return;
    }

    setGetPropertyDetailsIsSubmitting(true);
  };

  const deleteProperty = useDeleteProperty();

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(propertyID)) {
      toast.error("Not a valid property ID.");
      return;
    }
    setIsDeleting(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setPropertyID(e.target.value.trim());
  };

  const clearForm = (e: React.FormEvent) => {
    e.preventDefault();
    setPropertyID("");
    setProperty(null);
  };

  // TODO: refactor to use react query !
  useEffect(() => {
    const foo = async () => {
      // get the property data using the propertID
      try {
        const property = await apiGetProperty(propertyID);
        setProperty(property);
      } catch (err) {
        toast.error(`Error in getting requested property: ${err}`);
      }
      setGetPropertyDetailsIsSubmitting(false);
    };
    if (getPropertyDetailsIsSubmitting) {
      foo();
    }
  }, [getPropertyDetailsIsSubmitting]);

  useEffect(() => {
    if (isDeleting) {
      deleteProperty.mutate(
        { propertyID },
        {
          onSuccess: () => {
            setPropertyID("");
            setProperty(null);
            toast.success("Deleted property.");
          },
          onError: (error: Error | AxiosError) => {
            let errMsg: string = error.message;
            if (axios.isAxiosError(error)) {
              errMsg = `${(error as AxiosError).response?.data}`;
            }
            toast.error(`Failed to update because: ${errMsg}`);
          },
          onSettled() {
            setIsDeleting(false);
          },
        },
      );
    }
  }, [isDeleting]);

  return (
    <div className="">
      <div className="px-3">
        <h1 className="h1_custom">Update Property</h1>
        <h4 className="h4_custom">
          This form allows you to update an existing property listing owned by
          you. You will need the specific property{"'"}s ID.
        </h4>
        {/* query property data form */}
        <form className="" onSubmit={getPropertyDetails}>
          <div className="flex flex-col">
            <label className="label__text_input_gray">
              Get property details via ID.
            </label>
            <input
              type="text"
              id="getPropertyDetails"
              placeholder="Property ID"
              value={propertyID}
              onChange={handleChange}
              className="input__text_gray_box w-full"
            />
          </div>
          <div className="flex gap-2">
            {property === null && (
              <SubmitButton isSubmitting={getPropertyDetailsIsSubmitting} />
            )}
            <button id="clear" className="button__gray" onClick={clearForm}>
              Clear Form
            </button>
            <button
              id="delete"
              className="button__red"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Property"}
            </button>
          </div>
        </form>
      </div>

      {property !== null && (
        <UpdatePropertyForm property={property} setProperty={setProperty} />
      )}
    </div>
  );
};

export default UpdatePropertyManager;
