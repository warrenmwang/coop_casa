import React from "react";
import { GENDER_OPTIONS } from "../constants";
import "../styles/input.css";

interface GenderInputArgs {
  value: string;
  setValue: (newVal: string) => void;
  setIsChanged?: (value: React.SetStateAction<boolean>) => void;
  setError?: (key: string, value: boolean) => void;
  required?: boolean;
  classNameCustom?: string;
}

const GenderInput: React.FC<GenderInputArgs> = ({
  // formData,
  // setFormData,
  value,
  setValue,
  setError,
  setIsChanged,
  required = false,
  classNameCustom = "",
}) => {
  // Handles changes for text fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value: val } = e.target;

    setValue(val);
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
        defaultValue={value}
        value={value}
        required={required}
      >
        <option value="" disabled>
          Select an Option
        </option>
        {GENDER_OPTIONS.map((gender) => (
          <option key={gender} value={gender}>
            {gender}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenderInput;
