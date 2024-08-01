import React from "react";
import "../styles/assets.css";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const ShareLinkButton: React.FC = () => {
  const { pathname } = useLocation();

  const handleShare = () => {
    const currentUrl = window.location.origin + pathname;
    navigator.clipboard.writeText(currentUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <>
      <button
        className="block m-3 p-3 bg-gray-500 hover:bg-gray-400 text-white rounded"
        onClick={handleShare}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          className="size-6 shareLink"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
          />
        </svg>
      </button>
    </>
  );
};

export default ShareLinkButton;
