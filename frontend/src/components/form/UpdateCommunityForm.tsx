import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { MAX_COMMUNITY_IMGS_ALLOWED } from "@app/appConstants";
import MultipleImageUploader from "@app/components/input/MultipleImageUploader";
import TextInput from "@app/components/input/TextInput";
import { useUpdateCommunity } from "@app/hooks/communities";
import { useGetProperties } from "@app/hooks/properties";
import { useGetUserProfiles } from "@app/hooks/users";
import { Community, CommunityDetails, OrderedFile } from "@app/types/Types";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";
import {
  constructAddressString,
  costNumsToPresentableString,
} from "@app/utils/property";
import {
  fileArray2OrderedFileArray,
  orderedFileArray2FileArray,
} from "@app/utils/utils";

const UpdateCommunityForm: React.FC<{
  community: Community;
  setCommunity: React.Dispatch<React.SetStateAction<Community | null>>;
}> = ({ community, setCommunity }) => {
  // Initialize the update form with the current community object's values
  // that can be updated here.

  const [formCommunity, setFormCommunity] = useState<Community>(community);

  // local states of community object
  // yes decoupling server state and local state of same thing is kind of
  // awkward, but this allows us to temporary discard changes
  // that a user could be making to the community object
  const [formDetails, setFormDetails] = useState<CommunityDetails>({
    ...community.details,
  });
  const [formImages, setFormImages] = useState<OrderedFile[]>([
    ...fileArray2OrderedFileArray(community.images),
  ]);
  const [formUsers, setFormUsers] = useState<string[]>([...community.users]);
  const [formProperties, setFormProperties] = useState<string[]>([
    ...community.properties,
  ]);

  const [isChanged, setIsChanged] = useState(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userIDInput, setUserIDInput] = useState<string>("");
  const [propertyIDInput, setPropertyIDInput] = useState<string>("");

  const userPublicProfileQueries = useGetUserProfiles(community.users);
  const propertiesQueries = useGetProperties(community.properties);

  const updateCommunity = useUpdateCommunity();

  const setErrors = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  const handleUserIDInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUserIDInput(e.target.value.trim());
  };

  const handlePropertyIDInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPropertyIDInput(e.target.value.trim());
  };

  const handleAddUser = () => {
    if (userIDInput.length === 0) {
      toast.info("Input contains no substance (empty or just whitespace).");
      return;
    }
    if (formUsers.findIndex((x) => x === userIDInput) !== -1) {
      toast.info(
        "User is either already in the community or has been staged to be added.",
      );
      return;
    }
    setFormUsers([...formUsers, userIDInput]);
    setIsChanged(true);
    toast.info(`Staged adding user ${userIDInput}`);
  };

  const handleRemoveUser = () => {
    if (userIDInput.length === 0) {
      toast.info("Input contains no substance (empty or just whitespace).");
      return;
    }
    if (formUsers.findIndex((x) => x === userIDInput) === -1) {
      toast.error(
        "User is already not a member of the community or has been staged to be removed.",
      );
      return;
    }
    setFormUsers([...formUsers.filter((x) => x !== userIDInput)]);
    setIsChanged(true);
    toast.info(`Staged removing user ${userIDInput}`);
  };

  const handleResetUserIDInput = () => {
    setUserIDInput("");
  };

  const handleAddProperty = () => {
    if (propertyIDInput.length === 0) {
      toast.info("Input contains no substance (empty or just whitespace).");
      return;
    }
    if (formProperties.findIndex((x) => x === propertyIDInput) !== -1) {
      toast.info(
        "Property is either already in the community or has been staged to be added.",
      );
      return;
    }
    setFormProperties([...formProperties, propertyIDInput]);
    setIsChanged(true);
    toast.info(`Staged adding property ${propertyIDInput}`);
  };

  const handleRemoveProperty = () => {
    if (propertyIDInput.length === 0) {
      toast.info("Input contains no substance (empty or just whitespace).");
      return;
    }
    if (formProperties.findIndex((x) => x === propertyIDInput) === -1) {
      toast.error(
        "Property is already not a member of the community or has been staged to be removed.",
      );
      return;
    }
    setFormProperties([...formProperties.filter((x) => x !== propertyIDInput)]);
    setIsChanged(true);
    toast.info(`Staged removing property ${propertyIDInput}`);
  };

  const handleResetPropertyIDInput = () => {
    setPropertyIDInput("");
  };

  const handleDiscardChanges = () => {
    setFormCommunity({ ...community });
    setFormDetails({ ...community.details });
    setFormImages([...fileArray2OrderedFileArray(community.images)]); // This is cursed. unfort, priority goes to getting features, not quality code rn...when will i actually come to fix this spaghetti? when i make money.
    setFormUsers([...community.users]);
    setFormProperties([...community.properties]);
    setIsChanged(false);
  };

  const textInputSetFormData = (id: string, value: string) => {
    setFormDetails((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleImagesUpload = (files: OrderedFile[]) => {
    // update errors
    if (files.length > MAX_COMMUNITY_IMGS_ALLOWED) {
      setFormImages([]);
      toast.error(
        `Uploaded more than the maximum allowable images (${MAX_COMMUNITY_IMGS_ALLOWED}).`,
      );
      return;
    } else if (files.length === 0) {
      setErrors("images", true);
    } else {
      setErrors("images", false);
    }

    // save images state
    setFormImages(files);
  };

  const handleSaveChanges = async () => {
    // ensure no errors in the "main" textinput fields
    for (const key of errors.keys()) {
      if (errors.get(key)) {
        toast.error(`Resolve error in field "${key}" first before submitting.`);
        return;
      }
    }

    // save community details and images and start submission request.
    setFormCommunity({
      details: formDetails,
      images: orderedFileArray2FileArray(formImages),
      users: formUsers,
      properties: formProperties,
    } as Community);
    setIsSubmitting(true);
  };

  useEffect(() => {
    if (isSubmitting) {
      updateCommunity.mutate(
        { community: formCommunity },
        {
          onSuccess: () => {
            setFormDetails({ ...formCommunity.details });
            setFormImages([
              ...fileArray2OrderedFileArray(formCommunity.images),
            ]);
            setFormUsers([...formCommunity.users]);
            setFormProperties([...formCommunity.properties]);
            setIsChanged(false);
            setCommunity({ ...formCommunity });
            toast.success("Community updated.");
          },
          onError: mutationErrorCallbackCreator("Failed to update"),
          onSettled: () => setIsSubmitting(false),
        },
      );
    }
  }, [isSubmitting]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Basic Information Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Basic Information
        </h2>
        <form className="space-y-4">
          <TextInput
            setFormData={textInputSetFormData}
            setIsChanged={setIsChanged}
            type="text"
            label="Community Name"
            id="name"
            value={formDetails.name}
            required={true}
            classNameCustom="w-full"
          />
          <TextInput
            setFormData={textInputSetFormData}
            setIsChanged={setIsChanged}
            type="text"
            label="Description"
            id="description"
            value={formDetails.description}
            classNameCustom="w-full"
          />
        </form>
      </section>

      {/* Members Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Community Members
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userPublicProfileQueries.map((query) => {
            if (query.data) {
              return (
                <div
                  key={query.data.details.userId}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative p-4"
                >
                  {/* Member Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {query.data.details.firstName[0]}
                        {query.data.details.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {query.data.details.firstName}{" "}
                        {query.data.details.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {query.data.details.location}
                      </p>
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Age: {query.data.details.ageInYears} •{" "}
                      {query.data.details.gender}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      ID: {query.data.details.userId}
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Interests
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {query.data.details.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Remove Member Button */}
                  <button
                    onClick={() => {
                      setUserIDInput(query.data.details.userId);
                      handleRemoveUser();
                    }}
                    className="absolute top-4 right-4 p-1.5 bg-red-50 hover:bg-red-100 rounded-full transition-colors duration-200"
                    title="Remove Member"
                  >
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Add Member Form */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Add New Member
          </h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              id="community_user_update"
              placeholder="Enter User ID"
              value={userIDInput}
              onChange={handleUserIDInput}
              className="flex-1 input__text_gray_box"
            />
            <button
              type="button"
              onClick={handleAddUser}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors inline-flex items-center"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Member
            </button>
            <button
              type="button"
              onClick={handleResetUserIDInput}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Community Properties
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PropertyID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ListerUserID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {propertiesQueries.map((query) => {
                if (query.data) {
                  const addressString = constructAddressString(
                    query.data.details,
                  );
                  const costString = costNumsToPresentableString(
                    query.data.details.costDollars,
                    query.data.details.costCents,
                  );
                  return (
                    <tr
                      key={query.data.details.propertyId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {query.data.details.propertyId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {addressString}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {costString}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {query.data.details.listerUserId}
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              id="community_property_update"
              placeholder="Enter Property ID"
              value={propertyIDInput}
              onChange={handlePropertyIDInput}
              className="flex-1 input__text_gray_box"
            />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAddProperty}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Add Property
              </button>
              <button
                type="button"
                onClick={handleRemoveProperty}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={handleResetPropertyIDInput}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Images Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Community Images
        </h2>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Upload community images (at least 1 required)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <MultipleImageUploader
            onImagesUploaded={handleImagesUpload}
            images={formImages}
            setIsChanged={setIsChanged}
          />
        </div>
      </section>

      {/* Action Buttons */}
      {isChanged && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleDiscardChanges}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Discard Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateCommunityForm;
