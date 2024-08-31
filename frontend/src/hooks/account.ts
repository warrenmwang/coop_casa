import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiGetUser, apiGetUserAuth, apiGetUserRole } from "../api/account";
import { APIUserReceived } from "../types/Types";

export const useGetUserAccountDetails = (): UseQueryResult<
  APIUserReceived,
  Error
> => {
  return useQuery({
    queryKey: ["user", "details"],
    queryFn: apiGetUser,
  });
};

export const useGetUserAccountAuth = (): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: ["user", "auth"],
    queryFn: apiGetUserAuth,
  });
};

export const useGetUserAccountRole = (): UseQueryResult<string, Error> => {
  return useQuery({
    queryKey: ["user", "role"],
    queryFn: apiGetUserRole,
  });
};
