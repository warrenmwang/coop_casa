import TopNavBar from "../components/TopNavbar";
import HeaderSection from "../components/HeaderSection";
import Footer from "../components/Footer";
import Card from "../components/Card";

import profileImg from "../../images/profile.jpg";
import PropertiesHomeBanner from "../components/PropertiesHomeBanner";
import CommunitiesHomeBanner from "../components/CommunitiesHomeBanner";

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
