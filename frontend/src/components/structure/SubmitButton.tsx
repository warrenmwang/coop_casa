import React from "react";

type SubmitButtonArgs = {
  isSubmitting : boolean;
  color?: string;
}

// Button needs to be inside of a <form> element
// whose onSubmit attribute should be set to some kind of
// handleSubmit function
const SubmitButton : React.FC<SubmitButtonArgs> = ({ isSubmitting, color = "blue" }) => {
  return(
    <div className="w-full px-3">
      <button
        type="submit"
        className={`bg-${color}-500 text-white py-2 px-4 m-1 rounded hover:bg-${color}-600`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

export default SubmitButton;