// React
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Title from "../components/Title";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { APIUserReceived, User, UserDetails } from "../types/Types";
import { apiGetUser, apiUpdateUserAccountDetails } from "../api/api";
import { AuthData, EmptyUser } from "../auth/AuthWrapper";
import LocationInput from "../input/LocationInput";
import InterestsInput from "../input/InterestsInput";
import GenderInput from "../input/GenderInput";
import TextInput from "../input/TextInput";
import ImageInput from "../input/ImageInput";

// Styles
import "../styles/Form.css";
import SubmitButton from "../components/SubmitButton";
import { dashboardPageLink } from "../urls";
import { useMutation, useQuery } from "@tanstack/react-query";
import TextSkeleton from "../skeleton/TextSkeleton";
import { apiFile2ClientFile } from "../utils/utils";

import axios, { AxiosError } from "axios";

// Authenticated Endpoint
const AccountSetupPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<User>(EmptyUser);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  ); // if any key value in errors is true, then there is a problem.

  // need to get user's to get the id and email
  const userQuery = useQuery({
    queryKey: ["user", "details"],
    queryFn: apiGetUser,
  });

  const mutation = useMutation({
    mutationKey: ["user", "details"],
    mutationFn: () => apiUpdateUserAccountDetails(formData),
    onSuccess: () => {
      navigate(dashboardPageLink);
    },
    onError: (error: Error | AxiosError) => {
      // try to use help text about error if provided by backend
      let errMsg: string = error.message;
      if (axios.isAxiosError(error)) {
        errMsg = `${(error as AxiosError).response?.data}`;
      }
      alert(`Unable to setup account due to reason: ${errMsg}.`);
      setIsSubmitting(false);
    },
  });

  const setError = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

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
    // Send update
    setIsSubmitting(true);
    mutation.mutate();
  };

  // Set interests error to true at first render
  useEffect(() => {
    if (formData.interests === "") {
      setError("interests", true);
    }
  }, []);

  useEffect(() => {
    if (userQuery.status === "success") {
      const received: APIUserReceived = userQuery.data;
      const userDetails: UserDetails = received.userDetails;
      const avatar: File | null = apiFile2ClientFile(received.avatarImageB64);
      setFormData({
        ...userDetails,
        avatar: avatar,
      });
    }
  }, [userQuery.status]);

  const ready: boolean = userQuery.isFetched && formData.userId !== "";

  return (
    <div>
      <TopNavbar />
      {ready ? (
        <>
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
        </>
      ) : (
        <TextSkeleton />
      )}
      <Footer />
    </div>
  );
};

export default AccountSetupPage;
