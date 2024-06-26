// React
import React, { useState, useEffect } from "react";

// Components
import { User } from "../../types/User";
import { apiUpdateUserAccountDetails } from "../../api/api";
import InterestsInput from "./InterestsInput";
import LocationInput from "./LocationInput";
import GenderInput from "../structure/GenderInput";
import TextInput from "../structure/TextInput";
import ImageInput from "../structure/ImageInput";

// Styles
import "../../styles/Form.css"

const AccountSettingsForm: React.FC<{ user: User, setUser: React.Dispatch<React.SetStateAction<User>> }> = ({ user, setUser }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const textInputSetFormData = (id: string, value: string) => {
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSaveChanges = async () => {
    // Save data in auth context user
    setUser(formData);
    // Save data in the database
    const responseCode = await apiUpdateUserAccountDetails(formData);
    if (responseCode !== 200) {
      alert(`Please try submitting again. Returned with response code ${responseCode}`)
    }
    setIsChanged(false);
  };

  const handleDiscardChanges = () => {
    setFormData(user);
    setIsChanged(false);
  };

  const handleClearAvatarImage = () => {
    setIsChanged(true)
    setFormData(prevState => ({
      ...prevState,
      avatar: ""
    }))
  }

  return (
    <div className="default-form-1">
      {/* Email */}
      <TextInput 
        setFormData={textInputSetFormData}
        setIsChanged={setIsChanged}
        type="email"
        label="Email"
        id="email"
        value={formData.email}
      />

      {/* First Name */}
      <TextInput 
        setFormData={textInputSetFormData}
        setIsChanged={setIsChanged}
        type="text"
        label="First Name"
        id="firstName"
        value={formData.firstName}
      />

      {/* Last Name */}
      <TextInput 
        setFormData={textInputSetFormData}
        setIsChanged={setIsChanged}
        type="text"
        label="Last Name"
        id="lastName"
        value={formData.lastName}
      />

      {/* Birthdate  */}
      <TextInput 
        setFormData={textInputSetFormData}
        setIsChanged={setIsChanged}
        type="date"
        label="Birthdate"
        id="birthDate"
        value={formData.birthDate}
      />

      {/* Gender */}
      <GenderInput 
        formData={formData}
        setFormData={setFormData}
        setIsChanged={setIsChanged}
      />

      {/* Location */}
      <LocationInput 
        formData={formData}
        setFormData={setFormData}
        setIsChanged={setIsChanged}
      />

      {/* Interests */}
      <InterestsInput 
        formData={formData}
        setFormData={setFormData}
        setIsChanged={setIsChanged}
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
