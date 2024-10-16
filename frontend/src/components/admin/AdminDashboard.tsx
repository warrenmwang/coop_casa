import React, { useState } from "react";
import CreatePropertyForm from "components/form/CreatePropertyForm";
import AdminManageUserRoles from "components/form/AdminManageUserRoles";
import UpdatePropertyManager from "components/form/UpdatePropertyManager";
import CreateCommunityForm from "components/form/CreateCommunityForm";
import UpdateCommunityManager from "components/form/UpdateCommunityManager";
import AdminDisplayUsers from "./AdminDisplayUsers";
import UserOwnedPropertiesTable from "../properties/UserOwnedPropertiesTable";
import UserOwnedCommunitiesTable from "../communities/UserOwnedCommunitiesTable";
import AllLikedEntitiesSection from "../AllLikedEntitiesSection";
import Title from "../Title";
import TransferPropertyForm from "../properties/TransferPropertyForm";
import TransferCommunityForm from "../communities/TransferCommunityForm";
import BrowseListers from "../BrowseListers";
import AdminManageUserStatuses from "./AdminManageUserStatuses";
import WizardNavigationButtons from "components/buttons/WizardNavigationButtons";
import AdminTotalCounters from "./AdminTotalCounters";

const AdminDashboard: React.FC = () => {
  const sections: string[] = [
    "Admin",
    "Lister",
    "Your Liked",
    "Property",
    "Community",
  ];
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

      {currentSection === "Admin" && (
        <>
          <AdminTotalCounters />
          <AdminDisplayUsers />
          <div className="flex flex-wrap md:flex-nowrap">
            <AdminManageUserRoles />
            <AdminManageUserStatuses />
          </div>
        </>
      )}

      {currentSection === "Lister" && (
        <>
          <BrowseListers />
        </>
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

      {currentSection === "Property" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-row flex-wrap justify-center items-start gap-5">
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
          <div className="flex flex-row flex-wrap justify-center">
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

export default AdminDashboard;
