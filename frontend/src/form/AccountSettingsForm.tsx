import React, { useState, useEffect } from "react";
import { apiUpdateUserAccountDetails, apiGetUser } from "../api/api";
import InterestsInput from "../input/InterestsInput";
import LocationInput from "../input/LocationInput";
import GenderInput from "../input/GenderInput";
import TextInput from "../input/TextInput";
import ImageInput from "../input/ImageInput";
import { apiFile2ClientFile } from "../utils/utils";
import { APIUserReceived, User, UserDetails } from "../types/Types";
import "../styles/form.css";
import { EmptyUser } from "../auth/AuthWrapper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TextSkeleton from "../skeleton/TextSkeleton";

const AccountSettingsForm: React.FC = () => {
  const [user, setUser] = useState<User>(EmptyUser);
  const [formData, setFormData] = useState<User>(EmptyUser);
  const [isChanged, setIsChanged] = useState(false);

  const userQuery = useQuery({
    queryKey: ["user", "details"],
    queryFn: apiGetUser,
  });

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
    onError: () => {
      alert(`Failed to update because: ${mutation.error}`);
    },
  });

  const textInputSetFormData = (id: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSaveChanges = async () => {
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
    console.log("hi");
  }, [userQuery.status]);

  const ready: boolean = user.userId !== "" && formData.userId !== "";

  return ready ? (
    <>
      <div className="default-form-1">
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
          <button
            onClick={handleClearAvatarImage}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Clear Image
          </button>
        )}

        {/* Save / discard buttons */}
        {isChanged && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save Changes
            </button>
            <button
              onClick={handleDiscardChanges}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Discard Changes
            </button>
          </div>
        )}
      </div>
    </>
  ) : (
    <TextSkeleton />
  );
};

export default AccountSettingsForm;
