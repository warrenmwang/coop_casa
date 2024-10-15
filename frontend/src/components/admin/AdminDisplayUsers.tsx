import React, { useState } from "react";
import { toast } from "react-toastify";
import TextSkeleton from "components/skeleton/TextSkeleton";
import {
  useAdminGetUserDetails,
  useAdminGetUserRoles,
  useAdminGetUserStatuses,
} from "hooks/admin";
import { MAX_USERS_PER_PAGE } from "appConstants";

const AdminDisplayUsers: React.FC = () => {
  const [page, setPage] = useState<number>(0);

  const userDetailsQueries = useAdminGetUserDetails(MAX_USERS_PER_PAGE, page);

  const userIDs: string[] =
    userDetailsQueries.data?.map((userDetail) => userDetail.userId) || [];

  const userRoleQueries = useAdminGetUserRoles(userIDs);

  const userStatusQueries = useAdminGetUserStatuses(userIDs);

  const isLastPage: boolean =
    (userDetailsQueries.data?.length || 0) < MAX_USERS_PER_PAGE;

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

  if (userDetailsQueries.isFetching || userRoleQueries.isFetching) {
    return <TextSkeleton />;
  }

  return (
    <div>
      {/* table that shows all the users */}
      <div className="flex justify-center items-center space-x-4 mt-4 py-1">
        <h1 className="h1_custom">User Management</h1>
      </div>
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="table__col">UserID</th>
            <th className="table__col">Email</th>
            <th className="table__col">First Name</th>
            <th className="table__col">Last Name</th>
            <th className="table__col">Role</th>
            <th className="table__col">Status</th>
          </tr>
        </thead>
        <tbody>
          {userDetailsQueries.data?.map((user, index) => (
            <tr key={user.userId} className="hover:bg-gray-50">
              <td className="table__col">{user.userId}</td>
              <td className="table__col">{user.email}</td>
              <td className="table__col">{user.firstName}</td>
              <td className="table__col">{user.lastName}</td>
              <td className="table__col">{userRoleQueries.data?.at(index)}</td>
              <td className="table__col">
                {userStatusQueries?.at(index)?.data?.userStatus.status
                  ? userStatusQueries?.at(index)?.data?.userStatus.status
                  : "Unknown"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TODO: future feature: be able to search for users by their First and Last Name */}

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
