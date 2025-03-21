import React from "react";

import { MAX_TEXT_INPUT_LENGTH } from "@app/appConstants";

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

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
    <div className="input__container">
      <label className="label__text_input_gray" htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`input__text_gray_box ${classNameCustom}`}
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
