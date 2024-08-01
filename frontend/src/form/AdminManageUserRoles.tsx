import React, { useEffect, useState } from "react";
import { apiAdminUsersRolesLink } from "../urls";
import SubmitButton from "../components/SubmitButton";
import "../styles/input.css";
import { useQuery } from "@tanstack/react-query";
import { apiGetUser } from "../api/api";
import { APIUserReceived, User, UserDetails } from "../types/Types";
import { EmptyUser } from "../types/Objects";
import { toast } from "react-toastify";
import { apiFile2ClientFile } from "../utils/utils";
import TextSkeleton from "../skeleton/TextSkeleton";

const AdminManageUserRoles: React.FC = () => {
  const userQuery = useQuery({
    queryKey: ["user", "details"],
    queryFn: apiGetUser,
  });

  const roleTypes = ["lister", "regular"];

  const [user, setUser] = useState<User>(EmptyUser);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // prevent admin from recking their own account
    if (userID === user.userId) {
      toast.warn("Don't be stupid now, admin.");
      setIsSubmitting(false);
      return;
    }

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
    if (userQuery.status === "success") {
      const received: APIUserReceived = userQuery.data;
      const details: UserDetails = received.userDetails;
      const avatarImg: File | null = apiFile2ClientFile(
        received.avatarImageB64,
      );
      setUser({
        ...details,
        avatar: avatarImg,
      });
    } else if (userQuery.status === "error") {
      toast.error("Unable to fetch user data.");
    }
  }, [userQuery.status]);

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

  const ready: boolean = userQuery.isFetched;

  return ready ? (
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
  ) : (
    <TextSkeleton />
  );
};

export default AdminManageUserRoles;
