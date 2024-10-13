import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import { User } from "../../types/Types";

interface LocationInputArgs {
  formData: User;
  setFormData: React.Dispatch<React.SetStateAction<User>>;
  setError?: (key: string, value: boolean) => void;
  setIsChanged?: (value: React.SetStateAction<boolean>) => void;
  styleWhite?: boolean;
  required?: boolean;
}

const LocationInput: React.FC<LocationInputArgs> = ({
  formData,
  setFormData,
  setError,
  setIsChanged,
  styleWhite,
  required = false,
}) => {
  const [suggestions, setSuggestions] = useState<
    { city: string; state: string }[]
  >([]);
  const [locations, setLocations] = useState<{ city: string; state: string }[]>(
    [],
  );

  // ------- For location suggestions -------
  // Fetch the json data for the us cities for auto suggestions in the location input
  useEffect(() => {
    fetch("/data/us_cities.json")
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error("Error fetching city data:", error));
  }, []);

  // Function to get suggestions based on input value
  const getSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : locations.filter(
          (loc) =>
            loc.city.toLowerCase().slice(0, inputLength) === inputValue ||
            loc.state.toLowerCase().slice(0, inputLength) === inputValue,
        );
  };

  // Function to get suggestion value
  const getSuggestionValue = (suggestion: { city: string; state: string }) =>
    `${suggestion.city}, ${suggestion.state}`;

  // Function to render suggestions
  const renderSuggestion = (suggestion: { city: string; state: string }) => (
    <div>
      {suggestion.city}, {suggestion.state}
    </div>
  );
  // ------- For location suggestions -------

  const handleLocationChange = (
    event: React.FormEvent<HTMLElement>,
    { newValue }: { newValue: string },
  ) => {
    const target = event.target as HTMLInputElement;
    setFormData((prevState) => ({
      ...prevState,
      location: newValue,
    }));
    if (setError) {
      setError(target.id, false);
    }
    if (setIsChanged) {
      setIsChanged(true);
    }
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const labelStyle = styleWhite
    ? "block text-gray-700 text-sm font-bold mb-2"
    : "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2";
  const autoSuggestInputStyle = styleWhite
    ? "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    : "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white";
  const divStyle = styleWhite ? "mb-4" : "w-full px-3";

  return (
    <div>
      <div className={divStyle}>
        <label className={labelStyle} htmlFor="location">
          Location {required && <span className="text-red-500">*</span>}
        </label>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={{
            id: "location",
            placeholder: "City, State",
            value: formData.location,
            onChange: handleLocationChange,
            className: autoSuggestInputStyle,
            required: required,
          }}
        />
      </div>
    </div>
  );
};

export default LocationInput;
