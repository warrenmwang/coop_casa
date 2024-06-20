import React from "react";
import Footer from "../structure/Footer";
import TopNavbar from "../structure/TopNavbar";
import Title from "../structure/Title";
import Card from "../structure/Card";
import elizabeth_img from "../../images/elizabeth.jpeg"
import warren_img from "../../images/warren.png"
import gloria_img from "../../images/gloria.jpeg"
import barbara_img from "../../images/barbara.jpeg"

import "../../styles/ContentBody.css"

const AboutPage : React.FC = () => {
  return(
    <div>
      <TopNavbar></TopNavbar>
      <div className="content-body">
        <Title title="About Us" description=""></Title>
        We are a small group of students that originally met at Bucknell University and we wanted to do something 
        for other people in a way that doesn't cost them much.

        Why was COOP created.
        <br/><br/>
        The target audience for Coop is young people. The goal of Coop is to reduce the suffering of young people becoming true adults and living in homes away from their parents either by themselves or with other people.
        <br/><br/>
        Undergraduate college advertising campaigns have made many young Americans have the desire to go to college. College provides an experience for young people that literally changes their lives, for better or for worse, where they learn both academic and technical skills as well as crucial social and life skills. Undergrad enhances people’s intellectual curiosity and drive to push the frontiers of knowledge or their employability in corporate America to achieve their dream job; it allows people to start their journey of self-discovery and newfound social life while balancing basic life chores. However, college is very expensive and once people leave college, many people have a hard to time to stay in touch with their college friends. Furthermore, as with the boom and bust economic cycle, it’s hard out there for many people, looking for jobs and looking to start their adult life in new cities or whatever. 
        <br/><br/>
        This is where Coop comes in. We want to help with the process of potentially moving to a new city and having to find a new job and find friends right after college, or after whatever chapter of your life just ended to begin this new one.
        <br/><br/>
        We combine the social connectivity that makes us human with finding a place to live. Find a place to live that you can call your home without renting or knowing that it is temporary and not yours. You will OWN your home with your friends and community. Find your community and be a property owner today without doing it alone. Coop, connecting communities empowering ownership.

        <Title title="Meet The Team"></Title>
        <Card
          title="Elizabeth Addo"
          description={
            <div>
              <p className="text-gray-600" style={{fontWeight: "bold"}}>Human Resources and Outreach</p>
              <p className="text-gray-600">With a rich palette of interests ranging from film and creative writing to screenwriting, computer science, and community engagement, I am eager to bring my blend of creative insight and technical acumen to a team that values transformative ideas and is committed to making a difference through their work.</p>
            </div>
          }
          imageUrl={elizabeth_img}
        />
        <Card
          title="Gloria Sporea"
          description={
            <div>
              <p className="text-gray-600" style={{fontWeight: "bold"}}>Marketing and Event Coordinator</p>
              <p className="text-gray-600">With a passion for learning and exploring the natural world, I am pursuing a Bachelor of Science degree in Biology at Bucknell University. I am also interested in marketing and diversity, and I have developed relevant skills and knowledge through my work experience on campus.</p>
            </div>
          }
          imageUrl={gloria_img}
        />
        <Card
          title="Barbara Wankollie"
          description={
            <div>
              <p className="text-gray-600" style={{fontWeight: "bold"}}>Talent Acquisition</p>
              <p className="text-gray-600">Member of the class of 2025, majoring in International Relation, and Women and Gender Studies. Freeman scholar and SHE-CAN Scholar. Student Intern at Griot Institute for Black Life and culture. Student assistant for Alumina House, Bucknell University.</p>
            </div>
          }
          imageUrl={barbara_img}
        />
        <Card 
          title="Warren Wang"
          description={
            <div>
              <p className="text-gray-600" style={{fontWeight: "bold"}}>Contracted Web Developer</p>
              <p className="text-gray-600">With a desire to bring value into people's lives at low to no monetary costs, I was inspired by the founders' vision for Coop and wanted to apply my skillset to their mission. I am the sole developer for the Coop web app.</p>
            </div>
          }
          imageUrl={warren_img}
        />
      </div>
      <Footer></Footer>
    </div>
  )
}

export default AboutPage;