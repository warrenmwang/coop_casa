import React from "react";

import styled from "@emotion/styled";

interface SkeletonPulseProps {
  height?: string;
  width?: string;
}

const CardContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: white;
`;

const SkeletonPulse = styled.div<SkeletonPulseProps>`
  display: inline-block;
  height: ${(props) => props.height || "1em"};
  width: ${(props) => props.width || "100%"};
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: pulse 1.2s ease-in-out infinite;
  border-radius: 4px;
  margin: 8px 0;

  @keyframes pulse {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: -135% 0%;
    }
  }
`;

const CardSkeleton: React.FC = () => {
  return (
    <CardContainer>
      <SkeletonPulse height="300px" width="100%" />
      <SkeletonPulse height="1em" width="90%" />
      <SkeletonPulse height="1em" width="80%" />
      <SkeletonPulse height="1em" width="60%" />
      <SkeletonPulse height="1em" width="70%" />
      <SkeletonPulse height="1em" width="80%" />
    </CardContainer>
  );
};

export default CardSkeleton;
