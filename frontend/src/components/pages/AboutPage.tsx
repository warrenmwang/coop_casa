import React from "react";
import Title from "@app/components/Title";
import coopLogo from "@app/assets/coopAlt1.svg";

const AboutPage: React.FC = () => {
  return (
    <div className="content-body">
      <Title title="What is Coop?"></Title>
      <img alt="Coop logo" src={coopLogo} className="mx-auto" />
      <p className="text-sm italic text-center">
        Logo designed by Gloria Sporea
      </p>
      <br />
      <p>
        We are a small group of students that originally met at Bucknell
        University and we wanted to do something for other people in a way that
        doesn{"'"}t cost them much. Why was COOP created.
        <br />
        <br />
        The target audience for Coop is young people. The goal of Coop is to
        reduce the suffering of young people becoming true adults and living in
        homes away from their parents either by themselves or with other people.
        <br />
        <br />
        Undergraduate college advertising campaigns have made many young
        Americans have the desire to go to college. College provides an
        experience for young people that literally changes their lives, for
        better or for worse, where they learn both academic and technical skills
        as well as crucial social and life skills. Undergrad enhances people
        {"'"}s intellectual curiosity and drive to push the frontiers of
        knowledge or their employability in corporate America to achieve their
        dream job; it allows people to start their journey of self-discovery and
        newfound social life while balancing basic life chores. However, college
        is very expensive and once people leave college, many people have a hard
        to time to stay in touch with their college friends. Furthermore, as
        with the boom and bust economic cycle, it
        {"'"}s hard out there for many people, looking for jobs and looking to
        start their adult life in new cities or whatever.
        <br />
        <br />
        This is where Coop comes in. We want to help with the process of
        potentially moving to a new city and having to find a new job and find
        friends right after college, or after whatever chapter of your life just
        ended to begin this new one.
        <br />
        <br />
        We combine the social connectivity that makes us human with finding a
        place to live. Find a place to live that you can call your home without
        renting or knowing that it is temporary and not yours. You will OWN your
        home with your friends and community. Find your community and be a
        property owner today without doing it alone. Coop, connecting
        communities empowering ownership.
      </p>
    </div>
  );
};

export default AboutPage;
