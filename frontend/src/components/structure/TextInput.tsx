import React from "react";
import { User } from "../../types/User";
import { MAX_TEXT_INPUT_LENGTH, validateTextLength, validateDate, validateEmail } from "../../utils/inputValidation";

interface TextInputArgs {
  setFormData : React.Dispatch<React.SetStateAction<User>>
  setError ?: (key: string, value: boolean) => void
  setIsChanged ?: (value: React.SetStateAction<boolean>) => void
  label : string
  placeholder ?: string
  id : string
  value : string
  type : string
  required ?: boolean
}

const TextInput : React.FC<TextInputArgs> = ({ setFormData, setError, setIsChanged, label, placeholder, id, value, type, required = false}) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    // Validate user input, if not valid break
    if (type === "text") {
      if (!validateTextLength(value)) {
        return
      }
    }

    // Validate date if type is date
    if (type === "date") {
      if (!validateDate(value)) {
        return
      }
    }

    if (type === "email") {
      if (!validateEmail(value)) {
        return
      }
    }

    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    if (setError){
      setError(id, false);
    }
    if (setIsChanged) {
      setIsChanged(true)
    }
  };


  return(
    <div className="w-full px-3 py-1">
      <label
        className="text_input_field_label_gray"
        htmlFor={id}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="text_input_field_box_gray"
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        maxLength={MAX_TEXT_INPUT_LENGTH}
        required={required}
      />
    </div>
  );
}

export default TextInput;