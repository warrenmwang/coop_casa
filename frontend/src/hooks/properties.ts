import {
  apiCreateNewProperty,
  apiDeleteProperty,
  apiGetProperties,
  apiGetProperty,
  apiTransferAllProperties,
  apiTransferProperty,
  apiUpdateProperty,
} from "@app/api/property";
import { propertiesKey, propertiesPageKey, userPropertiesKey } from "@app/reactQueryKeys";
import { Property } from "@app/types/Types";
import {
  UseQueryResult,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useGetPageOfPropertyIDs = (
  currentPage: number,
  filterAddress: string,
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: [...propertiesPageKey, currentPage, filterAddress],
    queryFn: () => apiGetProperties(currentPage, filterAddress),
  });
};

export const useGetProperties = (
  propertyIDs: string[],
): UseQueryResult<Property, Error>[] => {
  return useQueries({
    queries: propertyIDs.map((propertyID) => {
      return {
        queryKey: [...propertiesKey, propertyID],
        queryFn: () => apiGetProperty(propertyID),
      };
    }),
  });
};

export const useGetProperty = (propertyID: string) => {
  return useQuery({
    queryKey: [...propertiesKey, propertyID],
    queryFn: () => apiGetProperty(propertyID),
  });
};

export const useCreateProperty = () => {
  return useMutation({
    mutationFn: ({ property }: { property: Property }) =>
      apiCreateNewProperty(property),
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ property }: { property: Property }) =>
      apiUpdateProperty(property).then(() => property.details.propertyId),
    onSuccess: (propertyID: string) => {
      queryClient.invalidateQueries({
        queryKey: [...propertiesKey, propertyID],
      });
      queryClient.invalidateQueries({
        queryKey: [...userPropertiesKey],
      });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyID }: { propertyID: string }) =>
      apiDeleteProperty(propertyID),
    onSuccess: (propertyID) => {
      queryClient.invalidateQueries({
        queryKey: [...propertiesKey, propertyID],
      });
      queryClient.invalidateQueries({
        queryKey: [...userPropertiesKey],
      });
    },
  });
};

export const useTransferProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyID,
      userID,
    }: {
      propertyID: string;
      userID: string;
    }) => apiTransferProperty(propertyID, userID),
    onSuccess: (propertyID) => {
      return queryClient.invalidateQueries({
        queryKey: [...propertiesKey, propertyID],
      });
    },
  });
};

export const useTransferAllProperties = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userID: string) => apiTransferAllProperties(userID),
    onSuccess: (propertyID) => {
      return queryClient.invalidateQueries({
        queryKey: [...propertiesKey, propertyID],
      });
    },
  });
};
