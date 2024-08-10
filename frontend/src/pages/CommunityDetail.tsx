import React from "react";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";

const CommunityDetail: React.FC = () => {
  const { communityID } = useParams<{ communityID: string }>();
  return (
    <>
      <TopNavbar />
      <p>community detail page for {communityID}</p>
      <Footer />
    </>
  );
};

export default CommunityDetail;
