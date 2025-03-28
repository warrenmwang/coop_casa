import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { MAX_COMMUNITY_IMGS_ALLOWED } from "@app/appConstants";
import FetchErrorText from "@app/components/FetchErrorText";
import SubmitButton from "@app/components/buttons/SubmitButton";
import MultipleImageUploader from "@app/components/input/MultipleImageUploader";
import TextInput from "@app/components/input/TextInput";
import TextSkeleton from "@app/components/skeleton/TextSkeleton";
import { useGetUserAccountDetails } from "@app/hooks/account";
import { useCreateCommunity } from "@app/hooks/communities";
import { Community, CommunityDetails, OrderedFile } from "@app/types/Types";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";
import { v4 as uuidv4 } from "uuid";

type TextFieldsConstruct = {
  id: string;
  label: string;
  placeholder: string;
  value: string | number;
  required: boolean;
  type: string;
  min?: string;
  max?: string;
};

export const EmptyCommunityDetails: CommunityDetails = {
  communityId: "",
  adminUserId: "",
  name: "",
  description: "",
};

// This component lets the user create a community,
// and be able to view and modify their created properties.
// (for authorized users: admin or lister roles)
const CreateCommunityForm: React.FC = () => {
  const [communityDetails, setCommunityDetails] = useState<CommunityDetails>(
    EmptyCommunityDetails,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setMyMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  ); // if any key value in errors is true, then there is a problem.
  const [images, setImages] = useState<OrderedFile[]>([]);
  const [userID, setUserID] = useState<string>("");

  // Need to grab the user id from backend to use as adminUserId
  // for marking who the community belongs to.
  const userQuery = useGetUserAccountDetails();
  const createCommunity = useCreateCommunity();

  // Required fields we want from the user.
  const communityRequiredFields: string[] = ["name", "images"];

  const setErrors = (key: string, value: boolean) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  // for constructing the textinputs
  const communityTextFieldsConstructs: TextFieldsConstruct[] = [
    {
      id: "name",
      label: "Community Name",
      placeholder: "",
      value: communityDetails.name,
      required: true,
      type: "text",
    },
    {
      id: "description",
      label: "Description",
      placeholder: "",
      value: communityDetails.description,
      required: false,
      type: "text",
    },
  ];

  const textInputHandleChange = (id: string, value: string) => {
    setCommunityDetails((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleImagesUploaded = (files: OrderedFile[]) => {
    // update errors
    if (files.length > MAX_COMMUNITY_IMGS_ALLOWED) {
      setErrors("images", true);
      toast.error(
        `Uploaded more than the maximum allowable images (${MAX_COMMUNITY_IMGS_ALLOWED}).`,
      );
      return;
    } else if (files.length === 0) {
      setErrors("images", true);
      return;
    }

    // no errors (at least 1 image)
    setErrors("images", false);
    // save images state
    setImages(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set is submitting true, prevent spamming submit and start submission process.
    setIsSubmitting(true);
  };

  // As soon as we get user data, save it for the communities creation form.
  useEffect(() => {
    if (userQuery.status === "success") {
      setUserID(userQuery.data.userDetails.userId);
    }
  }, [userQuery.status]);

  // Initialize with errots for all required fields, thus needing to make sure that
  // the required fields are entered.
  useEffect(() => {
    // Set Errors for required fields that the user needs to fill in
    communityRequiredFields.forEach((field) => {
      setErrors(field, true);
    });
  }, []);

  // Submit data if can submit
  useEffect(() => {
    if (isSubmitting) {
      // Only progress if no errors
      for (const [k, v] of errors) {
        if (v) {
          setIsSubmitting(false);
          toast.error(`Fix field: ${k}`);
          return;
        }
      }

      // Format community with the details and images
      // and inject a uuid for communityid and the adminuserid
      // of the user
      const community: Community = {
        details: {
          ...communityDetails,
          communityId: uuidv4(),
          adminUserId: userID,
        },
        images: images.map((image) => image.file),
        users: [],
        properties: [],
      };

      // Send data to backend
      createCommunity.mutate(
        { community },
        {
          onSuccess: () => {
            // Reset form on creation success
            setCommunityDetails({ ...EmptyCommunityDetails });
            setImages([]);
            toast.success("Community created.");
          },
          onError: mutationErrorCallbackCreator("Unable to create community"),
          onSettled: () => setIsSubmitting(false),
        },
      );
    }
  }, [isSubmitting, communityDetails]);

  const ready: boolean = userQuery.isFetched;
  if (!ready) {
    return <TextSkeleton />;
  }

  if (userQuery.status === "error") {
    return (
      <FetchErrorText>
        Unable to verify your account identity and authority to create a
        community at the moment.
      </FetchErrorText>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="h1_custom">Add Community Listing</h1>
      <h4 className="h4_custom">
        This form allows you to create a new community on the platform.
      </h4>
      {/* create a new community */}
      <form className="form__vertical_inputs" onSubmit={handleSubmit}>
        {communityTextFieldsConstructs.map((value, index) => (
          <TextInput
            key={index}
            setFormData={textInputHandleChange}
            setError={setErrors}
            type={value.type}
            id={value.id}
            label={value.label}
            placeholder={value.placeholder}
            value={`${value.value}`}
            required={value.required}
            min={value.min}
            max={value.max}
            classNameCustom="w-full"
          />
        ))}

        {/* Images */}
        <div className="px-3">
          <label className="label__text_input_gray">
            Upload some images of the community. At least 1 image is required.
            <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            <MultipleImageUploader
              images={images}
              onImagesUploaded={handleImagesUploaded}
            />
            <SubmitButton isSubmitting={isSubmitting} className="w-3/5" />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCommunityForm;
