import React, { useState } from "react";
import { api_admin_users_roles_Link } from "../../urls";
import { checkFetch } from "../../api/api";
import { AuthData } from "../../auth/AuthWrapper";

const AdminManageUserRoles: React.FC = () => {

  const auth = AuthData();
  const { user } = auth;

  const roleTypes = ["lister", "regular"];

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const handleSubmit = (e : React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // prevent admin from recking their own account
    if (userID === user.userId) {
      alert("Don't be stupid now, admin.")
      setIsSubmitting(false);
      return;
    }

    if (userID === "") {
      alert("Cannot update an empty user ID");
      setIsSubmitting(false);
      return;
    }

    if (role === "") {
      alert("Cannot update with empty role")
      setIsSubmitting(false);
      return;
    }

    fetch(`${api_admin_users_roles_Link}?userID=${userID}&role=${role}`, {
      method: "POST",
      credentials: "include"
    }).then(checkFetch)
      .then(() => {
        setIsSubmitting(false);
      })
      .catch((err) => {
        console.error(err)
        setIsSubmitting(false);
      });
  };

  const handleChange = (e : React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === "user_id") {
      setUserID(value);
    } else if (id === "role") {
      setRole(value);
    }
  };

  return (
    <>
      <h2 className="h2_custom">Update User Role </h2>
      {/* Allow for querying for the user's current role */}
      <form className="">
        {/* user id input */}
        <label
          className="text_input_field_label_gray"
          htmlFor="user_id"
        >
          User ID
        </label>
        <input 
          type="text"
          id="user_id"
          placeholder="User ID"
          value={userID}
          onChange={handleChange}
          className="text_input_field_box_gray"
        />

        {/* drop down of role types */}
        <label
          className="text_input_field_label_gray"
          htmlFor="role"
        >
          Role
        </label>
        <select 
          id="role"
          className="text_input_field_box_gray"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="" disabled>Select Option</option>
          {roleTypes.map((role) => {
            return <option key={role} value={role}>{role}</option>
          })}
        </select>
      </form>

      {/* submit for updating user role */}
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-32 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        {isSubmitting ? "Submitting..." : "Update Role"}
      </button>
    </>
  );
};

export default AdminManageUserRoles;