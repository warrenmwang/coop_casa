import React from "react";
import { useNavigate } from "react-router-dom";
import SoftRightAngleArrow from "@app/components/icons/SoftRightAngleArrow";
import {
  communitiesPageLink,
  propertiesPageLink,
  usersPageLink,
} from "@app/urls";
import Title from "@app/components/Title";

const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-200">
      <div className="content-body">
        <Title
          title="Browse on Coop Casa Now!"
          description="We can't promise to always be here for you, so look around while you can."
        />
        <div className="flex flex-wrap justify-center gap-10 mt-3">
          <div className="hidden lg:block">
            <SoftRightAngleArrow invertY={true} width="150px" height="150px" />
          </div>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "auto" });
              navigate(communitiesPageLink);
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-bold text-5xl p-10 rounded-lg"
          >
            Communities
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "auto" });
              navigate(propertiesPageLink);
            }}
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold text-5xl p-10 rounded-lg"
          >
            Properties
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "auto" });
              navigate(usersPageLink);
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold text-5xl p-10 rounded-lg"
          >
            Users
          </button>

          <div className="hidden lg:block">
            <SoftRightAngleArrow
              invertX={true}
              invertY={true}
              width="150px"
              height="150px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
