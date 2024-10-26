import React, { useState } from "react";
import SubmitButton from "@app/components/buttons/SubmitButton";

import { toast } from "react-toastify";
import { useAdminGetUserRoles, useAdminUpdateUserRole } from "@app/hooks/admin";
import { mutationErrorCallbackCreator } from "@app/utils/callbacks";
import {
  USER_ROLE_LISTER,
  USER_ROLE_OPTIONS,
  USER_ROLE_REGULAR,
} from "@app/appConstants";
import { validateUserID } from "@app/utils/inputValidation";

const AdminManageUserRoles: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [propertyTransfer, setPropertyTransfer] = useState<string>("transfer");
  const [transferUserID, setTransferUserID] = useState<string>("");

  const updateUserRoleMutation = useAdminUpdateUserRole();
  const roleQuery = useAdminGetUserRoles(
    validateUserID(userID) ? [userID] : [],
  );

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

    if (
      roleQuery.status === "success" &&
      roleQuery.data &&
      roleQuery.data.at(0) === USER_ROLE_LISTER &&
      role === USER_ROLE_REGULAR &&
      propertyTransfer === "transfer" &&
      !validateUserID(transferUserID)
    ) {
      toast.warn(
        "Need to provide another lister's userID if transferring the properties of a lister that will become a regular account.",
      );
      setIsSubmitting(false);
      return;
    }

    updateUserRoleMutation.mutate(
      {
        userID,
        role,
        propertyTransfer: propertyTransfer === "transfer",
        transferUserID,
      },
      {
        onSuccess: () => {
          toast.success("User role updated.");
          setUserID("");
          setRole("");
          setPropertyTransfer("transfer");
          setTransferUserID("");
        },
        onError: mutationErrorCallbackCreator("Failed to update"),
        onSettled: () => setIsSubmitting(false),
      },
    );
  };

  return (
    <div className="flex flex-col w-full md:w-1/2">
      <div className="flex justify-center items-center space-x-4 mt-4 py-1">
        <h1 className="h1_custom">Update User Role</h1>
      </div>
      {/* Allow for querying for the user's current role */}
      <form className="form__vertical_inputs" onSubmit={handleSubmit}>
        {/* user id input */}
        <label className="label__text_input_gray" htmlFor="user_id">
          User ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="user_id"
          placeholder="User ID"
          value={userID}
          onChange={(e) => setUserID(e.target.value.trim())}
          className="input__text_gray_box w-full"
          required
        />

        {/* drop down of role types */}
        <label className="label__text_input_gray" htmlFor="role">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          className="input__text_gray_box w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">Select Option</option>
          {USER_ROLE_OPTIONS.map((role) => {
            return (
              <option key={role} value={role}>
                {role}
              </option>
            );
          })}
        </select>

        {role === USER_ROLE_REGULAR &&
          roleQuery.status === "success" &&
          roleQuery.data &&
          roleQuery.data.at(0) === USER_ROLE_LISTER && (
            <>
              <label
                className="label__text_input_gray"
                htmlFor="transferPropertyOption"
              >
                User is a Lister. What to do with their properties?{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                id="transferPropertyOption"
                className="input__text_gray_box"
                value={propertyTransfer}
                onChange={(e) => setPropertyTransfer(e.target.value)}
                required
              >
                <option value="transfer" defaultChecked>
                  Transfer
                </option>
                <option value="delete">Delete</option>
              </select>
              <label className="label__text_input_gray" htmlFor="otherUserID">
                Transferred to Lister User ID (required if transferring)
              </label>
              <input
                id="otherUserID"
                type="text"
                className="input__text_gray_box"
                placeholder="User ID"
                value={transferUserID}
                onChange={(e) => setTransferUserID(e.target.value.trim())}
                required={propertyTransfer === "transfer"}
              />
            </>
          )}

        {/* submit for updating user role */}
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
};

export default AdminManageUserRoles;
