import React, { useState, useEffect } from "react";
import TextInput from "../input/TextInput";
import MultipleImageUploader from "../input/MultipleImageUploader";
import { MAX_COMMUNITY_IMGS_ALLOWED } from "../constants";
import {
  fileArray2OrderedFileArray,
  orderedFileArray2FileArray,
} from "../utils/utils";
import { apiUpdateCommunity } from "../api/community";
import { OrderedFile, Community, CommunityDetails } from "../types/Types";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";

const UpdateCommunityForm: React.FC<{
  community: Community;
  setCommunity: React.Dispatch<React.SetStateAction<Community | null>>;
}> = ({ community, setCommunity }) => {
  // Initialize the update form with the current community object's values
  // that can be updated here.

  const [formDetails, setFormDetails] = useState<CommunityDetails>(
    community.details,
  );
  const [formImages, setFormImages] = useState<OrderedFile[]>(
    fileArray2OrderedFileArray(community.images),
  );
  const [isChanged, setIsChanged] = useState(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    mutate: mutateUpdate,
    isPending: isPendingUpdate,
    isSuccess: isSuccessUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
  } = useMutation({
    mutationFn: (community: Community) => apiUpdateCommunity(community),
  });

  const setErrors = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  const handleDiscardChanges = () => {
    setFormDetails(community.details);
    setFormImages(fileArray2OrderedFileArray(community.images)); // This is cursed.
    setIsChanged(false);
  };

  const textInputSetFormData = (id: string, value: string) => {
    setFormDetails((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleImagesUpload = (files: OrderedFile[]) => {
    // update errors
    if (files.length > MAX_COMMUNITY_IMGS_ALLOWED) {
      setFormImages([]);
      toast.error(
        `Uploaded more than the maximum allowable images (${MAX_COMMUNITY_IMGS_ALLOWED}).`,
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
    // save community details and images and start submission request.
    setCommunity(
      (prevState) =>
        ({
          ...prevState,
          details: formDetails,
          images: orderedFileArray2FileArray(formImages),
        }) as Community,
    );
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

      mutateUpdate(community);
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return (
    <>
      {/* update form */}
      <form className="form__update_community">
        <TextInput
          setFormData={textInputSetFormData}
          setIsChanged={setIsChanged}
          type="text"
          label="Community Name"
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
      </form>
      <div className="px-3">
        <label className="text_input_field_label_gray">
          Upload some images of the community. At least 1 image is required.
          <span className="text-red-500">*</span>
        </label>
        <MultipleImageUploader
          onImagesUploaded={handleImagesUpload}
          images={formImages}
          setIsChanged={setIsChanged}
        />
      </div>

      <div className="pt-3">
        {isPendingUpdate && <p>Updating community...</p>}
        {isSuccessUpdate && <p>Community updated.</p>}
        {isErrorUpdate && (
          <p>Failed to update community. Error: {errorUpdate.message}</p>
        )}

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

export default UpdateCommunityForm;
