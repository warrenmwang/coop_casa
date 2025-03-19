import React, { useEffect, useRef, useState } from "react";

type AutoSuggestTextInputProps = {
  labels: string[];
  values: string[];
  onSelect: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  initialValue?: string;
};

export default function AutoSuggestTextInput({
  labels,
  values,
  onSelect,
  className = "",
  placeholder = "",
  required = false,
  id = "autosuggest-input",
  initialValue = "",
}: AutoSuggestTextInputProps) {
  const [inputText, setInputText] = useState<string>(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionListRef = useRef<HTMLDivElement>(null);

  if (labels.length !== values.length)
    throw Error(
      `labels ${labels.length} and values ${values.length} arrays must have the same length.`,
    );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputText(value);

    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const inputValue = value.trim().toLowerCase();
    const matchedLabels = labels
      .filter(function (label) {
        return label.toLowerCase().includes(inputValue);
      })
      .slice(0, 10); // Limit to 10 suggestions for performance

    setSuggestions(matchedLabels);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  }

  function handleSuggestionClick(label: string) {
    const index = labels.indexOf(label);
    setInputText(label);
    onSelect(values[index]);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;

    // Down arrow
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => {
        return prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0;
      });
    }
    // Up arrow
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => {
        return prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1;
      });
    }
    // Enter key
    else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightedIndex]);
    }
    // Escape key
    else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function handleBlur() {
    // Small delay to allow for click events on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }

  function handleFocus() {
    if (inputText.trim() !== "" && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }

  // Scroll to highlighted suggestion
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionListRef.current) {
      const highlightedElement = suggestionListRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative w-full">
      <input
        id={id}
        ref={inputRef}
        className={className}
        onChange={handleChange}
        value={inputText}
        placeholder={placeholder}
        required={required}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionListRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                index === highlightedIndex ? "bg-gray-200" : ""
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
