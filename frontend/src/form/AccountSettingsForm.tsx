// React
import React, { useState, useEffect } from "react";

// Components
import { User } from "../types/Types";
import { apiUpdateUserAccountDetails } from "../api/api";
import InterestsInput from "../input/InterestsInput";
import LocationInput from "../input/LocationInput";
import GenderInput from "../input/GenderInput";
import TextInput from "../input/TextInput";
import ImageInput from "../input/ImageInput";

// Styles
import "../styles/Form.css";

const AccountSettingsForm: React.FC<{
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}> = ({ user, setUser }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const textInputSetFormData = (id: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSaveChanges = async () => {
    // Save data in the database
    try {
      const response = await apiUpdateUserAccountDetails(formData);
      if (!response.ok) {
        const errorText = await response.text();
        alert(`Failed to update because: ${errorText}`);
        return;
      }
    } catch (err) {
      alert(`Failed to update because: ${err}`);
      return;
    }
    // Save data in auth context user
    setUser(formData);
    setIsChanged(false);
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

  return (
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
  );
};

export default AccountSettingsForm;
