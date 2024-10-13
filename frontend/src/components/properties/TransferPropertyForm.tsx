import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTransferProperty } from "hooks/properties";
import { validateUserID, validateUUID } from "../../utils/inputValidation";
import FormButton from "../buttons/FormButton";
import SubmitButton from "../buttons/SubmitButton";
import Title from "../Title";

const TransferPropertyForm: React.FC = () => {
  const [propertyID, setPropertyID] = useState<string>("");
  const [userID, setUserID] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const mutation = useTransferProperty();

  const handleInputPropertyID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPropertyID(value.trim());
  };

  const handleInputUserID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserID(value.trim());
  };

  const clearform = () => {
    setPropertyID("");
    setUserID("");
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateUUID(propertyID)[1]) {
      toast.error("Property ID is not a valid id.");
      return;
    }

    if (!validateUserID(userID)) {
      toast.error("User ID is not a valid id.");
      return;
    }

    // Run the mutation to transfer ownership of Property to other user
    setIsSubmitting(true);
    mutation.mutate(
      { propertyID, userID },
      {
        onSuccess: () => {
          setPropertyID("");
          setUserID("");
          toast.success("Property ownership transferred.");
        },
        onError: (error: Error | AxiosError) => {
          let errMsg: string = error.message;
          if (axios.isAxiosError(error)) {
            errMsg = `${(error as AxiosError).response?.data}`;
          }
          toast.error("Could not transfer Property because: " + errMsg);
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
        title="Transfer Property To Another Person"
        description="You will need the Property ID of a Property you own and the user ID of the person that you want to transfer the Property's ownership to."
      />

      <form onSubmit={handleFormSubmit}>
        <label htmlFor="propertyid" className="label__text_input_gray">
          Property ID
        </label>
        <input
          id="propertyid"
          type="text"
          value={propertyID}
          onChange={handleInputPropertyID}
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

export default TransferPropertyForm;
