import React from "react";
import { User } from "../types/Types";
import "../styles/input.css";

interface InterestsInputProps {
  formData: User;
  setFormData: React.Dispatch<React.SetStateAction<User>>;
  setError?: (key: string, value: boolean) => void;
  setIsChanged?: (value: React.SetStateAction<boolean>) => void;
  required?: boolean; // NOTE: this only toggles the appearance of a red asterisk. Actual validation of input existence is done in outer component.
}

const InterestsInput: React.FC<InterestsInputProps> = ({
  formData,
  setFormData,
  setError,
  setIsChanged,
  required,
}) => {
  const interestsOptions = [
    "Reading",
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
    "Dance",
  ];

  const handleInterestsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    // Add a selected interest to the selectedInterests list state
    const { value, checked } = e.target;

    // Start with current interests
    let updatedInterests: string[] = formData.interests;

    if (checked) {
      // Append the new value to the current interests
      updatedInterests.push(value);
    } else {
      // Remove the unchecked interest from the interests string
      updatedInterests = updatedInterests.filter(
        (interest) => interest !== value,
      );
    }

    setFormData((prevState) => ({
      ...prevState,
      interests: updatedInterests,
    }));

    if (setError) {
      setError("interests", updatedInterests.length === 0); // enforce at least 1 interest
    }
    if (setIsChanged) {
      setIsChanged(true);
    }
  };

  return (
    <div className="min-h-full w-full px-3">
      <label className="label__text_input_gray" htmlFor="interests">
        Interests (Multiple Answer, Select at least 1){" "}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className="block w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white"
        id="interests"
      >
        {interestsOptions.map((interest) => (
          <label
            key={interest}
            htmlFor={interest}
            className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
          >
            <input
              type="checkbox"
              id={interest}
              value={interest}
              onChange={handleInterestsChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
              checked={formData.interests.includes(interest)}
            />
            <span className="w-full ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {interest}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default InterestsInput;
