import TopNavBar from "./TopNavbar";
import HeaderSection from "./HeaderSection";
import Footer from "./Footer";
import SearchLocations from "./SearchLocations";
import SearchCommunities from "./SearchCommunities";
import Card from "./Card";

import profileImg from "../images/profile.jpg"

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