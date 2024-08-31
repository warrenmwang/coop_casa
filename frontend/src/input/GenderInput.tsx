import React from "react";
import { User } from "../types/Types";
import { GENDER_OPTIONS } from "../constants";
import "../styles/input.css";

interface GenderInputArgs {
  formData: User;
  setFormData: React.Dispatch<React.SetStateAction<User>>;
  setIsChanged?: (value: React.SetStateAction<boolean>) => void;
  setError?: (key: string, value: boolean) => void;
  required?: boolean;
  classNameCustom?: string;
}

const GenderInput: React.FC<GenderInputArgs> = ({
  formData,
  setFormData,
  setError,
  setIsChanged,
  required = false,
  classNameCustom = "",
}) => {
  // Handles changes for text fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
    if (setError) {
      setError(id, false);
    }
    if (setIsChanged) {
      setIsChanged(true);
    }
  };

  return (
    <div className="input__container">
      <label className="label__text_input_gray" htmlFor="gender">
        Gender {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id="gender"
        className={`input__text_gray_box ${classNameCustom}`}
        onChange={handleChange}
        defaultValue={formData.gender}
        required={required}
      >
        <option value="" disabled>
          Select an Option
        </option>
        {GENDER_OPTIONS.map((gender) => (
          <option
            key={gender}
            value={gender}
            selected={gender === formData.gender}
          >
            {gender}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenderInput;
