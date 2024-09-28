import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTransferCommunity } from "../../hooks/communities";
import { validateUUID } from "../../utils/inputValidation";
import SubmitButton from "../buttons/SubmitButton";
import Title from "../Title";

const TransferCommunityForm: React.FC = () => {
  const [communityID, setCommunityID] = useState<string>("");
  const [userID, setUserID] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const mutation = useTransferCommunity();

  const handleInputCommunityID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const valueTrimmed = value.trim();
    if (valueTrimmed) {
      setCommunityID(valueTrimmed);
    }
  };

  const handleInputUserID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const valueTrimmed = value.trim();
    if (valueTrimmed) {
      setUserID(valueTrimmed);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateUUID(communityID)[1])
      toast.error("Community ID is not a valid UUID.");
    if (!validateUUID(userID)[1]) toast.error("User ID is not a valid UUID.");

    // Run the mutation to transfer ownership of community to other user
    setIsSubmitting(true);
    mutation.mutate(
      { communityID, userID },
      {
        onSuccess: () => {
          setCommunityID("");
          setUserID("");
          toast.success("Community ownership transferred.");
        },
        onError: (error: Error | AxiosError) => {
          let errMsg: string = error.message;
          if (axios.isAxiosError(error)) {
            errMsg = `${(error as AxiosError).response?.data}`;
          }
          toast.error("Could not create community because: " + errMsg);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <>
      <Title
        title="Transfer Community To Another Person"
        description="You will need the community ID of a community you own and the user ID of the person that you want to transfer the community's ownership to."
      />

      <form onSubmit={handleFormSubmit}>
        <label htmlFor="communityid">Community ID</label>
        <input
          id="communityid"
          type="text"
          value={communityID}
          onChange={handleInputCommunityID}
        />
        <label htmlFor="userid">User ID</label>
        <input
          id="userid"
          type="text"
          value={userID}
          onChange={handleInputUserID}
        />
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </>
  );
};

export default TransferCommunityForm;
