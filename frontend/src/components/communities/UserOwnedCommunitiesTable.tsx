import * as React from "react";

import FetchErrorText from "@app/components/FetchErrorText";
import TextSkeleton from "@app/components/skeleton/TextSkeleton";
import { useGetUserOwnedCommunitiesIDs } from "@app/hooks/account";
import { useGetCommunities } from "@app/hooks/communities";

const Table: React.FC<{ communityIDs: string[] }> = ({ communityIDs }) => {
  if (communityIDs === null) {
    communityIDs = [];
  }
  const queries = useGetCommunities(communityIDs);

  return (
    <table>
      <thead>
        <tr>
          <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
            ID
          </th>
          <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
            Name
          </th>
          <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
            Description
          </th>
          <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
            # of Members
          </th>
          <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
            # of Properties
          </th>
        </tr>
      </thead>
      <tbody>
        {queries.map((query) => {
          if (query.data) {
            return (
              <tr key={query.data.details.communityId}>
                <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
                  {query.data.details.communityId}
                </th>
                <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
                  {query.data.details.name}
                </th>
                <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
                  {query.data.details.description}
                </th>
                <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
                  {query.data.users.length}
                </th>
                <th className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold">
                  {query.data.properties.length}
                </th>
              </tr>
            );
          }
        })}
      </tbody>
    </table>
  );
};

const UserOwnedCommunitiesTable: React.FC = () => {
  const query = useGetUserOwnedCommunitiesIDs();

  if (query.isFetching) {
    return <TextSkeleton />;
  }
  if (query.isError) {
    return (
      <FetchErrorText>
        Unable to fetch your communities at the moment.
      </FetchErrorText>
    );
  }

  const communityIDs = query.data as string[];

  return (
    <div className="flex flex-col items-center">
      <h1 className="h1_custom">Your Communities</h1>
      <h4 className="h4_custom">
        If you don&apos;t see any, try creating one!
      </h4>
      <Table communityIDs={communityIDs} />
    </div>
  );
};
export default UserOwnedCommunitiesTable;
