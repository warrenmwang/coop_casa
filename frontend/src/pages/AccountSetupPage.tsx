// React
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Title from "../components/Title";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { User } from "../types/Types";
import { apiUpdateUserAccountDetails } from "../api/api";
import { AuthData } from "../auth/AuthWrapper";
import LocationInput from "../input/LocationInput";
import InterestsInput from "../input/InterestsInput";
import GenderInput from "../input/GenderInput";
import TextInput from "../input/TextInput";
import ImageInput from "../input/ImageInput";

// Styles
import "../styles/Form.css";
import SubmitButton from "../components/SubmitButton";
import { dashboardPageLink } from "../urls";

const AccountSetupPage: React.FC = () => {
  const auth = AuthData();
  const { user, setUser } = auth;

  const navigate = useNavigate();

  // Define the form data state to store user input
  const [formData, setFormData] = useState<User>(user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  ); // if any key value in errors is true, then there is a problem.

  const setError = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  // Set interests error to true at first render
  useEffect(() => {
    if (formData.interests === "") {
      setError("interests", true);
    }
  }, [formData.interests]);

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
      alert("Fill out required fields.");
      return;
    }

    setIsSubmitting(true);
  };

  useEffect(() => {
    if (isSubmitting) {
      const foo = async () => {
        try {
          // Save data into the Auth context user
          setUser(formData);

          // Save user data into the backend
          const response = await apiUpdateUserAccountDetails(formData);
          if (response.ok) {
            navigate(dashboardPageLink);
          } else {
            const errorText = await response.text();
            alert(`Unable to setup account due to reason: ${errorText}`);
          }
        } catch (error) {
          console.error("Error during form submission:", error);
          alert("An error occurred. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
      };
      foo();
    }
  }, [isSubmitting]);

  return (
    <div>
      <TopNavbar />
      <Title
        title="Account Setup"
        description="Please provide some information about yourself to be able to use this platform and connect with others!"
      />
      <div className="flex justify-center items-center min-h-full">
        <form className="default-form-1" onSubmit={handleSubmit}>
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
              <button
                onClick={handleClearAvatarImage}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Clear Image
              </button>
            )}

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
      <Footer />
    </div>
  );
};

export default AccountSetupPage;
