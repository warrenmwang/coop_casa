export default function ShowMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <span>
      <button
        className="flex flex-col items-center justify-center text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-2"
        onClick={onClick}
      >
        <span className="text-2xl">...</span>
        <span className="text-sm">Show More</span>
      </button>
    </span>
  );
}
