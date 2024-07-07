import React from "react";

type SubmitButtonArgs = {
  isSubmitting: boolean;
  onClick?: any; // any function
};

// Button needs to be inside of a <form> element
// whose onSubmit attribute should be set to some kind of
// handleSubmit function
const SubmitButton: React.FC<SubmitButtonArgs> = ({
  isSubmitting,
  onClick,
}) => {
  return (
    <button
      id="submit"
      type="submit"
      className={`bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded`}
      disabled={isSubmitting}
      onClick={onClick}
    >
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  );
};

export default SubmitButton;
