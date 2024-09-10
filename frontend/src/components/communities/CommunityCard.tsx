import React, { useMemo } from "react";
import { Community } from "../../types/Types";
import { communitiesPageLink } from "../../urls";
import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia } from "@mui/material";
import "../../styles/mui.css";

type CommunityCardProps = {
  community: Community;
};

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  const communityDetailPage = `${communitiesPageLink}/${community.details.communityId}`;

  const cardImage: string = useMemo(
    () => URL.createObjectURL(community.images[0]),
    [community.images],
  );

  return (
    <>
      <Link to={communityDetailPage}>
        <Card className="mui__card">
          <CardMedia image={cardImage} title="" className="mui__card_media" />
          <CardContent>
            <div className="text-3xl font-bold">{community.details.name}</div>
            <div className="text-2xl">{community.details.description}</div>
          </CardContent>
        </Card>
      </Link>
    </>
  );
};

export default React.memo(CommunityCard);
