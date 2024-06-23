import React from "react";

type SubmitButtonArgs = {
  isSubmitting: boolean;
  onClick?: () => void;
};

// Button needs to be inside of a <form> element
// whose onSubmit attribute should be set to some kind of
// handleSubmit function
const SubmitButton: React.FC<SubmitButtonArgs> = ({
  isSubmitting,
  onClick,
}) => {
  return (
    <div className="w-full px-3">
      <button
        type="submit"
        className={`bg-green-500 text-white py-2 px-4 m-1 rounded hover:bg-green-600`}
        disabled={isSubmitting}
        onClick={onClick}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
};

export default SubmitButton;
