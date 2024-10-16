import React, { useState, useEffect } from "react";
import SubmitButton from "../buttons/SubmitButton";
import { validate as uuidValidate } from "uuid";
import { apiGetProperty } from "../../api/property";
import { Property } from "../../types/Types";

import { toast } from "react-toastify";
import UpdatePropertyForm from "./UpdatePropertyForm";
import { useDeleteProperty } from "hooks/properties";
import { mutationErrorCallbackCreator } from "utils/callbacks";
import { useQuery } from "@tanstack/react-query";
import { propertiesKey } from "reactQueryKeys";

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
  const propertyQuery = useQuery({
    queryKey: [...propertiesKey, propertyID],
    queryFn: () => apiGetProperty(propertyID),
    enabled: getPropertyDetailsIsSubmitting,
  });

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(propertyID)) {
      toast.error("Not a valid property ID.");
      return;
    }
    setIsDeleting(true);
    deleteProperty.mutate(
      { propertyID },
      {
        onSuccess: () => {
          setPropertyID("");
          setProperty(null);
          toast.success("Deleted property.");
        },
        onError: mutationErrorCallbackCreator("Unable to delete property"),
        onSettled: () => setIsDeleting(false),
      },
    );
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

  useEffect(() => {
    if (propertyQuery.status === "success" && propertyQuery.data) {
      setProperty(propertyQuery.data);
    } else if (propertyQuery.status === "error") {
      toast.error(
        `Error in getting requested property: ${propertyQuery.error.message}`,
      );
    }
  }, [propertyQuery.status]);

  return (
    <div className="flex flex-col items-center">
      <div className="px-3">
        <h1 className="h1_custom">Update Property</h1>
        <h4 className="h4_custom">
          This form allows you to update an existing property listing owned by
          you. You will need the specific property{"'"}s ID.
        </h4>
        {/* query property data form */}
        <form className="form__vertical_inputs" onSubmit={getPropertyDetails}>
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
