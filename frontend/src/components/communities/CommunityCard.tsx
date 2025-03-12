import React from "react";
import { Link } from "react-router-dom";

import Card from "@app/components/Card";
import { Community } from "@app/types/Types";
import { communitiesPageLink } from "@app/urls";

type CommunityCardProps = {
  community: Community;
};

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  const communityDetailPage = `${communitiesPageLink}/${community.details.communityId}`;

  const description = (
    <div className="mt-2">
      <p className="text-gray-600 line-clamp-2">
        {community.details.description}
      </p>
    </div>
  );

  return (
    <Link
      to={communityDetailPage}
      className="block transition-transform hover:scale-102 duration-200"
    >
      <Card
        title={community.details.name}
        imageUrl={community.images[0]}
        description={description}
        imageSize="lg"
      />
    </Link>
  );
};

export default React.memo(CommunityCard);
