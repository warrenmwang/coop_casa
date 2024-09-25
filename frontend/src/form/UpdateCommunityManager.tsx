import React, { useState, useEffect } from "react";
import SubmitButton from "../components/buttons/SubmitButton";
import { validate as uuidValidate } from "uuid";
import { Community } from "../types/Types";

import { toast } from "react-toastify";
import UpdateCommunityForm from "./UpdateCommunityForm";
import { useDeleteCommunity } from "../hooks/communities";
import axios, { AxiosError } from "axios";
import { apiGetCommunity } from "../api/community";

const UpdateCommunityManager: React.FC = () => {
  // ------------ For Getting the community details
  const [getCommunityDetailsIsSubmitting, setGetCommunityDetailsIsSubmitting] =
    useState(false);
  const [communityID, setCommunityID] = useState<string>("");
  const [community, setCommunity] = useState<Community | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const getCommunityDetails = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(communityID)) {
      toast.error("Not a valid community ID.");
      return;
    }

    setGetCommunityDetailsIsSubmitting(true);
  };

  const deleteCommunity = useDeleteCommunity();

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
    setCommunityID(e.target.value.trim());
  };

  const clearForm = (e: React.FormEvent) => {
    e.preventDefault();
    setCommunityID("");
    setCommunity(null);
  };

  // TODO: refactor me to use react query !
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
      deleteCommunity.mutate(
        { communityID },
        {
          onSuccess: () => {
            setCommunityID("");
            setCommunity(null);
            toast.success("Deleted community.");
          },
          onError: (error: Error | AxiosError) => {
            let errMsg: string = error.message;
            if (axios.isAxiosError(error)) {
              errMsg = `${(error as AxiosError).response?.data}`;
            }
            toast.error(`Failed to delete because: ${errMsg}`);
          },
          onSettled: () => {
            setIsDeleting(false);
          },
        },
      );
    }
  }, [isDeleting]);

  return (
    <div className="">
      <div className="px-3">
        <h1 className="h1_custom">Update Community</h1>
        <h4 className="h4_custom">
          This form allows you to update an existing community listing owned by
          you. You will need the specific community{"'"}s ID.
        </h4>
        {/* query community data form */}
        <form className="" onSubmit={getCommunityDetails}>
          <div className="flex flex-col">
            <label className="label__text_input_gray">
              Get community details via ID.
            </label>
            <input
              type="text"
              id="getCommunityDetails"
              placeholder="Community ID"
              value={communityID}
              onChange={handleChange}
              className="input__text_gray_box w-full"
            />
          </div>
          <div className="flex gap-2">
            {community === null && (
              <SubmitButton isSubmitting={getCommunityDetailsIsSubmitting} />
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
              {isDeleting ? "Deleting..." : "Delete Community"}
            </button>
          </div>
        </form>
      </div>

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
