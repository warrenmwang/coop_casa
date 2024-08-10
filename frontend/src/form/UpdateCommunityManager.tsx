import React, { useState, useEffect } from "react";
import SubmitButton from "../components/SubmitButton";
import { validate as uuidValidate } from "uuid";
import {
  apiDeleteCommunity,
  apiGetCommunity,
  apiUpdateCommunity,
} from "../api/api";
import { OrderedFile, Community, CommunityDetails } from "../types/Types";
import TextInput from "../input/TextInput";
import MultipleImageUploader from "../input/MultipleImageUploader";
import { MAX_COMMUNITY_IMGS_ALLOWED } from "../constants";
import { useMutation } from "@tanstack/react-query";
import { validateNumber } from "../utils/inputValidation";
import "../styles/input.css";
import { toast } from "react-toastify";
import {
  fileArray2OrderedFileArray,
  orderedFileArray2FileArray,
} from "../utils/utils";

// const communityRequiredFields: string[] = [
//   "name",
//   "address1",
//   "city",
//   "state",
//   "zipcode",
//   "country",
//   "squareFeet",
//   "numBedrooms",
//   "numToilets",
//   "numShowersBaths",
//   "costDollars",
//   "costCents",
//   "images",
// ];

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
      for (let key of errors.keys()) {
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

const UpdateCommunityManager: React.FC = () => {
  // ------------ For Getting the community details
  const [getCommunityDetailsIsSubmitting, setGetCommunityDetailsIsSubmitting] =
    useState(false);
  const [communityID, setCommunityID] = useState<string>("");
  const [community, setCommunity] = useState<Community | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [inputChanged, setInputChanged] = useState<boolean>(false);

  const getCommunityDetails = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(communityID)) {
      toast.error("Not a valid community ID.");
      return;
    }

    setGetCommunityDetailsIsSubmitting(true);
  };

  const {
    mutate: mutateDelete,
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
    isError: isErrorDelete,
    error: errorDelete,
  } = useMutation({
    mutationFn: (communityID: string) => apiDeleteCommunity(communityID),
  });

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(communityID)) {
      toast.error("Not a valid community ID.");
      return;
    }
    setIsDeleting(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setInputChanged(true);
    setCommunityID(e.target.value);
  };

  const clearForm = (e: React.FormEvent) => {
    e.preventDefault();
    setCommunityID("");
    setCommunity(null);
  };

  useEffect(() => {
    const foo = async () => {
      // get the community data using the propertID
      try {
        const community = await apiGetCommunity(communityID);
        setCommunity(community);
      } catch (err) {
        toast.error(`Error in getting requested community: ${err}`);
      }
      setGetCommunityDetailsIsSubmitting(false);
    };
    if (getCommunityDetailsIsSubmitting) {
      foo();
    }
  }, [getCommunityDetailsIsSubmitting]);

  useEffect(() => {
    if (isDeleting) {
      setInputChanged(false);
      mutateDelete(communityID);
      setCommunityID("");
      setCommunity(null);
      setIsDeleting(false);
    }
  }, [isDeleting]);

  return (
    <div className="">
      <div className="px-3">
        <h1 className="h1_custom">Update Community</h1>
        <h4 className="h4_custom">
          This form allows you to update an existing community listing owned by
          you. You will need the specific community's ID.
        </h4>
        {/* query community data form */}
        <form className="" onSubmit={getCommunityDetails}>
          <div className="flex flex-col">
            <label className="text_input_field_label_gray">
              Get community details via ID.
            </label>
            <input
              type="text"
              id="getCommunityDetails"
              placeholder="Community ID"
              value={communityID}
              onChange={handleChange}
              className="text_input_field_box_gray w-full"
            />
          </div>
          <div className="flex gap-2">
            {community === null && (
              <SubmitButton isSubmitting={getCommunityDetailsIsSubmitting} />
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
              Delete Community
            </button>
          </div>
        </form>
      </div>

      {!inputChanged && isPendingDelete && <p>Deleting community...</p>}
      {!inputChanged && isSuccessDelete && <p>Community deleted.</p>}
      {!inputChanged && isErrorDelete && (
        <p>Couldn't delete community. Try again. {errorDelete.message}</p>
      )}

      {community !== null && (
        <UpdateCommunityForm
          community={community}
          setCommunity={setCommunity}
        />
      )}
    </div>
  );
};

export default UpdateCommunityManager;
