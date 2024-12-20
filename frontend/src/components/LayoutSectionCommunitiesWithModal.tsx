import React, { useState } from "react";
import { useGetCommunities } from "@app/hooks/communities";
import { Community } from "@app/types/Types";
import CommunityCard from "@app/components/communities/CommunityCard";
import Modal from "@app/components/Modal";

import { LIKED_ENTITIES_DISPLAY_NUM_PREVIEW } from "@app/appConstants";

type LayoutSectionCommunitiesWithModalProps = {
  communityIDs: string[];
  modalTitle: string;
};

const LayoutSectionCommunitiesWithModal: React.FC<
  LayoutSectionCommunitiesWithModalProps
> = ({ communityIDs, modalTitle }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const CommunityQueries = useGetCommunities(communityIDs);

  const Communities: Community[] = CommunityQueries.map(
    (value) => value.data,
  ).filter((value) => {
    return value !== undefined;
  }) as Community[];

  return (
    <>
      <div className="container__horizontal_card_layout">
        {Communities.slice(0, LIKED_ENTITIES_DISPLAY_NUM_PREVIEW).map(
          (value) => {
            return (
              <CommunityCard
                key={value.details.communityId}
                community={value}
              />
            );
          },
        )}
        <button className="text-9xl" onClick={() => setIsModalOpen(true)}>
          ...
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="container__horizontal_card_layout">
          {Communities.map((value) => {
            return (
              <CommunityCard
                key={value.details.communityId}
                community={value}
              />
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default LayoutSectionCommunitiesWithModal;
