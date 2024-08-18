import React, { useState } from "react";
import SubmitButton from "../components/SubmitButton";
import "../styles/input.css";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { apiAdminUpdateUserRole } from "../api/admin";
import axios, { AxiosError } from "axios";

const AdminManageUserRoles: React.FC = () => {
  const roleTypes = ["lister", "regular"];
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const mutation = useMutation({
    mutationKey: ["admin", "userRole", userID],
    mutationFn: () => apiAdminUpdateUserRole(userID, role),
    onSuccess: () => {
      toast.success("User role updated.");
      setUserID("");
      setRole("");
      setIsSubmitting(false);
    },
    onError: (error: Error | AxiosError) => {
      let errMsg: string = error.message;
      if (axios.isAxiosError(error)) {
        errMsg = `${(error as AxiosError).response?.data}`;
      }
      toast.error(`Failed to update because: ${errMsg}`);
      setIsSubmitting(false);
    },
  });

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

    mutation.mutate();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    if (id === "user_id") {
      setUserID(value);
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
      <form className="default-form-1">
        {/* user id input */}
        <label className="text_input_field_label_gray" htmlFor="user_id">
          User ID
        </label>
        <input
          type="text"
          id="user_id"
          placeholder="User ID"
          value={userID}
          onChange={handleChange}
          className="text_input_field_box_gray w-full"
        />

        {/* drop down of role types */}
        <label className="text_input_field_label_gray" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          className="text_input_field_box_gray w-full"
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
