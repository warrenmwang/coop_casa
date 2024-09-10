import * as React from "react";
import { useGetUserProfiles } from "../../hooks/users";
import UserProfileCard from "../users/UserProfileCard";
import { UserProfile } from "../../types/Types";
import Modal from "../Modal";

type CommunityUsersProfilesSectionProps = {
  userIDs: string[];
};
const CommunityUsersProfilesSection: React.FC<
  CommunityUsersProfilesSectionProps
> = ({ userIDs }) => {
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const userProfileQueries = useGetUserProfiles(userIDs);

  const userProfiles: UserProfile[] = userProfileQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    }) as UserProfile[];

  return (
    <>
      <div className="text-3xl font-bold">Community Members</div>
      <div className="flex items-center gap-2">
        {userProfiles.slice(0, 3).map((value) => {
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
        title="Browse More Community Members"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {userProfiles.slice(0, 3).map((value) => {
            return (
              <UserProfileCard key={value.details.userId} userProfile={value} />
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default CommunityUsersProfilesSection;
