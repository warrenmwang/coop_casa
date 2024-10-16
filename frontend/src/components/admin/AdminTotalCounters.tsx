import TextSkeleton from "components/skeleton/TextSkeleton";
import Title from "components/Title";
import {
  useAdminGetTotalNumberCommunities,
  useAdminGetTotalNumberProperties,
  useAdminGetTotalNumberUsers,
} from "hooks/admin";
import React from "react";

const AdminTotalCounters: React.FC = () => {
  const numUsers = useAdminGetTotalNumberUsers();
  const numProperties = useAdminGetTotalNumberProperties();
  const numCommunities = useAdminGetTotalNumberCommunities();

  if (
    numUsers.isFetching ||
    numProperties.isFetching ||
    numCommunities.isFetching
  ) {
    return <TextSkeleton />;
  }

  return (
    <>
      <Title title="Total Entity Counts" />
      <div className="flex justify-center gap-2">
        <div className="flex flex-col items-center">
          <h1>Users</h1>
          <h1>{numUsers.data ?? "Unknown"}</h1>
        </div>
        <div className="flex flex-col items-center">
          <h1>Properties</h1>
          <h1>{numProperties.data ?? "Unknown"}</h1>
        </div>
        <div className="flex flex-col items-center">
          <h1>Communities</h1>
          <h1>{numCommunities.data ?? "Unknown"}</h1>
        </div>
      </div>
    </>
  );
};

export default AdminTotalCounters;
