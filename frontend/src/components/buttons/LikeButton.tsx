import * as React from "react";
import HeartIcon from "../../icons/HeartIcon";

type LikeButtonProps = {
  initState: boolean;
  onClick?: () => void;
};

const LikeButton: React.FC<LikeButtonProps> = ({
  initState,
  onClick = () => {},
}) => {
  const [isClicked, setIsClicked] = React.useState<boolean>(initState);

  return (
    <>
      <button
        onClick={() => {
          setIsClicked(!isClicked);
          onClick();
        }}
      >
        <HeartIcon
          height="50px"
          width="50px"
          fill={isClicked ? "pink" : "none"}
          stroke={isClicked ? "red" : "gray"}
        />
      </button>
    </>
  );
};

export default LikeButton;