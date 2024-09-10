import * as React from "react";
import { useGetCommunities } from "../hooks/communities";
import { Community } from "../types/Types";
import CommunityCard from "./communities/CommunityCard";
import Modal from "./Modal";

type LayoutSectionCommunitiesWithModalProps = {
  communityIDs: string[];
};

const LayoutSectionCommunitiesWithModal: React.FC<
  LayoutSectionCommunitiesWithModalProps
> = ({ communityIDs }) => {
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const CommunityQueries = useGetCommunities(communityIDs);

  const Communities: Community[] = CommunityQueries.map(
    (value) => value.data,
  ).filter((value) => {
    return value !== undefined;
  }) as Community[];

  return (
    <>
      <div className="text-3xl font-bold">Community Communities</div>
      <div className="flex items-center gap-2">
        {Communities.slice(0, 3).map((value) => {
          return (
            <CommunityCard key={value.details.communityId} community={value} />
          );
        })}
        <button className="text-9xl" onClick={() => setIsModalOpen(true)}>
          ...
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Browse More Communities"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {Communities.slice(0, 3).map((value) => {
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
