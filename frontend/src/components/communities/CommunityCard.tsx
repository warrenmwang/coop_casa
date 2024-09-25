import React from "react";
import { Community } from "../../types/Types";
import { communitiesPageLink } from "../../urls";
import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia } from "@mui/material";

import MemoizedImageElement from "../MemoizedImageElement";

type CommunityCardProps = {
  community: Community;
};

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  const communityDetailPage = `${communitiesPageLink}/${community.details.communityId}`;

  return (
    <>
      <Link to={communityDetailPage}>
        <Card className="mui__card">
          <CardMedia title="Community first image" className="mui__card_media">
            <MemoizedImageElement
              image={community.images[0]}
              className="mui__card_media"
            />
          </CardMedia>
          <CardContent className="mui__card_content">
            <div className="text-3xl font-bold">{community.details.name}</div>
            <div className="text-2xl">{community.details.description}</div>
          </CardContent>
        </Card>
      </Link>
    </>
  );
};

export default React.memo(CommunityCard);
