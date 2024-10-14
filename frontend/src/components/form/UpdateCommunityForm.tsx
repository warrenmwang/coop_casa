import React, { useState, useEffect } from "react";
import TextInput from "../input/TextInput";
import MultipleImageUploader from "../input/MultipleImageUploader";
import { MAX_COMMUNITY_IMGS_ALLOWED } from "appConstants";
import {
  fileArray2OrderedFileArray,
  orderedFileArray2FileArray,
} from "../../utils/utils";
import { OrderedFile, Community, CommunityDetails } from "../../types/Types";
import { toast } from "react-toastify";
import { useGetUserProfiles } from "hooks/users";
import { useGetProperties } from "hooks/properties";
import {
  constructAddressString,
  costNumsToPresentableString,
} from "../../utils/property";
import FormButton from "../buttons/FormButton";
import { useUpdateCommunity } from "hooks/communities";
import { mutationErrorCallbackCreator } from "utils/callbacks";

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
    <>
      {/* update form */}
      <form className="form__update_community">
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
      {/* show the users */}
      <h1>Users</h1>
      {/* <div className="flex">
        {userPublicProfileQueries.map((userQuery) => {
          if (userQuery.data != undefined) {
            return <UserProfileCard userProfile={userQuery.data} />;
          }
          return null;
        })}
      </div> */}
      <table>
        <thead>
          <tr>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              UserID
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              First Name
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Last Name
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Age
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Gender
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Location
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Interests
            </th>
          </tr>
        </thead>
        <tbody>
          {userPublicProfileQueries.map((query) => {
            if (query.data) {
              return (
                <tr key={query.data.details.userId}>
                  <th>{query.data.details.userId}</th>
                  <th>{query.data.details.firstName}</th>
                  <th>{query.data.details.lastName}</th>
                  <th>{query.data.details.ageInYears}</th>
                  <th>{query.data.details.gender}</th>
                  <th>{query.data.details.location}</th>
                  <th>{query.data.details.interests.join(", ")}</th>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
      <form className="form__vertical_inputs">
        <label className="label__text_input_gray">User ID</label>
        <input
          type="text"
          id="community_user_update"
          placeholder="User ID"
          value={userIDInput}
          onChange={handleUserIDInput}
          className="input__text_gray_box w-full"
        />
        <div className="flex gap-3">
          <button
            type="button"
            className="button__green"
            onClick={handleAddUser}
          >
            Add User
          </button>
          <button
            type="button"
            className="button__red"
            onClick={handleRemoveUser}
          >
            Remove User
          </button>
          <FormButton
            onClick={handleResetUserIDInput}
            displayText="Clear"
            className="button__gray"
          />
        </div>
      </form>
      {/* show the properties */}
      <h1>Properties</h1>
      {/* <div className="flex">
        {propertiesQueries.map((propertyQuery) => {
          if (propertyQuery.data !== undefined) {
            return <PropertyCard property={propertyQuery.data} />;
          }
          return null;
        })}
      </div> */}
      <table>
        <thead>
          <tr>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              PropertyID
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Address
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Cost
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              ListerUserID
            </th>
          </tr>
        </thead>
        <tbody>
          {propertiesQueries.map((query) => {
            if (query.data) {
              const addressString = constructAddressString(query.data.details);

              const costString = costNumsToPresentableString(
                query.data.details.costDollars,
                query.data.details.costCents,
              );

              return (
                <tr key={query.data.details.propertyId}>
                  <th>{query.data.details.propertyId}</th>
                  <th>{addressString}</th>
                  <th>{costString}</th>
                  <th>{query.data.details.listerUserId}</th>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
      <form className="form__vertical_inputs">
        <label className="label__text_input_gray">Property ID</label>
        <input
          type="text"
          id="community_user_update"
          placeholder="Property ID"
          value={propertyIDInput}
          onChange={handlePropertyIDInput}
          className="input__text_gray_box w-full"
        />
        <div className="flex gap-3">
          <button
            type="button"
            className="button__green"
            onClick={handleAddProperty}
          >
            Add Property
          </button>
          <button
            type="button"
            className="button__red"
            onClick={handleRemoveProperty}
          >
            Remove Property
          </button>
          <FormButton
            onClick={handleResetPropertyIDInput}
            displayText="Clear"
            className="button__gray"
          />
        </div>
      </form>

      <div className="px-3">
        <label className="label__text_input_gray">
          Upload some images of the community. At least 1 image is required.
          <span className="text-red-500">*</span>
        </label>
        <MultipleImageUploader
          onImagesUploaded={handleImagesUpload}
          images={formImages}
          setIsChanged={setIsChanged}
        />
      </div>

      <div className="pt-3">
        {/* Save / discard buttons */}
        {isChanged && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleDiscardChanges}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Discard Changes
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UpdateCommunityForm;
