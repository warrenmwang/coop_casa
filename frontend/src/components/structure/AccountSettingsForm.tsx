import React, { useState, useEffect } from "react";
import { AvatarType } from "../../types/AccountSetup";
import { User } from "../../types/User";
import { fileToBase64 } from "../../utils/utils";
import { updateUserAccountDetails } from "../../api/api";

const AccountSettingsForm: React.FC<{ user: User, setUser: React.Dispatch<React.SetStateAction<User>> }> = ({ user, setUser }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setIsChanged(true);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const { files } = e.target;
  if (files && files[0]) {
    const file = files[0];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5 MB

    // Check file size
    if (file.size > maxFileSize) {
      alert('File size should not exceed 5 MB.');
      e.target.value = ''; // Clear the input value to allow re-upload
      return;
    }

    // Check file format is valid
    if (validImageTypes.includes(file.type)) {
      try {
        const base64String = await fileToBase64(file as AvatarType);

        // File is valid, save data and update errors
        setFormData(prevState => ({
          ...prevState,
          avatar: base64String
        }));
        setIsChanged(true);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        alert('There was an error processing the file. Please try again.');
      }
    } else {
      // File is invalid, invalidate user input update error and make an alert to user
      alert('Please upload a valid image file (JPEG, PNG, GIF, BMP, or WEBP).');
      e.target.value = ''; // Clear the input value to allow re-upload
    }
  }
};

  const handleSaveChanges = async () => {
    // Save data in auth context user
    setUser(formData);
    // Save data in the database
    const ok = await updateUserAccountDetails(formData);
    if (!ok) {
      alert("Please try submitting again.")
    }
    setIsChanged(false);
  };

  const handleDiscardChanges = () => {
    setFormData(user);
    setIsChanged(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
          First Name
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
          Last Name
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthDate">
          Birth Date
        </label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="gender">
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          id="gender"
          name="gender"
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
          onChange={handleChange}
          value={formData.gender}
          required
        >
          <option value="Man">Man</option>
          <option value="Woman">Woman</option>
          <option value="Transgender Woman">Transgender Woman</option>
          <option value="Transgender Man">Transgender Man</option>
          <option value="Non-Binary">Non-Binary</option>
          <option value="Agender">Agender</option>
          <option value="Prefer Not To State">Prefer Not To State</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interests">
          Interests
        </label>
        <input
          type="text"
          name="interests"
          value={formData.interests}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="avatar">
          Avatar Image
        </label>
        {formData.avatar && (
          <div className="mb-3">
            <img src={formData.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover" />
          </div>
        )}
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Save / discard buttons */}
      {isChanged && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
