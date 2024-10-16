import { UseQueryResult } from "@tanstack/react-query";
import TextSkeleton from "components/skeleton/TextSkeleton";
import React from "react";
import { UserDetails, UserStatusTimeStamped } from "types/Types";

type props = {
  userDetailsQueries: UseQueryResult<UserDetails[], Error>;
  userRoleQueries: UseQueryResult<string[], Error>;
  userStatusQueries: UseQueryResult<UserStatusTimeStamped, Error>[];
};

const AdminDisplayUsersTable: React.FC<props> = ({
  userDetailsQueries,
  userRoleQueries,
  userStatusQueries,
}) => {
  if (userDetailsQueries.isPending || userRoleQueries.isPending) {
    return <TextSkeleton />;
  }

  return (
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
  );
};

export default AdminDisplayUsersTable;
