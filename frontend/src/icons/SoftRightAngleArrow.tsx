import React from "react";

interface SoftRightAngleArrowProps {
  invertX?: boolean;
  invertY?: boolean;
  width?: string;
  height?: string;
  color?: string;
}

const SoftRightAngleArrow: React.FC<SoftRightAngleArrowProps> = ({
  invertX = false,
  invertY = false,
  width = 22.703,
  height = 21.928,
  color = "currentColor",
}) => {
  const transform = `scale(${invertX ? -1 : 1}, ${invertY ? -1 : 1})`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 22.703 21.928"
      style={{ transform, display: "inline-block" }}
    >
      <path
        d="M1.056,21.928c0-6.531,5.661-9.034,10.018-9.375V18.1L22.7,9.044,11.073,0V4.836A10.5,10.5,0,0,0,3.729,8.188C-.618,12.946-.008,21,.076,21.928Z"
        fill={color}
      />
    </svg>
  );
};

export default SoftRightAngleArrow;
