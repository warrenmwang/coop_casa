import TopNavBar from "../structure/TopNavbar";
import HeaderSection from "../structure/HeaderSection";
import Footer from "../structure/Footer";
import SearchLocations from "../structure/SearchLocations";
import SearchCommunities from "../structure/SearchCommunities";
import Card from "../structure/Card";

import profileImg from "../../images/profile.jpg"

const Home: React.FC = () => {
  return (
    <div>
      <TopNavBar></TopNavBar>
      <HeaderSection></HeaderSection>
      <Card
        title="Title"
        imageUrl={profileImg}
        description="description"
      ></Card>
      <SearchLocations></SearchLocations>
      <Card
        title="Title"
        imageUrl={profileImg}
        description="description"
        reverse={true}
      ></Card>
      <SearchCommunities></SearchCommunities>
      <Footer></Footer>
    </div>
  );
}

export default Home; 