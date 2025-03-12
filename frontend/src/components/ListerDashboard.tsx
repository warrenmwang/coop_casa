import React, { useState } from "react";

import { LISTER_DASHBOARD_SECTION_LOCALSTORAGE_KEY } from "@app/appConstants";
import AllLikedEntitiesSection from "@app/components/AllLikedEntitiesSection";
import BrowseListers from "@app/components/BrowseListers";
import Title from "@app/components/Title";
import WizardNavigationButtons from "@app/components/buttons/WizardNavigationButtons";
import TransferCommunityForm from "@app/components/communities/TransferCommunityForm";
import UserOwnedCommunitiesTable from "@app/components/communities/UserOwnedCommunitiesTable";
import CreateCommunityForm from "@app/components/form/CreateCommunityForm";
import CreatePropertyForm from "@app/components/form/CreatePropertyForm";
import UpdateCommunityManager from "@app/components/form/UpdateCommunityManager";
import UpdatePropertyManager from "@app/components/form/UpdatePropertyManager";
import TransferPropertyForm from "@app/components/properties/TransferPropertyForm";
import UserOwnedPropertiesTable from "@app/components/properties/UserOwnedPropertiesTable";

const ListerDashboard: React.FC = () => {
  const sections: string[] = ["Lister", "Your Liked", "Property", "Community"];
  const sectionSaved =
    localStorage.getItem(LISTER_DASHBOARD_SECTION_LOCALSTORAGE_KEY) !== null
      ? (localStorage.getItem(
          LISTER_DASHBOARD_SECTION_LOCALSTORAGE_KEY,
        ) as string)
      : "";
  const [currentSection, setCurrentSection] = useState<string>(
    sections.includes(sectionSaved) ? sectionSaved : sections[0],
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newSection = e.currentTarget.textContent as string;
    setCurrentSection(newSection);
    localStorage.setItem(LISTER_DASHBOARD_SECTION_LOCALSTORAGE_KEY, newSection);
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
