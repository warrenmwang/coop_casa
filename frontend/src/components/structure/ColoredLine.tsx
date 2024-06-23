import React from "react";

type ColoredLineArgs = {
  color: string;
};

// source: https://stackoverflow.com/a/48156940
const ColoredLine: React.FC<ColoredLineArgs> = ({ color }) => (
  <hr
    style={{
      color: color,
      backgroundColor: color,
      height: 5,
    }}
    className="rounded my-6"
  />
);

export default ColoredLine;
