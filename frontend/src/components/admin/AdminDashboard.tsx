import React, { useState } from "react";
import CreatePropertyForm from "../../form/CreatePropertyForm";
import AdminManageUserRoles from "../../form/AdminManageUserRoles";
import UpdatePropertyManager from "../../form/UpdatePropertyManager";
import CreateCommunityForm from "../../form/CreateCommunityForm";
import UpdateCommunityManager from "../../form/UpdateCommunityManager";
import AdminDisplayUsers from "./AdminDisplayUsers";
import UserOwnedPropertiesTable from "../properties/UserOwnedPropertiesTable";
import UserOwnedCommunitiesTable from "../communities/UserOwnedCommunitiesTable";
import AllLikedEntitiesSection from "../AllLikedEntitiesSection";
import Title from "../Title";
import TransferPropertyForm from "../properties/TransferPropertyForm";
import TransferCommunityForm from "../communities/TransferCommunityForm";
import BrowseListers from "../BrowseListers";

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
      {/* Screen Navigation Buttons */}
      <div className="flex gap-2 my-2 p-2 bg-gray-100 rounded-lg w-fit mx-auto">
        {sections.map((section, i) => (
          <button
            disabled={currentSection === section}
            key={i}
            className={`border-2 rounded-md  p-3 ${currentSection === section ? "bg-green-400 hover:bg-none" : "bg-gray-300 hover:bg-gray-400"}`}
            onClick={handleClick}
          >
            {section}
          </button>
        ))}
      </div>

      {currentSection === "Admin" && (
        <>
          <AdminDisplayUsers />
          <AdminManageUserRoles />
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
