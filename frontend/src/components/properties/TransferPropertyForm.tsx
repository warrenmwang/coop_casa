import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  useTransferAllProperties,
  useTransferProperty,
} from "hooks/properties";
import { validateUserID, validateUUID } from "../../utils/inputValidation";
import FormButton from "../buttons/FormButton";
import SubmitButton from "../buttons/SubmitButton";
import Title from "../Title";
import { mutationErrorCallbackCreator } from "utils/callbacks";
import WizardNavigationButtons from "components/buttons/WizardNavigationButtons";

const TransferPropertyForm: React.FC = () => {
  const [propertyID, setPropertyID] = useState<string>("");
  const [userID, setUserID] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const sections: string[] = ["Some", "All"];
  const [currSection, setCurrSection] = useState<string>(sections[0]);

  const transferSomePropertiesMutation = useTransferProperty();
  const transferAllPropertiesMutation = useTransferAllProperties();

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
    if (!validateUserID(userID)) {
      toast.error("User ID is not a valid id.");
      return;
    }

    if (currSection === "Some") {
      // Validate property id
      if (!validateUUID(propertyID)[1]) {
        toast.error("Property ID is not a valid id.");
        return;
      }

      // Run the mutation to transfer ownership of the identified property to other user
      setIsSubmitting(true);
      transferSomePropertiesMutation.mutate(
        { propertyID, userID },
        {
          onSuccess: () => {
            setPropertyID("");
            setUserID("");
            toast.success("Property ownership transferred.");
          },
          onError: mutationErrorCallbackCreator("Could not transfer property"),
          onSettled: () => setIsSubmitting(false),
        },
      );
    } else {
      // transfer all properties to the other user
      setIsSubmitting(true);
      transferAllPropertiesMutation.mutate(userID, {
        onSuccess: () => {
          setPropertyID("");
          setUserID("");
          toast.success("All properties' ownership transferred.");
        },
        onError: mutationErrorCallbackCreator("Could not transfer properties"),
        onSettled: () => setIsSubmitting(false),
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Title
        title="Transfer Property To Another Person"
        description="You will need the Property ID of a Property you own and the user ID of the person that you want to transfer the Property's ownership to."
      />

      <WizardNavigationButtons
        sections={sections}
        currentSection={currSection}
        handleClick={(e) =>
          setCurrSection(e.currentTarget.textContent as string)
        }
      />

      <form onSubmit={handleFormSubmit}>
        {currSection === "Some" && (
          <>
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
          </>
        )}
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
