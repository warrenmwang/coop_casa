import React, { useState } from "react";
import CreatePropertyForm from "@app/components/form/CreatePropertyForm";
import AdminManageUserRoles from "@app/components/form/AdminManageUserRoles";
import UpdatePropertyManager from "@app/components/form/UpdatePropertyManager";
import CreateCommunityForm from "@app/components/form/CreateCommunityForm";
import UpdateCommunityManager from "@app/components/form/UpdateCommunityManager";
import AdminDisplayUsers from "@app/components/admin/AdminDisplayUsers";
import UserOwnedPropertiesTable from "@app/components/properties/UserOwnedPropertiesTable";
import UserOwnedCommunitiesTable from "@app/components/communities/UserOwnedCommunitiesTable";
import AllLikedEntitiesSection from "@app/components/AllLikedEntitiesSection";
import Title from "@app/components/Title";
import TransferPropertyForm from "@app/components/properties/TransferPropertyForm";
import TransferCommunityForm from "@app/components/communities/TransferCommunityForm";
import BrowseListers from "@app/components/BrowseListers";
import AdminManageUserStatuses from "@app/components/admin/AdminManageUserStatuses";
import WizardNavigationButtons from "@app/components/buttons/WizardNavigationButtons";
import AdminTotalCounters from "@app/components/admin/AdminTotalCounters";
import { ADMIN_DASHBOARD_SECTION_LOCALSTORAGE_KEY } from "@app/appConstants";

const AdminDashboard: React.FC = () => {
  const sections: string[] = [
    "Admin",
    "Lister",
    "Your Liked",
    "Property",
    "Community",
  ];

  const sectionSaved =
    localStorage.getItem(ADMIN_DASHBOARD_SECTION_LOCALSTORAGE_KEY) !== null
      ? (localStorage.getItem(
          ADMIN_DASHBOARD_SECTION_LOCALSTORAGE_KEY,
        ) as string)
      : "";
  const [currentSection, setCurrentSection] = useState<string>(
    sections.includes(sectionSaved) ? sectionSaved : sections[0],
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newSection = e.currentTarget.textContent as string;
    setCurrentSection(newSection);
    localStorage.setItem(ADMIN_DASHBOARD_SECTION_LOCALSTORAGE_KEY, newSection);
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
