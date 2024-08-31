import React, { useState } from "react";
import { toast } from "react-toastify";
import TextSkeleton from "../skeleton/TextSkeleton";
import { useAdminGetUserDetails, useAdminGetUserRoles } from "../hooks/admin";

const AdminDisplayUsers: React.FC = () => {
  const limit = 10;
  const [page, setPage] = useState<number>(0);

  const { data: userDetails, isFetching: userDetailsIsFetching } =
    useAdminGetUserDetails(limit, page);

  const userIDs: string[] =
    userDetails?.map((userDetail) => userDetail.userId) || [];

  const { data: userRoles, isFetching: userRolesIsFetching } =
    useAdminGetUserRoles(userIDs);

  const isLastPage: boolean = (userDetails?.length || 0) < limit;

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

  if (userDetailsIsFetching || userRolesIsFetching) {
    return <TextSkeleton />;
  }

  return (
    <div>
      {/* table that shows all the users */}
      <div className="flex justify-center items-center space-x-4 mt-4 py-1">
        <h1 className="h1_custom">User Management</h1>
      </div>
      <table className="min-w-full bg-white rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              UserID
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Email
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              First Name
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Last Name
            </th>
            <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {userDetails?.map((user, index) => (
            <tr key={user.userId} className="hover:bg-gray-50">
              <td className="px-4 py-2 border border-gray-300 text-gray-700">
                {user.userId}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-gray-700">
                {user.email}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-gray-700">
                {user.firstName}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-gray-700">
                {user.lastName}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-gray-700">
                {userRoles?.at(index)}
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
