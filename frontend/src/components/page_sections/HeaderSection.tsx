import React from "react";

import cartoonNeighborhood from "@app/assets/cartoonNeighborhood.jpg";
import "@app/styles/animations.css";

const stats = [
  { name: "Individual Ownership", value: "100%" },
  { name: "Dark Patterns and Hidden Fees", value: "0" },
  { name: "Offices Worldwide", value: "1" },
  // { name: "Active Members", value: "4" },
];

const HeaderSection: React.FC = () => {
  return (
    <div className="relative isolate min-h-screen flex items-center pointer-events-none">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img
          src={cartoonNeighborhood}
          alt="Image of a friendly cartoon neighborhood"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-green-500/30 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 pointer-events-auto">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6 font-sans animate-fade-in">
            <span className="bg-clip-text text-gray-900">
              Connecting Communities, Empowering Ownership
            </span>
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-900 max-w-3xl animate-fade-in-delayed">
            Your Pivotal Platform for Shared Land Ownership, Alternative
            Housing, Legal Guidance, and Collaborative Home Solutions in the
            Face of the Housing Crisis
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 shadow-xl transform hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <dt className="text-lg font-medium text-gray-900">{stat.name}</dt>
              <dd className="text-3xl font-bold tracking-tight text-gray-900 mt-2">
                {stat.value}
              </dd>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative blur circles */}
      <div
        className="absolute -top-40 transform-gpu blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#ff4694]/20 to-[#776fff]/20 opacity-20" />
      </div>
    </div>
  );
};

export default HeaderSection;
