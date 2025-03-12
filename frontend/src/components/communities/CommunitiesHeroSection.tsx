import React from "react";
import { useNavigate } from "react-router-dom";
import Title from "@app/components/Title";
import communityClipArt from "@app/assets/communityClipArt.png";
import "@app/styles/animations.css";
import { communitiesPageLink } from "@app/urls";

const CommunitiesHeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in w-full">
          <Title
            title="Communities"
            description="It takes a village to raise a child. We all need one another, and we hope you can find community here."
            className="text-gray-900"
          />
          <div className="relative group overflow-hidden rounded-lg w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <img
              alt="Cartoon image of a diverse group of people smiling and enjoying each others' company"
              src={communityClipArt}
              className="relative rounded-lg transform transition duration-500 group-hover:scale-105 w-full object-cover"
            />
          </div>
        </div>

        <div className="animate-fade-in-delayed">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-xl border border-green-100">
            <p className="text-lg text-gray-700 leading-relaxed">
              Going through any and all stages of life alone can be noble and
              fulfilling in its own right, but going through life with others,
              friends and family, can help you to achieve your goals faster and
              while having fun and building meaningful relationships that will
              last a lifetime.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate(communitiesPageLink)}
                className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
              >
                Join Our Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitiesHeroSection;
