import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiGetListerInfo } from "../api/property";
import { ListerBasicInfo } from "../types/Types";
import { listerKey } from "../reactQueryKeys";

export const useGetLister = (
  listerID: string,
): UseQueryResult<ListerBasicInfo, Error> => {
  return useQuery({
    queryKey: [...listerKey, listerID],
    queryFn: () => apiGetListerInfo(listerID),
  });
};
