import React from "react";
import { Community } from "../types/Types";

type CommunityCardProps = {
  community: Community;
};

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  return <>{JSON.stringify(community)}</>;
};

export default React.memo(CommunityCard);
