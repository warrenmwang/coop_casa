import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiGetListerInfo } from "../api/property";
import { ListerBasicInfo } from "../types/Types";

export const useGetLister = (
  listerID: string,
): UseQueryResult<ListerBasicInfo, Error> => {
  return useQuery({
    queryKey: ["lister", listerID],
    queryFn: () => apiGetListerInfo(listerID),
  });
};
