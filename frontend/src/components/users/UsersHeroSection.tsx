import React from "react";
import Title from "@app/components/Title";
import peopleCircleImage from "@app/assets/people_circle.webp";

const UsersHeroSection: React.FC = () => {
  return (
    <div className="content-body flex flex-wrap md:flex-nowrap items-center justify-between">
      <div className="flex flex-col items-center">
        <Title
          title="Users"
          description="Coop cannot be what it is without you, the people who make the communities!"
        />
        <img
          alt="Cartoon image of a circle of round stick men of red, blue, green, and yellow colors holding hands"
          src={peopleCircleImage}
          className="w-4/5"
        />
      </div>

      <div className="w-full md:w-3/4 lg:w-1/2 bg-red-400 rounded-lg p-3 drop-shadow-xl">
        <p className="justify-normal font__paragraph_1 pretty_font_1">
          People come in all different kinds of shapes and sizes. Every person
          has a unique story to tell, with their own sets of strengths and
          weaknesses. Find your complement(s) here.
        </p>
      </div>
    </div>
  );
};

export default UsersHeroSection;
