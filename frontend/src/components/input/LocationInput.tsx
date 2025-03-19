import React, { useEffect, useState } from "react";

import AutoSuggestTextInput from "@app/components/input/AutoSuggestTextInput";
import TextSkeleton from "@app/components/skeleton/TextSkeleton";
import { User } from "@app/types/Types";

interface LocationInputArgs {
  formData: User;
  setFormData: React.Dispatch<React.SetStateAction<User>>;
  setError?: (key: string, value: boolean) => void;
  setIsChanged?: (value: React.SetStateAction<boolean>) => void;
  required?: boolean;
}

const LocationInput: React.FC<LocationInputArgs> = ({
  formData,
  setFormData,
  setError,
  setIsChanged,
  required = false,
}) => {
  const [locations, setLocations] = useState<{ city: string; state: string }[]>(
    [],
  );
  const [dataFetched, setDataFetched] = useState<boolean>(false);

  // in this case we want the labels and values to be the same
  const locationLabels = locations.map((loc) => `${loc.city}, ${loc.state}`);

  function handleLocationSelect(newValue: string) {
    setFormData((prevState) => ({
      ...prevState,
      location: newValue,
    }));

    if (setError) {
      setError("location", false);
    }

    if (setIsChanged) {
      setIsChanged(true);
    }
  }

  useEffect(() => {
    fetch("/data/us_cities.json")
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .then(() => setDataFetched(true))
      .catch((error) => console.error("Error fetching city data:", error));
  }, []);

  if (!dataFetched) return <TextSkeleton />;

  return (
    <div className="w-full px-3">
      <label
        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        htmlFor="location"
      >
        Location {required && <span className="text-red-500">*</span>}
      </label>
      <AutoSuggestTextInput
        labels={locationLabels}
        values={locationLabels}
        onSelect={handleLocationSelect}
        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
        placeholder="City, State"
        required={required}
        id="location"
        initialValue={formData.location}
      />
    </div>
  );
};

export default LocationInput;
