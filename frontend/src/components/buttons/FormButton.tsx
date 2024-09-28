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
  gray: "button__gray",
  red: "button__red_1",
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
