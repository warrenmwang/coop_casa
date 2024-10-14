import React, { useState } from "react";
import SubmitButton from "../buttons/SubmitButton";

import { toast } from "react-toastify";
import { useAdminUpdateUserRole } from "hooks/admin";
import { mutationErrorCallbackCreator } from "utils/callbacks";

const AdminManageUserRoles: React.FC = () => {
  const roleTypes = ["lister", "regular"];
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const updateUserRoleMutation = useAdminUpdateUserRole();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (userID === "") {
      toast.warn("Cannot update an empty user ID");
      setIsSubmitting(false);
      return;
    }

    if (role === "") {
      toast.warn("Cannot update with empty role");
      setIsSubmitting(false);
      return;
    }

    updateUserRoleMutation.mutate(
      { userID, role },
      {
        onSuccess: () => {
          toast.success("User role updated.");
          setUserID("");
          setRole("");
        },
        onError: mutationErrorCallbackCreator("Failed to update"),
        onSettled: () => setIsSubmitting(false),
      },
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    if (id === "user_id") {
      setUserID(value.trim());
    } else if (id === "role") {
      setRole(value);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center space-x-4 mt-4 py-1">
        <h1 className="h1_custom">Update User Role</h1>
      </div>
      {/* Allow for querying for the user's current role */}
      <form className="form__vertical_inputs">
        {/* user id input */}
        <label className="label__text_input_gray" htmlFor="user_id">
          User ID
        </label>
        <input
          type="text"
          id="user_id"
          placeholder="User ID"
          value={userID}
          onChange={handleChange}
          className="input__text_gray_box w-full"
        />

        {/* drop down of role types */}
        <label className="label__text_input_gray" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          className="input__text_gray_box w-full"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="">Select Option</option>
          {roleTypes.map((role) => {
            return (
              <option key={role} value={role}>
                {role}
              </option>
            );
          })}
        </select>

        {/* submit for updating user role */}
        <SubmitButton isSubmitting={isSubmitting} onClick={handleSubmit} />
      </form>
    </>
  );
};

export default AdminManageUserRoles;
