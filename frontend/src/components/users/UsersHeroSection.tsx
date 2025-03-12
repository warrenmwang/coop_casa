import React from "react";
import { useNavigate } from "react-router-dom";
import Title from "@app/components/Title";
import peopleCircleImage from "@app/assets/people_circle.webp";
import "@app/styles/animations.css";
import { usersPageLink } from "@app/urls";

const UsersHeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in">
          <Title
            title="Users"
            description="Coop cannot be what it is without you, the people who make the communities!"
            className="text-gray-900"
          />
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-blue-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <img
              alt="Cartoon image of a circle of round stick men of red, blue, green, and yellow colors holding hands"
              src={peopleCircleImage}
              className="relative rounded-lg transform transition duration-500 group-hover:scale-105 w-4/5 mx-auto"
            />
          </div>
        </div>

        <div className="animate-fade-in-delayed">
          <div className="bg-gradient-to-br from-red-50 to-blue-50 rounded-2xl p-8 shadow-xl border border-red-100">
            <p className="text-lg text-gray-700 leading-relaxed">
              People come in all different kinds of shapes and sizes. Every
              person has a unique story to tell, with their own sets of
              strengths and weaknesses. Find your complement(s) here.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate(usersPageLink)}
                className="px-6 py-3 bg-gradient-to-r from-red-400 to-blue-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
              >
                Meet Our Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersHeroSection;
