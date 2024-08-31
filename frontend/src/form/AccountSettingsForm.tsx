import React, { useState, useEffect } from "react";
import { apiUpdateUserAccountDetails, apiGetUser } from "../api/account";
import InterestsInput from "../input/InterestsInput";
import LocationInput from "../input/LocationInput";
import GenderInput from "../input/GenderInput";
import TextInput from "../input/TextInput";
import ImageInput from "../input/ImageInput";
import { apiFile2ClientFile } from "../utils/utils";
import {
  APIUserReceived,
  OrderedFile,
  User,
  UserDetails,
} from "../types/Types";
import "../styles/form.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TextSkeleton from "../skeleton/TextSkeleton";
import { toast } from "react-toastify";
import { EmptyUser } from "../types/Objects";
import FetchErrorText from "../components/FetchErrorText";
import axios, { AxiosError } from "axios";
import FormButton from "../components/FormButton";
import MultipleImageUploader from "../input/MultipleImageUploader";
import { useGetUserAccountDetails } from "../hooks/account";

const AccountSettingsForm: React.FC = () => {
  const [user, setUser] = useState<User>(EmptyUser);
  const [formData, setFormData] = useState<User>(EmptyUser);
  const [isChanged, setIsChanged] = useState(false);

  // TODO:
  // const [userProfileImages, setUserProfileImages] = useState<OrderedFile[]>([]);

  const userQuery = useGetUserAccountDetails();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ["user", "details"],
    mutationFn: () => apiUpdateUserAccountDetails(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", "details"],
      });
      setUser(formData);
      setIsChanged(false);
    },
    onError: (error: Error | AxiosError) => {
      let errMsg: string = error.message;
      if (axios.isAxiosError(error)) {
        errMsg = `${(error as AxiosError).response?.data}`;
      }
      toast.error(`Failed to update because: ${errMsg}`);
    },
  });

  const textInputSetFormData = (id: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSaveChanges = () => {
    mutation.mutate();
  };

  const handleDiscardChanges = () => {
    setFormData(user);
    setIsChanged(false);
  };

  const handleClearAvatarImage = () => {
    setIsChanged(true);
    setFormData((prevState) => ({
      ...prevState,
      avatar: null,
    }));
  };

  // const handleImagesUploaded = (files: OrderedFile[]) => {
  //   // TODO: update our form data
  // };

  useEffect(() => {
    if (userQuery.status === "success") {
      const userReceived: APIUserReceived = userQuery.data;
      const userDetails: UserDetails = userReceived.userDetails;
      const userAvatar: File | null = apiFile2ClientFile(
        userReceived.avatarImageB64,
      );
      setUser({
        ...userDetails,
        avatar: userAvatar,
      });
      setFormData({
        ...userDetails,
        avatar: userAvatar,
      });
    }
  }, [userQuery.status]);

  const ready: boolean = userQuery.isFetched;

  return (
    <>
      {ready && userQuery.isError && (
        <FetchErrorText>
          Sorry, we couldn{"'"}t fetch your data at this moment. Please try
          again later.
        </FetchErrorText>
      )}
      {ready && userQuery.isSuccess && (
        <form className="form__vertical_inputs">
          {/* First Name */}
          <TextInput
            setFormData={textInputSetFormData}
            setIsChanged={setIsChanged}
            type="text"
            label="First Name"
            id="firstName"
            value={formData.firstName}
            classNameCustom="w-full"
            required={true}
          />

          {/* Last Name */}
          <TextInput
            setFormData={textInputSetFormData}
            setIsChanged={setIsChanged}
            type="text"
            label="Last Name"
            id="lastName"
            value={formData.lastName}
            classNameCustom="w-full"
            required={true}
          />

          {/* Birthdate  */}
          <TextInput
            setFormData={textInputSetFormData}
            setIsChanged={setIsChanged}
            type="date"
            label="Birthdate"
            id="birthDate"
            value={formData.birthDate}
            classNameCustom="w-full"
            required={true}
          />

          {/* Gender */}
          <GenderInput
            formData={formData}
            setFormData={setFormData}
            setIsChanged={setIsChanged}
            classNameCustom="w-full"
            required={true}
          />

          {/* Location */}
          <LocationInput
            formData={formData}
            setFormData={setFormData}
            setIsChanged={setIsChanged}
            required={true}
          />

          {/* Interests */}
          <InterestsInput
            formData={formData}
            setFormData={setFormData}
            setIsChanged={setIsChanged}
            required={true}
          />

          {/* Avatar */}
          <ImageInput
            setFormData={setFormData}
            setIsChanged={setIsChanged}
            label="Avatar Image"
            id="avatar"
            value={formData.avatar}
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

          {/* TODO: */}
          {/* User Profile Images */}
          {/* <div className="input__container">
            <label className="label__text_input_gray">
              Additional User Profile Images, displayed after avatar image.
              (opt.)
            </label>
            <MultipleImageUploader
              images={userProfileImages}
              onImagesUploaded={handleImagesUploaded}
            />
          </div> */}

          {/* Save / discard buttons */}
          {isChanged && (
            <div className="flex justify-end space-x-4">
              <FormButton
                onClick={handleSaveChanges}
                displayText="Save changes"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              />
              <FormButton
                onClick={handleDiscardChanges}
                displayText="Discard Changes"
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              />
            </div>
          )}
        </form>
      )}
      {!ready && <TextSkeleton />}
    </>
  );
};

export default AccountSettingsForm;
