import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTransferCommunity } from "hooks/communities";
import { validateUserID, validateUUID } from "../../utils/inputValidation";
import SubmitButton from "../buttons/SubmitButton";
import Title from "../Title";
import FormButton from "../buttons/FormButton";

const TransferCommunityForm: React.FC = () => {
  const [communityID, setCommunityID] = useState<string>("");
  const [userID, setUserID] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const mutation = useTransferCommunity();

  const handleInputCommunityID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCommunityID(value.trim());
  };

  const handleInputUserID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserID(value.trim());
  };

  const clearform = () => {
    setCommunityID("");
    setUserID("");
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateUUID(communityID)[1]) {
      toast.error("Community ID is not a valid id.");
      return;
    }

    if (!validateUserID(userID)) {
      toast.error("User ID is not a valid id.");
      return;
    }

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
          toast.error("Could not transfer community because: " + errMsg);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-center">
      <Title
        title="Transfer Community To Another Person"
        description="You will need the community ID of a community you own and the user ID of the person that you want to transfer the community's ownership to."
      />

      <form onSubmit={handleFormSubmit}>
        <label htmlFor="communityid" className="label__text_input_gray">
          Community ID
        </label>
        <input
          id="communityid"
          type="text"
          value={communityID}
          onChange={handleInputCommunityID}
          className="input__text_gray_box"
        />
        <label htmlFor="userid" className="label__text_input_gray">
          User ID
        </label>
        <input
          id="userid"
          type="text"
          value={userID}
          onChange={handleInputUserID}
          className="input__text_gray_box"
        />
        <div className="flex gap-2">
          <SubmitButton isSubmitting={isSubmitting} />
          <FormButton onClick={clearform} color="gray" displayText="Clear" />
        </div>
      </form>
    </div>
  );
};

export default TransferCommunityForm;
