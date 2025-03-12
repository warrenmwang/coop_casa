import {
  apiGetListerInfo,
  apiListerGetPageOfListersDetails,
} from "@app/api/lister";
import { listerKey } from "@app/reactQueryKeys";
import { PublicListerBasicInfo } from "@app/types/Types";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

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
