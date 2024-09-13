import * as React from "react";

type HeartIconProps = {
  fill?: string;
  stroke?: string;
  height?: string;
  width?: string;
};

const HeartIcon: React.FC<HeartIconProps> = ({
  fill = "#000000",
  stroke = "currentColor",
  height = "800px",
  width = "800px",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      // fill="none"
      fill={fill}
      viewBox="0 0 24 24"
      stroke-width="1.5"
      // stroke="currentColor"
      stroke={stroke}
      // class="size-6"
      height={height}
      width={width}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    </svg>

    // <svg
    //   fill={fill}
    //   height={height}
    //   width={width}
    //   version="1.1"
    //   id="Capa_1"
    //   xmlns="http://www.w3.org/2000/svg"
    //   xmlnsXlink="http://www.w3.org/1999/xlink"
    //   viewBox="0 0 471.701 471.701"
    //   xmlSpace="preserve"
    // >
    //   <path
    //     d="M433.601,67.001c-24.7-24.7-57.4-38.2-92.3-38.2s-67.7,13.6-92.4,38.3l-12.9,12.9l-13.1-13.1
    // c-24.7-24.7-57.6-38.4-92.5-38.4c-34.8,0-67.6,13.6-92.2,38.2c-24.7,24.7-38.3,57.5-38.2,92.4c0,34.9,13.7,67.6,38.4,92.3
    // l187.8,187.8c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-3.9l188.2-187.5c24.7-24.7,38.3-57.5,38.3-92.4
    // C471.801,124.501,458.301,91.701,433.601,67.001z M414.401,232.701l-178.7,178l-178.3-178.3c-19.6-19.6-30.4-45.6-30.4-73.3
    // s10.7-53.7,30.3-73.2c19.5-19.5,45.5-30.3,73.1-30.3c27.7,0,53.8,10.8,73.4,30.4l22.6,22.6c5.3,5.3,13.8,5.3,19.1,0l22.4-22.4
    // c19.6-19.6,45.7-30.4,73.3-30.4c27.6,0,53.6,10.8,73.2,30.3c19.6,19.6,30.3,45.6,30.3,73.3
    // C444.801,187.101,434.001,213.101,414.401,232.701z"
    //   />
    // </svg>
  );
};
export default HeartIcon;
