import React, { useState } from "react";
import { useGetUserProfiles } from "@app/hooks/users";
import UserProfileCard from "@app/components/users/UserProfileCard";
import { UserProfile } from "@app/types/Types";
import Modal from "@app/components/Modal";

import { LIKED_ENTITIES_DISPLAY_NUM_PREVIEW } from "@app/appConstants";

type LayoutSectionUsersProfilesWithModalProps = {
  userIDs: string[];
  modalTitle: string;
};

const LayoutSectionUsersProfilesWithModal: React.FC<
  LayoutSectionUsersProfilesWithModalProps
> = ({ userIDs, modalTitle }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const userProfileQueries = useGetUserProfiles(userIDs);

  const userProfiles: UserProfile[] = userProfileQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    }) as UserProfile[];

  return (
    <>
      <div className="container__horizontal_card_layout">
        {userProfiles
          .slice(0, LIKED_ENTITIES_DISPLAY_NUM_PREVIEW)
          .map((value) => {
            return (
              <UserProfileCard key={value.details.userId} userProfile={value} />
            );
          })}
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
          {userProfiles.map((value) => {
            return (
              <UserProfileCard key={value.details.userId} userProfile={value} />
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default LayoutSectionUsersProfilesWithModal;
