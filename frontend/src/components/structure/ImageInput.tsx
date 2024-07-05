import React from "react";
import { User } from "../../types/Types";
import { validateUserAvatarInput } from "../../utils/inputValidation";

interface ImageInputArgs {
  setFormData: React.Dispatch<React.SetStateAction<User>>;
  setError?: (key: string, value: boolean) => void;
  setIsChanged?: (value: React.SetStateAction<boolean>) => void;
  label: string;
  id: string;
  value: File | null;
}

const ImageInput: React.FC<ImageInputArgs> = ({
  setFormData,
  setError,
  setIsChanged,
  label,
  id,
  value,
}) => {
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      // Validate avatar image upload
      if (!validateUserAvatarInput(file)) {
        if (setError) {
          setError("avatar", true);
        }
        alert("Please upload a valid image file (JPEG, PNG, or GIF).");
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
    <div className="w-full px-3">
      <label className="text_input_field_label_gray" htmlFor={id}>
        {label}
      </label>
      {value && (
        <div className="mb-3">
          <img
            src={URL.createObjectURL(value)}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover"
          />
        </div>
      )}
      <input
        className="text_input_field_box_gray"
        id={id}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
      />
    </div>
  );
};

export default ImageInput;
