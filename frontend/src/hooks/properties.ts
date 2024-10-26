import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  apiCreateNewProperty,
  apiDeleteProperty,
  apiGetProperties,
  apiGetProperty,
  apiTransferAllProperties,
  apiTransferProperty,
  apiUpdateProperty,
} from "@app/api/property";
import { Property } from "@app/types/Types";
import { propertiesKey, propertiesPageKey } from "@app/reactQueryKeys";

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
      return queryClient.invalidateQueries({
        queryKey: [...propertiesKey, propertyID],
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
      return queryClient.invalidateQueries({
        queryKey: [...propertiesKey, propertyID],
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
