import React from "react";
import "./DefaultUserProfileIcon.css";

const DefaultUserProfileIcon: React.FC<{
  color: string;
  className?: string;
}> = ({ color, className = "" }) => {
  return (
    <svg
      className={className ? className : "default-user-profile-icon"}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0"
        fill={color}
      />
    </svg>

    //     <svg xmlns="http://www.w3.org/2000/svg" width="340" height="340">
    //       <path
    //         fill="#DDD"
    //         d="m169,.5a169,169 0 1,0 2,0zm0,86a76,76 0 1
    // 1-2,0zM57,287q27-35 67-35h92q40,0 67,35a164,164 0 0,1-226,0"
    //       />
    //     </svg>
  );
};

export default DefaultUserProfileIcon;
