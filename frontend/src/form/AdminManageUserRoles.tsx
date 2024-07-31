import React, { useEffect, useState } from "react";
import { apiAdminUsersRolesLink } from "../urls";
import { AuthData } from "../auth/AuthWrapper";
import SubmitButton from "../components/SubmitButton";

const AdminManageUserRoles: React.FC = () => {
  const auth = AuthData();
  const { user } = auth;

  const roleTypes = ["lister", "regular"];

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // prevent admin from recking their own account
    if (userID === user.userId) {
      alert("Don't be stupid now, admin.");
      setIsSubmitting(false);
      return;
    }

    if (userID === "") {
      alert("Cannot update an empty user ID");
      setIsSubmitting(false);
      return;
    }

    if (role === "") {
      alert("Cannot update with empty role");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
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

  useEffect(() => {
    if (isSubmitting) {
      fetch(`${apiAdminUsersRolesLink}?userID=${userID}&role=${role}`, {
        method: "POST",
        credentials: "include",
      })
        .then(() => {
          setIsSubmitting(false);
          setUserID("");
        })
        .catch((err) => {
          console.error(err);
          setIsSubmitting(false);
        });
    }
  }, [isSubmitting]);

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
          <option value="" disabled>
            Select Option
          </option>
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
