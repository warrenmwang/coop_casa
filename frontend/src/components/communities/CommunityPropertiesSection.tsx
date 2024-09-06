import React from "react";

type CommunityPropertiesSectionProps = {
  propertyIDs: string[];
};
const CommunityPropertiesSection: React.FC<CommunityPropertiesSectionProps> = ({
  propertyIDs,
}) => {
  return (
    <>
      <div className="text-3xl font-bold">Community Properties</div>
      <div>TODO:</div>
      <div>should be some property cards that let you open a modal</div>
      {JSON.stringify(propertyIDs)}
    </>
  );
};

export default CommunityPropertiesSection;
