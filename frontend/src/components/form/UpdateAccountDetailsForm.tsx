import React, { useState, useEffect } from "react";
import InterestsInput from "../input/InterestsInput";
import LocationInput from "../input/LocationInput";
import GenderInput from "../input/GenderInput";
import TextInput from "../input/TextInput";
import ImageInput from "../input/ImageInput";
import { apiFile2ClientFile, isAccountSetup } from "../../utils/utils";
import {
  APIUserReceived,
  OrderedFile,
  User,
  UserDetails,
} from "../../types/Types";

import TextSkeleton from "components/skeleton/TextSkeleton";
import { toast } from "react-toastify";
import { EmptyUser } from "types/Objects";
import FetchErrorText from "../FetchErrorText";
import axios, { AxiosError } from "axios";
import FormButton from "../buttons/FormButton";
import MultipleImageUploader from "../input/MultipleImageUploader";
import {
  useGetAccountUserProfileImages,
  useGetUserAccountDetails,
  useGetUserAccountRole,
  useUpdateAccountSettings,
} from "hooks/account";

const UpdateAccountDetailsForm: React.FC = () => {
  const [user, setUser] = useState<User>(EmptyUser);
  const [formData, setFormData] = useState<User>(EmptyUser);
  const [isChanged, setIsChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountIsSetup, setAccountIsSetup] = useState(false);

  const [userProfileImages, setUserProfileImages] = useState<OrderedFile[]>([]);
  const [formProfileImages, setFormProfileImages] = useState<OrderedFile[]>([]);

  // Get user account information
  const roleQuery = useGetUserAccountRole();
  const userQuery = useGetUserAccountDetails();
  const userProfileImagesQuery = useGetAccountUserProfileImages();

  const updateAccount = useUpdateAccountSettings();

  const textInputSetFormData = (id: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSaveChanges = () => {
    setIsSubmitting(true);
    updateAccount.mutate(
      { formData, images: formProfileImages.map((image) => image.file) },
      {
        onSuccess: () => {
          setUser({ ...formData, interests: [...formData.interests] });
          setUserProfileImages(formProfileImages);
          setIsChanged(false);
          setIsSubmitting(false);
        },
        onError: (error: Error | AxiosError) => {
          let errMsg: string = error.message;
          if (axios.isAxiosError(error)) {
            errMsg = `${(error as AxiosError).response?.data}`;
          }
          toast.error(`Failed to update because: ${errMsg}`);
        },
      },
    );
  };

  const handleDiscardChanges = () => {
    setFormData({ ...user, interests: [...user.interests] });
    setFormProfileImages(userProfileImages);
    setIsChanged(false);
  };

  const handleClearAvatarImage = () => {
    setIsChanged(true);
    setFormData((prevState) => ({
      ...prevState,
      avatar: null,
    }));
  };

  const handleImagesUploaded = (files: OrderedFile[]) => {
    setFormProfileImages(files);
  };

  useEffect(() => {
    // Populate user details and avatar
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
        interests: [...userDetails.interests],
        avatar: userAvatar,
      });
      setAccountIsSetup(isAccountSetup(userDetails));
    }
    // Populate user profile images
    if (userProfileImagesQuery.status === "success") {
      const images: File[] = userProfileImagesQuery.data;
      setUserProfileImages(
        images.map(
          (image, idx) => ({ orderNum: idx, file: image }) as OrderedFile,
        ),
      );
      setFormProfileImages(
        images.map(
          (image, idx) => ({ orderNum: idx, file: image }) as OrderedFile,
        ),
      );
    }
  }, [userQuery.status, userProfileImagesQuery.status]);

  const ready: boolean =
    roleQuery.isFetched &&
    userQuery.isFetched &&
    userProfileImagesQuery.isFetched;

  if (!ready) {
    return <TextSkeleton />;
  }

  if (
    ready &&
    (userQuery.isError || userProfileImagesQuery.isError || roleQuery.isError)
  ) {
    return (
      <FetchErrorText>
        Sorry, we couldn{"'"}t fetch your data at this moment. Please try again
        later.
      </FetchErrorText>
    );
  }

  return (
    <>
      {userQuery.isSuccess && !accountIsSetup && (
        <p className="text-green-600 text-lg mt-2">
          Your account is not setup, please setup your account by going to the
          dashboard. Otherwise, you can choose to delete your account here.
        </p>
      )}
      {userQuery.isSuccess && accountIsSetup && (
        <form className="form__vertical_inputs">
          {/* User Role and ID -- obviously not allowed to change, just displaying it! */}
          <div className="input__container ">
            <h1 className="label__text_input_gray">
              User Role:{roleQuery.data as string}
            </h1>
            <h1 className="label__text_input_gray">User ID: {user.userId}</h1>
          </div>

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
            value={formData.gender}
            setValue={(newVal: string) =>
              setFormData((prevState) => ({
                ...prevState,
                gender: newVal,
              }))
            }
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
            values={formData.interests}
            setValues={(newVals: string[]) =>
              setFormData((prevState) => ({
                ...prevState,
                interests: newVals,
              }))
            }
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

          {/* User Profile Images */}
          <div className="input__container">
            <label className="label__text_input_gray">
              Additional User Profile Images, displayed after avatar image.
              (opt.)
            </label>
            <MultipleImageUploader
              images={formProfileImages}
              onImagesUploaded={handleImagesUploaded}
              setIsChanged={setIsChanged}
            />
          </div>

          {/* Save / discard buttons */}
          {isChanged && (
            <div className="flex justify-end space-x-4">
              <FormButton
                onClick={handleSaveChanges}
                disabled={isSubmitting}
                disabledText="Saving..."
                displayText="Save changes"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              />
              <FormButton
                onClick={handleDiscardChanges}
                disabled={isSubmitting}
                disabledText="Pending Save"
                displayText="Discard Changes"
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              />
            </div>
          )}
        </form>
      )}
    </>
  );
};

export default UpdateAccountDetailsForm;