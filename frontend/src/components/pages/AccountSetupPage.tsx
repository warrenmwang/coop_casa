import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { MAX_USER_PROFILE_IMGS_ALLOWED } from "@app/appConstants";
// Components
import Title from "@app/components/Title";
import FormButton from "@app/components/buttons/FormButton";
// Styles

import SubmitButton from "@app/components/buttons/SubmitButton";
import GenderInput from "@app/components/input/GenderInput";
import ImageInput from "@app/components/input/ImageInput";
import InterestsInput from "@app/components/input/InterestsInput";
import LocationInput from "@app/components/input/LocationInput";
import MultipleImageUploader from "@app/components/input/MultipleImageUploader";
import TextInput from "@app/components/input/TextInput";
import TextSkeleton from "@app/components/skeleton/TextSkeleton";
import {
  useGetUserAccountAuth,
  useGetUserAccountDetails,
  useUpdateAccountSettings,
} from "@app/hooks/account";
import { EmptyUser } from "@app/types/Objects";
import {
  APIUserReceived,
  OrderedFile,
  User,
  UserDetails,
} from "@app/types/Types";
import { dashboardPageLink, homePageLink } from "@app/urls";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";
import { validateDate } from "@app/utils/inputValidation";
import { apiFile2ClientFile, isAccountSetup } from "@app/utils/utils";

const AccountSetupPage: React.FC = () => {
  const [formData, setFormData] = useState<User>(EmptyUser);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  ); // if any key value in errors is true, then there is a problem.

  // User Profile Images (opt)
  const [userProfileImages, setUserProfileImages] = useState<OrderedFile[]>([]);

  const userQuery = useGetUserAccountDetails();
  const updateUserAccount = useUpdateAccountSettings();

  const navigate = useNavigate();
  const authQuery = useGetUserAccountAuth();

  const setError = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  // User Profile Images are optional as well.
  const handleImagesUploaded = (files: OrderedFile[]) => {
    // Ensure number of images uploaded < MAX
    if (files.length > MAX_USER_PROFILE_IMGS_ALLOWED) {
      setError("user profile images", true);
      toast.error(
        `Cannot upload more than ${MAX_USER_PROFILE_IMGS_ALLOWED} for profile images.`,
      );
      return;
    }
    setError("user profile images", false);
    setUserProfileImages(files);
  };

  const handleClearAvatarImage = () => {
    setFormData((prevState) => ({
      ...prevState,
      avatar: null,
    }));
  };

  const textInputSetFormData = (id: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDate(formData.birthDate)) {
      toast.error("Please enter a valid birthdate.");
      return;
    }

    // Check for errors
    const hasErrors = Array.from(errors.values()).some((value) => value);
    if (hasErrors) {
      toast.error("Fill out required fields.");
      return;
    }
    // Send update
    setIsSubmitting(true);
    updateUserAccount.mutate(
      { formData, images: userProfileImages.map((image) => image.file) },
      {
        onSuccess: () => {
          toast.success("Account created successfully.");
          navigate(dashboardPageLink);
        },
        onError: mutationErrorCallbackCreator(
          "Unable to setup account, please try again.",
        ),
        onSettled: () => setIsSubmitting(false),
      },
    );
  };

  let authenticated: boolean = false;
  if (authQuery.status === "success") {
    authenticated = authQuery.data as boolean;
  }
  const ready: boolean = authQuery.isFetched;

  // Set interests error to true at first render
  useEffect(() => {
    if (formData.interests.length === 0) {
      setError("interests", true);
    }
  }, []);

  // Retrieve the ID and email
  useEffect(() => {
    if (userQuery.status === "success") {
      const received: APIUserReceived = userQuery.data;
      const userDetails: UserDetails = received.userDetails;
      const avatar: File | null = apiFile2ClientFile(received.avatarImageB64);

      if (isAccountSetup(userDetails)) {
        navigate(dashboardPageLink);
      }

      setFormData({
        ...userDetails,
        avatar: avatar,
      });
    }
  }, [userQuery.status]);

  useEffect(() => {
    if (ready && !authenticated) {
      navigate(homePageLink);
    }
  }, [ready, authenticated]);

  if (!ready) {
    return <TextSkeleton />;
  }

  return (
    <div className="content-body">
      <Title
        title="Account Setup"
        description="Please provide some information about yourself to be able to use this platform and connect with others!"
      />
      <form className="form__vertical_inputs" onSubmit={handleSubmit}>
        {/* First Name */}
        <TextInput
          setFormData={textInputSetFormData}
          setError={setError}
          type="text"
          label="First Name"
          placeholder="Jane"
          id="firstName"
          value={formData.firstName}
          required={true}
          classNameCustom="w-full"
        />

        {/* Last Name */}
        <TextInput
          setFormData={textInputSetFormData}
          setError={setError}
          type="text"
          label="Last Name"
          placeholder="Doe"
          id="lastName"
          value={formData.lastName}
          required={true}
          classNameCustom="w-full"
        />

        {/* Birthdate  */}
        <TextInput
          setFormData={textInputSetFormData}
          setError={setError}
          type="date"
          label="Birthdate"
          placeholder=""
          id="birthDate"
          value={formData.birthDate}
          required={true}
          classNameCustom="w-full"
        />

        {/* Gender */}
        <GenderInput
          value={formData.gender}
          setValue={(newVal: string) =>
            setFormData((prevState) => ({
              ...prevState,
              gender: newVal,
            }))
          }
          setError={setError}
          required={true}
          classNameCustom="w-full"
        />

        {/* Location */}
        <LocationInput
          formData={formData}
          setFormData={setFormData}
          setError={setError}
          required={true}
        />

        {/* Avatar Image */}
        <ImageInput
          setFormData={setFormData}
          setError={setError}
          label="Avatar Image (Max size 5 MiB)"
          id="avatar"
          value={formData.avatar}
          classNameCustom="w-full"
        />
        {/* Clear Image Button */}
        {formData.avatar && (
          <div className="input__container">
            <FormButton
              onClick={handleClearAvatarImage}
              displayText="Clear Avatar Image"
            />
          </div>
        )}

        {/* User Profile Images */}
        <div className="input__container">
          <label className="label__text_input_gray">
            Additional User Profile Images, displayed after avatar image. (opt.)
          </label>
          <MultipleImageUploader
            images={userProfileImages}
            onImagesUploaded={handleImagesUploaded}
          />
        </div>

        {/* Interests Multiple Choice Check Boxes */}
        <InterestsInput
          values={formData.interests}
          setValues={(newVals: string[]) =>
            setFormData((prevState) => ({
              ...prevState,
              interests: newVals,
            }))
          }
          setError={setError}
          required={true}
        />

        {/* Submit Button */}
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
};

export default AccountSetupPage;
