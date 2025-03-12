import React, { useState } from "react";
import { toast } from "react-toastify";

import { USER_STATUS_FLAGGED, USER_STATUS_OPTIONS } from "@app/appConstants";
import Title from "@app/components/Title";
import SubmitButton from "@app/components/buttons/SubmitButton";
import { useAdminUpdateUserStatus } from "@app/hooks/admin";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";
import { validateUserID } from "@app/utils/inputValidation";

const AdminManageUserStatuses: React.FC = () => {
  const [userID, setUserID] = useState<string>("");
  const [userStatus, setUserStatus] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const updateUserStatusMutation = useAdminUpdateUserStatus();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    if (id === "userId") {
      setUserID(value.trim());
    } else if (id === "userStatus") {
      setUserStatus(value);
    } else if (id === "comment") {
      setComment(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side input validation
    if (!validateUserID(userID)) {
      toast.info("Inputted UserID is not a valid user ID.");
      return;
    }

    if (userStatus.length === 0) {
      toast.info("Please select a userStatus.");
      return;
    }

    if (userStatus === USER_STATUS_FLAGGED && comment.trim().length === 0) {
      toast.info("Please add a comment if you are flagging a user's account.");
      return;
    }

    setIsSubmitting(true);
    updateUserStatusMutation.mutate(
      {
        userId: userID,
        status: userStatus,
        comment: comment,
      },
      {
        onSuccess: () => toast.success("User Status updated."),
        onError: mutationErrorCallbackCreator("Failed to update user status"),
        onSettled: () => setIsSubmitting(false),
      },
    );
  };

  return (
    <div className="flex flex-col w-full md:w-1/2">
      <Title
        title="Update User Statuses"
        description="User accounts are going to be in one of three stauses: normal, private, or flagged."
      />
      <p>
        If a user has an inappropriate user profile, you can flag their account
        here and give them a comment on how to fix their account so that it can
        be set to public again. You also have the capability to toggle an
        account to any status at any point.
      </p>

      <form className="form__vertical_inputs" onSubmit={handleSubmit}>
        {/* user id input */}
        <label className="label__text_input_gray" htmlFor="userId">
          User ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="userId"
          placeholder="User ID"
          value={userID}
          onChange={handleChange}
          className="input__text_gray_box w-full"
        />
        <label className="label__text_input_gray" htmlFor="userStatus">
          User Status <span className="text-red-500">*</span>
        </label>
        <select
          id="userStatus"
          className="input__text_gray_box w-full"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="">Select Option</option>
          {USER_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <label className="label__text_input_gray" htmlFor="comment">
          Comment (required if flagging an account)
        </label>
        <input
          type="text"
          id="comment"
          value={comment}
          onChange={handleChange}
          className="input__text_gray_box w-full"
          required={userStatus === USER_STATUS_FLAGGED}
        />

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
};

export default AdminManageUserStatuses;
