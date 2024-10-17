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
    <div className="flex flex-col items-center">
      <Title title="Total Entity Counts" />
      <div className="w-full md:w-1/2 xl:w-1/3 flex justify-around gap-3 bg-slate-100 p-3 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <h1 className="text-lg text-green-500 underline">Communities</h1>
          <h1 className="text-3xl text-green-600">{numCommunities.data ?? "Unknown"}</h1>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-lg text-blue-500 underline">Properties</h1>
          <h1 className="text-3xl text-blue-600">{numProperties.data ?? "Unknown"}</h1>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-lg text-red-500 underline">Users</h1>
          <h1 className="text-3xl text-red-600">{numUsers.data ?? "Unknown"}</h1>
        </div>
      </div>
    </div>
  );
};

export default AdminTotalCounters;
