import React from "react";
import {
  validateTextLength,
  validateDate,
  validateEmail,
} from "../utils/inputValidation";
import { MAX_TEXT_INPUT_LENGTH } from "../constants";
import "../styles/input.css";

interface TextInputArgs {
  setFormData: (id: string, value: string) => void;
  setError?: (key: string, value: boolean) => void;
  setIsChanged?: (value: React.SetStateAction<boolean>) => void;
  label: string;
  placeholder?: string;
  id: string;
  value: string;
  type: string;
  required?: boolean;
  min?: string;
  max?: string;
  classNameCustom?: string;
}

const TextInput: React.FC<TextInputArgs> = ({
  setFormData,
  setError,
  setIsChanged,
  label,
  placeholder,
  id,
  value,
  type,
  required = false,
  min = "",
  max = "",
  classNameCustom = "",
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;

    // Validate text input
    if (type === "text") {
      if (!validateTextLength(value)) {
        return;
      }
    }

    // Validate date if type is date
    if (type === "date") {
      if (!validateDate(value)) {
        return;
      }
    }

    // Validate email type
    if (type === "email") {
      if (!validateEmail(value)) {
        return;
      }
    }

    // Save state function
    setFormData(id, value);

    if (setError) {
      setError(id, false);
    }
    if (setIsChanged) {
      setIsChanged(true);
    }
  };

  return (
    <div className="w-full px-3 py-1">
      <label className="text_input_field_label_gray" htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`text_input_field_box_gray ${classNameCustom}`}
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        maxLength={MAX_TEXT_INPUT_LENGTH}
        required={required}
        min={min}
        max={max}
      />
    </div>
  );
};

export default TextInput;
