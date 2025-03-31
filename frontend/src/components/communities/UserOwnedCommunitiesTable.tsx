import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import FetchErrorText from "@app/components/FetchErrorText";
import { useGetUserOwnedCommunitiesIDs } from "@app/hooks/account";
import { useGetCommunities } from "@app/hooks/communities";
import { communitiesPageLink } from "@app/urls";

const CommunityGrid: React.FC<{ communityIDs: string[] }> = ({
  communityIDs,
}) => {
  if (communityIDs === null) {
    communityIDs = [];
  }
  const queries = useGetCommunities(communityIDs);

  const handleCopyId = (e: React.MouseEvent, communityId: string) => {
    e.preventDefault(); // Prevent navigation when clicking the copy button
    navigator.clipboard.writeText(communityId);
    toast.success("Community ID copied to clipboard!");
  };

  if (queries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 italic mb-4">No communities found</div>
        <div className="text-sm text-gray-600">Create one to get started!</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {queries.map((query) => {
        if (query.data) {
          const community = query.data;
          const detailPage = `${communitiesPageLink}/${community.details.communityId}`;

          return (
            <Link
              key={community.details.communityId}
              to={detailPage}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative"
            >
              {/* Community Image */}
              <div className="relative h-48 bg-gray-100">
                {community.images[0] && (
                  <img
                    src={URL.createObjectURL(community.images[0])}
                    alt={community.details.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-100 transition-colors">
                    {community.details.name || "Unnamed"}
                  </h3>
                </div>
              </div>

              {/* Community Info */}
              <div className="p-4">
                <div className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {community.details.description || "No description"}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {community.users.length} Members
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {community.properties.length} Properties
                    </span>
                  </div>
                </div>

                {/* Copy ID Button */}
                <button
                  onClick={(e) => handleCopyId(e, community.details.communityId)}
                  className="absolute bottom-4 right-4 p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors duration-200 group"
                  title="Copy Community ID"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 group-hover:text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
              </div>
            </Link>
          );
        }
        return null;
      })}
    </div>
  );
};

const UserOwnedCommunitiesTable: React.FC = () => {
  const query = useGetUserOwnedCommunitiesIDs();

  if (query.isFetching) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-4 animate-pulse"
          >
            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
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
    <div className="w-full">
      <CommunityGrid communityIDs={communityIDs} />
    </div>
  );
};

export default UserOwnedCommunitiesTable;
