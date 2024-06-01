import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Autosuggest from 'react-autosuggest';
import Title from "../structure/Title";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";

import { MAX_TEXT_INPUT_LENGTH, validateUserAvatarInput, validateUserTextInput } from "../../utils/inputValidation";
import { fileToBase64 } from "../../utils/utils";
import { User } from "../../types/User";
import { updateUserAccountDetails } from "../../api/api";
import { AuthData } from "../../auth/AuthWrapper";

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
  const auth = AuthData()
  const { user, setUser } = auth

  const navigate = useNavigate()

  // Define the form data state to store user input
  const [formData, setFormData] = useState<User>(user)
  const [suggestions, setSuggestions] = useState<{ city: string; state: string; }[]>([])
  const [locations, setLocations] = useState<{ city: string; state: string }[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(new Map<string, boolean>()); // if any key value in errors is true, then there is a problem.

  const setError = (key: string, value: boolean) => {
    setMyMap(prevMap => {
      const newMap = new Map(prevMap)
      newMap.set(key, value)
      return newMap
    })
  }

  // Set interests error to true at first render
  useEffect(() => {
    setError("interests", true);
  }, [])

  // ------- For location suggestions -------
  // Fetch the json data for the us cities for auto suggestions in the location input
  useEffect(() => {
    fetch('/data/us_cities.json')
      .then(response => response.json())
      .then(data => setLocations(data))
      .catch(error => console.error('Error fetching city data:', error))
  }, [])

  // Function to get suggestions based on input value
  const getSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : locations.filter(
          loc =>
            loc.city.toLowerCase().slice(0, inputLength) === inputValue ||
            loc.state.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  // Function to get suggestion value
  const getSuggestionValue = (suggestion: { city: string; state: string }) =>
    `${suggestion.city}, ${suggestion.state}`;

  // Function to render suggestions
  const renderSuggestion = (suggestion: { city: string; state: string }) => (
    <div>
      {suggestion.city}, {suggestion.state}
    </div>
  );
  // ------- For location suggestions -------

  // Handles changes for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    // Validate user input, if not valid break
    if (!validateUserTextInput(id, value)) {
      return 
    }

    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    setError(id, false);
  };

  const handleLocationChange = (event: React.FormEvent<HTMLElement>, { newValue }: { newValue: string }) => {
    const target = event.target as HTMLInputElement
    setFormData(prevState => ({
      ...prevState,
      location: newValue
    }));
    setError(target.id, false);
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      // Validate avatar image upload
      if (!validateUserAvatarInput(file)) {
        setError("avatar", true);
        alert('Please upload a valid image file (JPEG, PNG, or GIF).');
        e.target.value = ''; // Clear the input value to allow re-upload
      }

      // Save validated avatar upload
      const avatarBase64 = await fileToBase64(file)
      setFormData(prevState => ({
        ...prevState,
        avatar: avatarBase64
      }));
      setError("avatar", false);
    }
  }

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Add a selected interest to the selectedInterests list state
    const { value, checked } = e.target;

    // Start with current interests
    let updatedInterests : string = formData.interests;

    if (checked) {
      // Append the new value to the current interests in format: 
      // interest1, interest2, interest3
      // so only commas inbetween values with no trailing comma
      updatedInterests = `${updatedInterests},${value}`
    } else {
      // Remove the unchecked interest from the interests string
      const interestsArray = updatedInterests.split(',').filter(interest => interest !== value)
      updatedInterests = interestsArray.join(',')
    }

    setFormData(prevState => ({
      ...prevState, 
      interests: updatedInterests
    }))

    setError("interests", updatedInterests.length === 0)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for errors
    const hasErrors = Array.from(errors.values()).some(value => value);
    if (hasErrors) {
      alert("Fill out required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save data into the Auth context user
      setUser(formData);

      // Save user data into the backend
      const status = await updateUserAccountDetails(formData);
      if (status) {
        navigate("/dashboard");
        // window.location.reload();
      } else {
        alert("Unable to setup account, please try again.");
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <TopNavbar />
      <Title title="Account Setup" description="Please provide some information about yourself to be able to use this platform and connect with others!" />
      <div className="flex justify-center items-center min-h-full">
        <form className="w-full max-w-lg block p-1" onSubmit={handleSubmit}>
          {/* First and Last Name */}
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
                maxLength={MAX_TEXT_INPUT_LENGTH}
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
                maxLength={MAX_TEXT_INPUT_LENGTH}
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap -my-3 -mx-3 mb-6">
            {/* Birthdate  */}
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="birthDate"
              >
                Birthdate <span className="text-red-500">*</span>
              </label>
              <input 
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="birthDate"
                type="date"
                value={formData.birthDate}
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
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={{
                  id: 'location',
                  placeholder: 'City, State',
                  value: formData.location,
                  onChange: handleLocationChange,
                  className: 'appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white',
                  required: true
                }}
              />
            </div>

            {/* Avatar Image */}
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="avatar"
              >
                Avatar Image
              </label>
              {formData.avatar && (
                <div className="mb-3">
                  <img src={formData.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover" />
                </div>
              )}
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
