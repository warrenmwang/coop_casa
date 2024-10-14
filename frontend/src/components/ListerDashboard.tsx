import React, { useState } from "react";
import CreatePropertyForm from "components/form/CreatePropertyForm";
import UpdatePropertyManager from "components/form/UpdatePropertyManager";
import CreateCommunityForm from "components/form/CreateCommunityForm";
import UpdateCommunityManager from "components/form/UpdateCommunityManager";
import UserOwnedPropertiesTable from "./properties/UserOwnedPropertiesTable";
import UserOwnedCommunitiesTable from "./communities/UserOwnedCommunitiesTable";
import AllLikedEntitiesSection from "./AllLikedEntitiesSection";
import Title from "./Title";
import TransferPropertyForm from "./properties/TransferPropertyForm";
import TransferCommunityForm from "./communities/TransferCommunityForm";
import BrowseListers from "./BrowseListers";
import WizardNavigationButtons from "./buttons/WizardNavigationButtons";

const ListerDashboard: React.FC = () => {
  const sections: string[] = ["Lister", "Your Liked", "Property", "Community"];
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

      {currentSection === "Lister" && (
        <div>
          <Title
            title="Lister Section"
            description="Information and settings only for listers are present here."
          />
          <BrowseListers />
        </div>
      )}

      {currentSection === "Your Liked" && (
        <div className="flex flex-col">
          <Title
            title="Your Liked Collections"
            description="If you're not seeing anything, go browse the users, properties, and communities that exist on Coop now!"
          />
          <AllLikedEntitiesSection />
        </div>
      )}

      {currentSection === "Property" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center">
            <UserOwnedPropertiesTable />
            <TransferPropertyForm />
          </div>
          <div className="flex flex-row flex-wrap justify-center items-start gap-5">
            <CreatePropertyForm />
            <UpdatePropertyManager />
          </div>
        </div>
      )}

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
    </>
  );
};

export default ListerDashboard;
