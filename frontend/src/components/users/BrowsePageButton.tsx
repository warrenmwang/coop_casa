import * as React from "react";
import { useNavigate } from "react-router-dom";

const BrowsePageButton: React.FC<{ pageLink: string; displayText: string }> = ({
  pageLink,
  displayText,
}) => {
  const navigate = useNavigate();
  return (
    <button
      className="m-3 p-3 bg-gray-500 hover:bg-gray-400 text-white rounded"
      onClick={() => navigate(pageLink)}
    >
      {displayText}
    </button>
  );
};

export default BrowsePageButton;
