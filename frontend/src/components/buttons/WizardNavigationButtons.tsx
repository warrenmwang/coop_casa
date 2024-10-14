import React from "react";

type props = {
  sections: string[];
  currentSection: string;
  handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const WizardNavigationButtons: React.FC<props> = ({
  sections,
  currentSection,
  handleClick,
}) => {
  return (
    <div className="flex gap-2 my-2 p-2 bg-gray-100 rounded-lg w-fit mx-auto">
      {sections.map((section, i) => (
        <button
          disabled={currentSection === section}
          key={i}
          className={`border-2 rounded-md  p-3 ${currentSection === section ? "bg-green-400 hover:bg-none" : "bg-gray-300 hover:bg-gray-400"}`}
          onClick={handleClick}
        >
          {section}
        </button>
      ))}
    </div>
  );
};

export default WizardNavigationButtons;
