import React, { useState } from "react";

import Title from "./Title";
import AllLikedEntitiesSection from "./AllLikedEntitiesSection";
import UserOwnedCommunitiesTable from "./communities/UserOwnedCommunitiesTable";
import TransferCommunityForm from "./communities/TransferCommunityForm";
import CreateCommunityForm from "../form/CreateCommunityForm";
import UpdateCommunityManager from "../form/UpdateCommunityManager";

const RegularDashboard: React.FC = () => {
  const sections: string[] = ["Your Liked", "Community"];
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
