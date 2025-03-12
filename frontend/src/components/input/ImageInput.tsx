import React from "react";
import { toast } from "react-toastify";

import { User } from "@app/types/Types";
import { validateUserAvatarInput } from "@app/utils/inputValidation";

interface ImageInputArgs {
  setFormData: React.Dispatch<React.SetStateAction<User>>;
  setError?: (key: string, value: boolean) => void;
  setIsChanged?: (value: React.SetStateAction<boolean>) => void;
  label: string;
  id: string;
  value: File | null;
  classNameCustom?: string;
}

const ImageInput: React.FC<ImageInputArgs> = ({
  setFormData,
  setError,
  setIsChanged,
  label,
  id,
  value,
  classNameCustom = "",
}) => {
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      // Validate avatar image upload
      const [errMsg, isValid] = validateUserAvatarInput(file);
      if (!isValid) {
        if (setError) {
          setError("avatar", true);
        }
        toast.error(errMsg);
        e.target.value = ""; // Clear the input value to allow re-upload
        return;
      }

      // Save validated image in formData state
      setFormData((prevState) => ({
        ...prevState,
        avatar: file,
      }));

      if (setError) {
        setError("avatar", false);
      }
      if (setIsChanged) {
        setIsChanged(true);
      }
    }
  };

  return (
    <div className="input__container">
      <label className="label__text_input_gray" htmlFor={id}>
        {label}
      </label>
      {value && (
        <div className="flex justify-center mb-3">
          <img
            src={URL.createObjectURL(value)}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover"
          />
        </div>
      )}
      <input
        className={`input__text_gray_box ${classNameCustom}`}
        id={id}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
      />
    </div>
  );
};

export default ImageInput;
