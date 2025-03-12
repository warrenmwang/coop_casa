import React, { useState } from "react";

import { REGULAR_DASHBOARD_SECTION_LOCALSTORAGE_KEY } from "@app/appConstants";
import AllLikedEntitiesSection from "@app/components/AllLikedEntitiesSection";
import Title from "@app/components/Title";
import WizardNavigationButtons from "@app/components/buttons/WizardNavigationButtons";
import TransferCommunityForm from "@app/components/communities/TransferCommunityForm";
import UserOwnedCommunitiesTable from "@app/components/communities/UserOwnedCommunitiesTable";
import CreateCommunityForm from "@app/components/form/CreateCommunityForm";
import UpdateCommunityManager from "@app/components/form/UpdateCommunityManager";

const RegularDashboard: React.FC = () => {
  const sections: string[] = ["Your Liked", "Community"];

  const sectionSaved =
    localStorage.getItem(REGULAR_DASHBOARD_SECTION_LOCALSTORAGE_KEY) !== null
      ? (localStorage.getItem(
          REGULAR_DASHBOARD_SECTION_LOCALSTORAGE_KEY,
        ) as string)
      : "";
  const [currentSection, setCurrentSection] = useState<string>(
    sections.includes(sectionSaved) ? sectionSaved : sections[0],
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newSection = e.currentTarget.textContent as string;
    setCurrentSection(newSection);
    localStorage.setItem(
      REGULAR_DASHBOARD_SECTION_LOCALSTORAGE_KEY,
      newSection,
    );
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
