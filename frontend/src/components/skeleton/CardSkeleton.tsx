import React from "react";

import "@app/styles/skeleton.css";

interface SkeletonPulseProps {
  height: string;
  width: string;
}

function SkeletonPulse(props: SkeletonPulseProps) {
  return (
    <div
      className="skeleton-pulse"
      style={{ height: props.height, width: props.width }}
    ></div>
  );
}

export default function CardSkeleton() {
  return (
    <div className="skeleton-container">
      <SkeletonPulse height="300px" width="100%" />
      <SkeletonPulse height="1em" width="90%" />
      <SkeletonPulse height="1em" width="80%" />
      <SkeletonPulse height="1em" width="60%" />
      <SkeletonPulse height="1em" width="70%" />
      <SkeletonPulse height="1em" width="80%" />
    </div>
  );
}
