import React, { useState, useEffect } from "react";
import SubmitButton from "../components/SubmitButton";
import { validate as uuidValidate } from "uuid";
import { apiDeleteProperty, apiGetProperty } from "../api/property";
import { Property } from "../types/Types";
import { useMutation } from "@tanstack/react-query";
import "../styles/input.css";
import { toast } from "react-toastify";
import UpdatePropertyForm from "./UpdatePropertyForm";

const UpdatePropertyManager: React.FC = () => {
  // ------------ For Getting the property details
  const [getPropertyDetailsIsSubmitting, setGetPropertyDetailsIsSubmitting] =
    useState(false);
  const [propertyID, setPropertyID] = useState<string>("");
  const [property, setProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [inputChanged, setInputChanged] = useState<boolean>(false);

  const getPropertyDetails = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(propertyID)) {
      toast.error("Not a valid property ID.");
      return;
    }

    setGetPropertyDetailsIsSubmitting(true);
  };

  const {
    mutate: mutateDelete,
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
    isError: isErrorDelete,
    error: errorDelete,
  } = useMutation({
    mutationFn: (propertyID: string) => apiDeleteProperty(propertyID),
  });

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
    setInputChanged(true);
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
      setInputChanged(false);
      mutateDelete(propertyID);
      setPropertyID("");
      setProperty(null);
      setIsDeleting(false);
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
            <button
              id="clear"
              className="bg-gray-500 hover:bg-gray-600 text-white rounded p-3"
              onClick={clearForm}
            >
              Clear Form
            </button>
            <button
              id="delete"
              className="bg-red-500 hover:bg-red-600 rounded p-3"
              onClick={handleDelete}
            >
              Delete Property
            </button>
          </div>
        </form>
      </div>

      {!inputChanged && isPendingDelete && <p>Deleting property...</p>}
      {!inputChanged && isSuccessDelete && <p>Property deleted.</p>}
      {!inputChanged && isErrorDelete && (
        <p>
          Couldn{"'"}t delete property. Try again. {errorDelete.message}
        </p>
      )}

      {property !== null && (
        <UpdatePropertyForm property={property} setProperty={setProperty} />
      )}
    </div>
  );
};

export default UpdatePropertyManager;
