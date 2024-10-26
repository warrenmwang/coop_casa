import React from "react";
import cartoonNeighborhood from "@app/assets/cartoonNeighborhood.jpg";

const stats = [
  { name: "Individual Ownership", value: "100%" },
  { name: "Dark Patterns and Hidden Fees", value: "0" },
  { name: "Offices Worldwide", value: "1" },
  // { name: "Active Members", value: "4" },
];

const HeaderSection: React.FC = () => {
  const textColor1 = "black";
  const block1ClassName = `text-4xl font-bold tracking-tight text-${textColor1} sm:text-6xl`;
  const textColor2 = "black";
  const block2ClassName = `mt-6 text-lg leading-8 text-${textColor2}-300`;

  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
      {/* background image */}
      <img
        src={cartoonNeighborhood}
        alt="Image of a friendly cartoon neighborhood"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-right md:object-center"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* main text */}
        <div className="mx-auto max-w-2xl lg:mx-0 bg-white/30 backdrop-blur-md p-6 rounded-lg">
          <h2 className={block1ClassName}>
            Connecting Communities, Empowering Ownership
          </h2>
          <p className={block2ClassName}>
            Your Pivotal Platform for Shared Land Ownership, Alternative
            Housing, Legal Guidance, and Collaborative Home Solutions in the
            Face of the Housing Crisis
          </p>
        </div>

        {/* stats */}
        <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
          <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="flex flex-col-reverse backdrop-blur-md p-2 rounded-lg"
              >
                <dt className="text-base leading-7 text-black-300 ">
                  {stat.name}
                </dt>
                <dd className="text-2xl font-bold leading-9 tracking-tight text-black">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
