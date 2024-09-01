// React
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Title from "../components/Title";
import {
  APIUserReceived,
  OrderedFile,
  User,
  UserDetails,
} from "../types/Types";
import { apiUpdateUserAccountDetailsAndProfileImages } from "../api/account";
import LocationInput from "../input/LocationInput";
import InterestsInput from "../input/InterestsInput";
import GenderInput from "../input/GenderInput";
import TextInput from "../input/TextInput";
import ImageInput from "../input/ImageInput";
import { EmptyUser } from "../types/Objects";

// Styles
import "../styles/form.css";
import "../styles/contentBody.css";
import SubmitButton from "../components/buttons/SubmitButton";
import { dashboardPageLink } from "../urls";
import { useMutation } from "@tanstack/react-query";
import TextSkeleton from "../skeleton/TextSkeleton";
import { apiFile2ClientFile } from "../utils/utils";

import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import MultipleImageUploader from "../input/MultipleImageUploader";
import { MAX_USER_PROFILE_IMGS_ALLOWED } from "../constants";
import FormButton from "../components/buttons/FormButton";
import { useGetUserAccountDetails } from "../hooks/account";
import { userDetailsKey } from "../reactQueryKeys";

const AccountSetupPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<User>(EmptyUser);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  ); // if any key value in errors is true, then there is a problem.

  // User Profile Images (opt)
  const [userProfileImages, setUserProfileImages] = useState<OrderedFile[]>([]);

  // need to get user's to get the id and email
  const userQuery = useGetUserAccountDetails();

  const mutation = useMutation({
    mutationKey: userDetailsKey,
    mutationFn: () =>
      apiUpdateUserAccountDetailsAndProfileImages(
        formData,
        userProfileImages.map((image) => image.file),
      ),
    onSuccess: () => {
      navigate(dashboardPageLink);
    },
    onError: (error: Error | AxiosError) => {
      // try to use help text about error if provided by backend
      let errMsg: string = error.message;
      if (axios.isAxiosError(error)) {
        errMsg = `${(error as AxiosError).response?.data}`;
      }
      toast.error(`Unable to setup account due to reason: ${errMsg}.`);
    },
  });

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
    // Check for errors
    const hasErrors = Array.from(errors.values()).some((value) => value);
    if (hasErrors) {
      toast.error("Fill out required fields.");
      return;
    }
    // Send update
    setIsSubmitting(true);
    mutation.mutate();
  };

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
      setFormData({
        ...userDetails,
        avatar: avatar,
      });
    }
  }, [userQuery.status]);

  const ready: boolean = userQuery.isFetched && formData.userId !== "";
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
        <div>
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
            formData={formData}
            setFormData={setFormData}
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
              Additional User Profile Images, displayed after avatar image.
              (opt.)
            </label>
            <MultipleImageUploader
              images={userProfileImages}
              onImagesUploaded={handleImagesUploaded}
            />
          </div>

          {/* Interests Multiple Choice Check Boxes */}
          <InterestsInput
            formData={formData}
            setFormData={setFormData}
            setError={setError}
            required={true}
          />
        </div>

        {/* Submit Button */}
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
};

export default AccountSetupPage;
