import React from "react";
import { useNavigate } from "react-router-dom";

import Title from "@app/components/Title";
import {
  communitiesPageLink,
  propertiesPageLink,
  usersPageLink,
} from "@app/urls";

const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="content-body">
      <Title
        title="Browse on Coop Casa Now!"
        description="We can't promise to always be here for you, so look around while you can."
      />
      <div className="flex flex-wrap justify-center gap-10 mt-3">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "auto" });
            navigate(communitiesPageLink);
          }}
          className="px-8 py-4 text-2xl font-semibold text-white transition-all rounded-lg shadow-lg bg-green-500 hover:bg-green-600 hover:shadow-xl transform hover:-translate-y-1"
        >
          Communities
        </button>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "auto" });
            navigate(propertiesPageLink);
          }}
          className="px-8 py-4 text-2xl font-semibold text-white transition-all rounded-lg shadow-lg bg-blue-400 hover:bg-blue-500 hover:shadow-xl transform hover:-translate-y-1"
        >
          Properties
        </button>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "auto" });
            navigate(usersPageLink);
          }}
          className="px-8 py-4 text-2xl font-semibold text-white transition-all rounded-lg shadow-lg bg-red-500 hover:bg-red-600 hover:shadow-xl transform hover:-translate-y-1"
        >
          Users
        </button>
      </div>
    </div>
  );
};

export default CallToAction;
