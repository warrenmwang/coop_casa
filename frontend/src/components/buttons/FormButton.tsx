import React from "react";

type FormButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  disabledText?: string;
  displayText?: string;
  color?: string;
  className?: string; // if present, overrides other options for styling.
};

const colors: { gray: string; red: string } = {
  gray: "px-4 py-2 bg-gray-300 rounded hover:bg-gray-400",
  red: "mt-4 bg-red-500 text-white p-2 rounded-lg w-3/5 hover:bg-red-600",
};

const FormButton: React.FC<FormButtonProps> = ({
  onClick,
  disabled = false,
  disabledText = "Button Disabled",
  displayText = "Button",
  color = "gray",
  className = "",
}) => {
  let colorClassName: string = colors.gray;
  if (color === "red") {
    colorClassName = colors.red;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className ? className : colorClassName}
    >
      {disabled ? disabledText : displayText}
    </button>
  );
};

export default FormButton;
