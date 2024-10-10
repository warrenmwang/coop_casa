import React from "react";
import { PublicListerBasicInfo } from "../../types/Types";
import FetchErrorText from "../../components/FetchErrorText";
import { useGetLister } from "../../hooks/lister";

type ListerInfoProps = {
  listerID: string;
};

const ListerInfo: React.FC<ListerInfoProps> = ({ listerID }) => {
  const { data, status } = useGetLister(listerID);

  const lister = data as PublicListerBasicInfo;

  return (
    <>
      {status === "pending" && "Loading lister info..."}
      {status === "success" && (
        <>
          <div className="text-xl font-bold pt-2">Lister Information</div>
          <div className="flex gap-2">
            <div className="text-lg">Name: </div>
            <div className="text-lg">
              {lister.firstName} {lister.lastName}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-lg">Email: </div>
            <div className="text-lg">{lister.email}</div>
          </div>
        </>
      )}
      {status === "error" && (
        <FetchErrorText>
          Sorry, we are unable to find the lister of this property at the
          moment.
        </FetchErrorText>
      )}
    </>
  );
};

export default ListerInfo;
