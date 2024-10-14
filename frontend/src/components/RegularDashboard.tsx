import React, { useState } from "react";

import Title from "./Title";
import AllLikedEntitiesSection from "./AllLikedEntitiesSection";
import UserOwnedCommunitiesTable from "./communities/UserOwnedCommunitiesTable";
import TransferCommunityForm from "./communities/TransferCommunityForm";
import CreateCommunityForm from "components/form/CreateCommunityForm";
import UpdateCommunityManager from "components/form/UpdateCommunityManager";
import WizardNavigationButtons from "./buttons/WizardNavigationButtons";

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
