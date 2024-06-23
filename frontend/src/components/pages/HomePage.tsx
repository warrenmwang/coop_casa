import TopNavBar from "../structure/TopNavbar";
import HeaderSection from "../structure/HeaderSection";
import Footer from "../structure/Footer";
import Card from "../structure/Card";

import profileImg from "../../images/profile.jpg";
import PropertiesHomeBanner from "../structure/PropertiesHomeBanner";
import CommunitiesHomeBanner from "../structure/CommunitiesHomeBanner";

const HomePage: React.FC = () => {
  return (
    <div>
      <TopNavBar></TopNavBar>
      <HeaderSection></HeaderSection>
      {/* <div className="p-6">
        <Card
          title="Title"
          imageUrl={profileImg}
          description="description"
        ></Card>
      </div>
      
      <PropertiesHomeBanner/>

      <div className="p-6">
        <Card
          title="Title"
          imageUrl={profileImg}
          description="description"
          reverse={true}
        ></Card>
      </div>
      <CommunitiesHomeBanner/> */}

      <Footer></Footer>
    </div>
  );
};

export default HomePage;
