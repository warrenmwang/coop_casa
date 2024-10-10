import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PublicListerBasicInfo } from "../types/Types";
import { listerKey } from "../reactQueryKeys";
import {
  apiGetListerInfo,
  apiListerGetPageOfListersDetails,
} from "../api/lister";

export const useGetLister = (
  listerID: string,
): UseQueryResult<PublicListerBasicInfo, Error> => {
  return useQuery({
    queryKey: [...listerKey, listerID],
    queryFn: () => apiGetListerInfo(listerID),
  });
};

export const useGetSetOfListers = (
  limit: number,
  page: number,
  nameFilter: string,
) => {
  return useQuery({
    queryKey: [...listerKey, limit, page, nameFilter],
    queryFn: () => apiListerGetPageOfListersDetails(limit, page, nameFilter),
  });
};
