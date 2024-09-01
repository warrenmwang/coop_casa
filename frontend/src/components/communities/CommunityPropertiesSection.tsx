import React from "react";

type CommunityPropertiesSectionProps = {
  propertyIDs: string[];
};
const CommunityPropertiesSection: React.FC<CommunityPropertiesSectionProps> = ({
  propertyIDs,
}) => {
  return <>{propertyIDs}</>;
};

export default CommunityPropertiesSection;
