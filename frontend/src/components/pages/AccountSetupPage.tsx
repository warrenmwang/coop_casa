// React
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Title from "../structure/Title";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import { User } from "../../types/Types";
import { apiUpdateUserAccountDetails } from "../../api/api";
import { AuthData } from "../../auth/AuthWrapper";
import LocationInput from "../structure/LocationInput";
import InterestsInput from "../structure/InterestsInput";
import GenderInput from "../structure/GenderInput";
import TextInput from "../structure/TextInput";
import ImageInput from "../structure/ImageInput";

// Styles
import "../../styles/Form.css";
import SubmitButton from "../structure/SubmitButton";
import { dashboardPageLink } from "../../urls";

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
          const status = await apiUpdateUserAccountDetails(formData);
          if (status === 200) {
            navigate(dashboardPageLink);
          } else {
            alert(
              `Unable to setup account, please try again. Returned with status code ${status}`,
            );
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
            />

            {/* Gender */}
            <GenderInput
              formData={formData}
              setFormData={setFormData}
              setError={setError}
              required={true}
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
