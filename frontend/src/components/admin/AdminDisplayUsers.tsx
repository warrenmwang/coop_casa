import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  useAdminGetUserDetails,
  useAdminGetUserRoles,
  useAdminGetUserStatuses,
} from "@app/hooks/admin";
import { MAX_USERS_PER_PAGE } from "@app/appConstants";
import AdminDisplayUsersTable from "@app/components/admin/AdminDisplayUsersTable";
import debounce from "lodash.debounce";

const AdminDisplayUsers: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const debouncedSetName = useCallback(
    debounce((n) => setName(n), 250),
    [],
  );

  const userDetailsQueries = useAdminGetUserDetails(
    MAX_USERS_PER_PAGE,
    page,
    name,
  );

  const userIDs: string[] =
    userDetailsQueries.data?.map((userDetail) => userDetail.userId) || [];

  const userRoleQueries = useAdminGetUserRoles(userIDs);

  const userStatusQueries = useAdminGetUserStatuses(userIDs);

  const isLastPage: boolean =
    (userDetailsQueries.data?.length || 0) < MAX_USERS_PER_PAGE;

  const handleUserNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
    debouncedSetName(e.target.value);
  };

  // user role - next button
  const handleNext = () => {
    if (isLastPage) {
      toast.info("No more users to show");
      return;
    }
    setPage((prevPage) => prevPage + 1);
  };

  // user role - back button
  const handlePrevious = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  return (
    <div>
      <div className="flex justify-center items-center space-x-4 mt-4 py-1">
        <h1 className="h1_custom">User Management</h1>
      </div>

      <form>
        <label className="label__text_input_gray">Filter users by name</label>
        <input
          type="text"
          placeholder="First and last name"
          value={displayName}
          onChange={handleUserNameInput}
          className="input__text_gray_box"
        />
      </form>

      <AdminDisplayUsersTable
        userDetailsQueries={userDetailsQueries}
        userRoleQueries={userRoleQueries}
        userStatusQueries={userStatusQueries}
      />

      {/* Prev and Next Pagination Buttons */}
      <div className="flex justify-center items-center space-x-4 mt-4 py-1">
        <button
          onClick={handlePrevious}
          disabled={page === 0}
          className="w-24 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="w-24 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDisplayUsers;
