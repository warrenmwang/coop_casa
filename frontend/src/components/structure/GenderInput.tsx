import React from "react";
import { User } from "../../types/User";

interface GenderInputArgs {
  formData : User
  setFormData : React.Dispatch<React.SetStateAction<User>>
  setIsChanged ?: (value: React.SetStateAction<boolean>) => void
  setError ?: (key: string, value: boolean) => void
  required ?: boolean
}

const GenderInput : React.FC<GenderInputArgs> = ({ formData, setFormData, setError, setIsChanged, required = false}) => {

  // Handles changes for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    if (setError) {
      setError(id, false);
    }
    if (setIsChanged) {
      setIsChanged(true);
    }
  };

  return(
    <div className="w-full px-3 py-1">
      <label
        className="text_input_field_label_gray"
        htmlFor="gender"
      >
        Gender {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id="gender"
        className="text_input_field_box_gray"
        onChange={handleChange}
        defaultValue={formData.gender}
        required={required}
      >
        <option value="" disabled>Select Option</option>
        <option value="Man">Man</option>
        <option value="Woman">Woman</option>
        <option value="Transgender Woman">Transgender Woman</option>
        <option value="Transgender Man">Transgender Man</option>
        <option value="Non-Binary">Non-Binary</option>
        <option value="Agender">Agender</option>
        <option value="Prefer Not To State">Prefer Not To State</option>
      </select>
    </div>
  );
}

export default GenderInput;