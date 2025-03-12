import React from "react";
import { useNavigate } from "react-router-dom";

import cartoonNeighborhood from "@app/assets/cartoonNeighborhood1.png";
import Title from "@app/components/Title";
import "@app/styles/animations.css";
import { propertiesPageLink } from "@app/urls";

const PropertiesHeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in-delayed order-2 lg:order-1">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 shadow-xl border border-blue-100">
            <p className="text-lg text-gray-700 leading-relaxed">
              Homes are not about the physical location or its structure. It
              {`'`}s about the memories and shared lived experiences you have at
              that place. We hope you can find a property that will help
              facilitate finding a place that can do that for you.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate(propertiesPageLink)}
                className="px-6 py-3 bg-gradient-to-r from-blue-400 to-green-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
              >
                Explore Properties
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8 animate-fade-in order-1 lg:order-2">
          <Title
            title="Properties"
            description="Find the perfect place to co-own and create unforgettable memories with your friends."
            className="text-gray-900"
          />
          <div className="relative group overflow-hidden rounded-lg w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <img
              alt="Cartoon image of a street of different colored homes lined up next to one another on a blue sky day"
              src={cartoonNeighborhood}
              className="relative rounded-lg transform transition duration-500 group-hover:scale-105 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesHeroSection;
