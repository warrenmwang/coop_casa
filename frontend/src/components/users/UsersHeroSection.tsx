import React from "react";
import Title from "../Title";
import peopleCircleImage from "../../assets/people_circle.webp";

const UsersHeroSection: React.FC = () => {
  return (
    <>
      <Title
        title="Browse Who's on Coop"
        description="Find your fellow coopers and create your own communities!"
      />
      <img
        alt="users in a circle image"
        src={peopleCircleImage}
        className="mx-auto"
      />
      <p className="text-center justify-normal font__paragraph_1">
        People come in all different kinds of shapes and sizes. Every person has
        a unique story to tell, with their own sets of strengths and weaknesses.
        Find your complement(s) here.
      </p>
    </>
  );
};

export default UsersHeroSection;
