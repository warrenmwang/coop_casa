import React from "react";

type SubmitButtonProps = {
  isSubmitting: boolean;
  onClick?: any; // any function
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
      className={`bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded ${className}`}
      disabled={isSubmitting}
      onClick={onClick}
    >
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  );
};

export default SubmitButton;
