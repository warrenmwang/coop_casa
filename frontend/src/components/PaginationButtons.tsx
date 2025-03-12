import React from "react";

type PaginationButtonsProps = {
  currentPage: number;
  currentPageSize: number;
  setSize: number;
  handleNavPage: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleNextPage: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const PaginationButtons: React.FC<PaginationButtonsProps> = ({
  currentPage,
  currentPageSize,
  setSize,
  handleNavPage,
  handleNextPage,
}) => {
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }

  function handleNavClick(e: React.MouseEvent<HTMLButtonElement>) {
    handleNavPage(e);
    scrollToTop();
  }

  function handleNextClick(e: React.MouseEvent<HTMLButtonElement>) {
    handleNextPage(e);
    scrollToTop();
  }

  return (
    <div className="flex gap-2 mt-3">
      {Array(currentPage + 1)
        .fill(0)
        .map((_, i) => i * 1)
        .map((pageNum) => (
          <button
            key={pageNum}
            className={`p-3 rounded ${currentPage === pageNum ? "bg-gray-400" : "bg-gray-500 hover:bg-gray-600"} text-white`}
            disabled={currentPage === pageNum}
            onClick={handleNavClick}
          >
            {pageNum + 1}
          </button>
        ))}
      {currentPageSize === setSize && (
        <button
          key="next"
          className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded"
          onClick={handleNextClick}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default PaginationButtons;
