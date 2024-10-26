import React, { useState } from "react";

import Title from "@app/components/Title";
import AllLikedEntitiesSection from "@app/components/AllLikedEntitiesSection";
import UserOwnedCommunitiesTable from "@app/components/communities/UserOwnedCommunitiesTable";
import TransferCommunityForm from "@app/components/communities/TransferCommunityForm";
import CreateCommunityForm from "@app/components/form/CreateCommunityForm";
import UpdateCommunityManager from "@app/components/form/UpdateCommunityManager";
import WizardNavigationButtons from "@app/components/buttons/WizardNavigationButtons";

const RegularDashboard: React.FC = () => {
  const sections: string[] = ["Your Liked", "Community"];
  const [currentSection, setCurrentSection] = useState<string>(sections[0]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCurrentSection(e.currentTarget.textContent as string);
  };

  return (
    <>
      <WizardNavigationButtons
        sections={sections}
        currentSection={currentSection}
        handleClick={handleClick}
      />

      {currentSection === "Community" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center">
            <UserOwnedCommunitiesTable />
            <TransferCommunityForm />
          </div>
          <div className="flex flex-row flex-wrap justify-center">
            <CreateCommunityForm />
            <UpdateCommunityManager />
          </div>
        </div>
      )}

      {currentSection === "Your Liked" && (
        <>
          <Title
            title="Your Liked Collections"
            description="If you're not seeing anything, go browse the users, properties, and communities that exist on Coop now!"
          />
          <AllLikedEntitiesSection />
        </>
      )}
    </>
  );
};

export default RegularDashboard;
