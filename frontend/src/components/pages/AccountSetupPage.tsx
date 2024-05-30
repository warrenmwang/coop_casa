import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../structure/Title";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";

import { AccountSetupPageFormData } from "../../types/AccountSetup";
import { accountSetupSubmit } from "../../api/api";

const interestsOptions = ["Reading", 
                          "Traveling", 
                          "Cooking", 
                          "Swimming", 
                          "Gaming", 
                          "Sports", 
                          "Music", 
                          "Art", 
                          "Technology", 
                          "Politics", 
                          "Writing", 
                          "Social Justice", 
                          "History", 
                          "Dance"];

const AccountSetupPage: React.FC = () => {
  const navigate = useNavigate();

  // Define the form data state to store user input
  const [formData, setFormData] = useState<AccountSetupPageFormData>({
    firstName: "",
    lastName: "",
    birthdate: "",
    gender: "",
    avatar: null,
    location: "",
    interests: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(new Map<string, boolean>()); // if any key value in errors is true, then there is a problem.

  const setError = (key: string, value: boolean) => {
    setMyMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    })
  }

  // Set interests error to true at first render
  useEffect(() => {
    setError("interests", true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    setError(id, false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

      // Check file is not too large (5 Mb)

      // Check file format is valid
      if (validImageTypes.includes(file.type)) {
        // File is valid, save data and update errors
        setFormData(prevState => ({
          ...prevState,
          avatar: file
        }));
        setError("avatar", false);
      } else {
        // File is invalid, invalidate user input update error and make an alert to user
        setFormData(prevState => ({
          ...prevState,
          avatar: null
        }));
        setError("avatar", true);
        alert('Please upload a valid image file (JPEG, PNG, GIF, BMP, or WEBP).');
        e.target.value = ''; // Clear the input value to allow re-upload
      }
    }
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Add a selected interest to the selectedInterests list state
    const { value, checked } = e.target;

    let updatedInterests : string[];

    if (checked) {
      updatedInterests = [...formData.interests, value];
    } else {
      updatedInterests = formData.interests.filter(oldValues => oldValues !== value);
    }

    setFormData(prevState => ({
      ...prevState, 
      interests: updatedInterests
    }))

    setError("interests", updatedInterests.length === 0)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Don't submit if there are any errors
    let incompleteFlag = false;
    errors.forEach((value, key) => {
      if (value) {
        incompleteFlag = true;
      }
    });

    if (incompleteFlag) {
      // User has not filled out all required fields
      alert("Fill out required fields.");
    } else {
      // User has filled out all required fields
      // Set submitting state true, then call submit function to hit api, then await backend to redirect
      setIsSubmitting(true);
      var status = await accountSetupSubmit(formData);
      if (status) {
        navigate("/dashboard")
      }
    }
  };

  return (
    <div>
      <TopNavbar />
      <Title title="Account Setup" description="Please provide some information about yourself to be able to use this platform and connect with others!" />
      <div className="flex justify-center items-center min-h-full">
        <form className="w-full max-w-lg block p-1" onSubmit={handleSubmit}>
          <div className="flex flex-wrap -mx-3 mb-6">
            {/* First Name */}
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="firstName"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="firstName"
                type="text"
                placeholder="Jane"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            {/* Last Name */}
            <div className="w-full md:w-1/2 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="lastName"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap -my-3 -mx-3 mb-6">
            {/* Birthdate  */}
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="birthdate"
              >
                Birthdate <span className="text-red-500">*</span>
              </label>
              <input 
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Gender */}
            <div className="w-full px-3 py-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="gender"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                onChange={handleChange}
                defaultValue=""
                required
              >
                <option value="" disabled>Select Option</option>
                <option value="Man">Man</option>
                <option value="Woman">Woman</option>
                <option value="Transgender Woman">Transgender Woman</option>
                <option value="Transgender Man">Transgender Man</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Agender">Agender</option>
                <option value="Prefer Not To State">Prefer Not To State</option>
              </select>
            </div>

            {/* Location */}
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="location"
              >
                Location <span className="text-red-500">*</span>
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="location"
                type="text"
                placeholder="City, State"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* Avatar Image */}
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="avatar">Avatar Image</label>
              <input 
                className="appearance-none block w-full bg-gray-200 text-gray-700 border 'border-gray-200' rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Interests Multiple Choice Check Boxes */}
            <div className="min-h-full w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="interests"
              >
                Interests (Multiple Answer, Select at least 1) <span className="text-red-500">*</span>
                <br></br>
              </label>
              <div className="block w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white" id="interests">
                {interestsOptions.map(interest => (
                  <label key={interest} htmlFor={interest} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      id={interest} 
                      value={interest} 
                      onChange={handleInterestsChange} 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <span className="w-full ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="w-full px-3">
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>

        </form>
      </div>
      <Footer />
    </div>
  );
}

export default AccountSetupPage;
