import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../structure/Title";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";

import { User } from "../../types/User";
import { updateUserAccountDetails } from "../../api/api";
import { AuthData } from "../../auth/AuthWrapper";

import '../../styles/font.css'
import LocationInput from "../structure/LocationInput";
import InterestsInput from "../structure/InterestsInput";
import GenderInput from "../structure/GenderInput";
import TextInput from "../structure/TextInput";
import ImageInput from "../structure/ImageInput";

const AccountSetupPage: React.FC = () => {
  const auth = AuthData()
  const { user, setUser } = auth

  const navigate = useNavigate()

  // Define the form data state to store user input
  const [formData, setFormData] = useState<User>(user)

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
    if (formData.interests === "") {
      setError("interests", true);
    }
  }, [])

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
          <div>
            {/* First Name */}
            <TextInput 
              setFormData={setFormData}
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
              setFormData={setFormData}
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
              setFormData={setFormData}
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
              label="Avatar Image"
              id="avatar"
              value={formData.avatar}
            />

            {/* Interests Multiple Choice Check Boxes */}
            <InterestsInput 
              formData={formData}
              setFormData={setFormData}
              setError={setError}
              required={true}
            />

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
