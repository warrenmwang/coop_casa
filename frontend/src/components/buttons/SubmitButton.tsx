import React from "react";

type SubmitButtonProps = {
  isSubmitting: boolean;
  onClick?: (e: React.FormEvent) => void;
  className?: string;
};

// Button needs to be inside of a <form> element
// whose onSubmit attribute should be set to some kind of
// handleSubmit function
const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  onClick,
  className = "",
}) => {
  return (
    <button
      id="submit"
      type="submit"
      className={`button__green ${className}`}
      disabled={isSubmitting}
      onClick={onClick}
    >
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  );
};

export default SubmitButton;
