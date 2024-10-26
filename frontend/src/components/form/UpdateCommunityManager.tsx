import React, { useState, useEffect } from "react";
import SubmitButton from "@app/components/buttons/SubmitButton";
import { validate as uuidValidate } from "uuid";
import { Community } from "@app/types/Types";

import { toast } from "react-toastify";
import UpdateCommunityForm from "@app/components/form/UpdateCommunityForm";
import { useDeleteCommunity } from "@app/hooks/communities";
import { apiGetCommunity } from "@app/api/community";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";
import { useQuery } from "@tanstack/react-query";
import { communitiesKey } from "@app/reactQueryKeys";

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
  const communityQuery = useQuery({
    queryKey: [...communitiesKey, communityID],
    queryFn: () => apiGetCommunity(communityID),
    enabled: getCommunityDetailsIsSubmitting,
  });

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure is a valid uuid
    if (!uuidValidate(communityID)) {
      toast.error("Not a valid community ID.");
      return;
    }
    setIsDeleting(true);
    deleteCommunity.mutate(
      { communityID },
      {
        onSuccess: () => {
          setCommunityID("");
          setCommunity(null);
          toast.success("Deleted community.");
        },
        onError: mutationErrorCallbackCreator("Failed to delete"),
        onSettled: () => setIsDeleting(false),
      },
    );
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

  useEffect(() => {
    if (communityQuery.status === "success" && communityQuery.data) {
      setCommunity(communityQuery.data);
    } else if (communityQuery.status === "error") {
      toast.error(
        `Error in getting requested community: ${communityQuery.error.message}`,
      );
    }
  }, [communityQuery.status]);

  return (
    <div className="flex flex-col items-center">
      <div className="px-3">
        <h1 className="h1_custom">Update Community</h1>
        <h4 className="h4_custom">
          This form allows you to update an existing community listing owned by
          you. You will need the specific community{"'"}s ID.
        </h4>
        {/* query community data form */}
        <form className="form__vertical_inputs" onSubmit={getCommunityDetails}>
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
