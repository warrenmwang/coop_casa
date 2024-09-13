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
      {isClicked ? (
        <button
          onClick={() => {
            setIsClicked(!isClicked);
            onClick();
          }}
        >
          <HeartIcon height="50px" fill="pink" stroke="red" />
        </button>
      ) : (
        <button
          onClick={() => {
            setIsClicked(!isClicked);
            onClick();
          }}
        >
          <HeartIcon height="50px" fill="none" stroke="gray" />
        </button>
      )}
    </>
  );
};

export default LikeButton;
