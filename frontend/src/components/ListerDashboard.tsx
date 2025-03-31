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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto">
          <WizardNavigationButtons
            sections={sections}
            currentSection={currentSection}
            handleClick={handleClick}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto">
        <div className="min-h-[calc(100vh-4rem)]">
          {/* Lister Section */}
          {currentSection === "Lister" && (
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <Title
                  title="Lister Section"
                  description="Information and settings only for listers are present here."
                />
                <div className="mt-6">
                  <BrowseListers />
                </div>
              </div>
            </div>
          )}

          {/* Your Liked Section */}
          {currentSection === "Your Liked" && (
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <Title
                  title="Your Liked Collections"
                  description="If you're not seeing anything, go browse the users, properties, and communities that exist on Coop now!"
                />
                <div className="mt-6">
                  <AllLikedEntitiesSection />
                </div>
              </div>
            </div>
          )}

          {/* Property Section */}
          {currentSection === "Property" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6">
              {/* Left Column - Properties Grid (8 columns) */}
              <div className="xl:col-span-8 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Your Properties
                  </h2>
                  <UserOwnedPropertiesTable />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <UpdatePropertyManager />
                </div>
              </div>

              {/* Right Column - Forms (4 columns) */}
              <div className="xl:col-span-4 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Create Property
                  </h2>
                  <CreatePropertyForm />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <TransferPropertyForm />
                </div>
              </div>
            </div>
          )}

          {/* Community Section */}
          {currentSection === "Community" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6">
              {/* Left Column - Communities Grid (8 columns) */}
              <div className="xl:col-span-8 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Your Communities
                  </h2>
                  <UserOwnedCommunitiesTable />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <UpdateCommunityManager />
                </div>
              </div>

              {/* Right Column - Forms (4 columns) */}
              <div className="xl:col-span-4 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Create Community
                  </h2>
                  <CreateCommunityForm />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <TransferCommunityForm />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListerDashboard;
