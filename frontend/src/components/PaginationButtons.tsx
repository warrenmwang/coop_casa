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
  return (
    <div className="flex gap-1">
      {Array(currentPage + 1)
        .fill(0)
        .map((_, i) => i * 1)
        .map((pageNum) => (
          <button
            key={pageNum}
            className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded"
            disabled={currentPage === pageNum}
            onClick={handleNavPage}
          >
            {pageNum + 1}
          </button>
        ))}
      {currentPageSize === setSize && (
        <button
          key="next"
          className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded"
          onClick={handleNextPage}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default PaginationButtons;
