import { useSearchParams } from "react-router-dom";
import { pageQPKey } from "../constants";

export function useGetURLSearchQueryParam(
  searchParamName: string,
  defaultValue: string,
): string {
  const [searchParams] = useSearchParams();
  let searchParam = searchParams.get(searchParamName);
  if (searchParam !== null) return searchParam;
  return defaultValue;
}

export function useGetPageNumSearchQueryParam(): number {
  const pageNumQP = useGetURLSearchQueryParam(pageQPKey, "0");
  const numberPageNumQP = Number(pageNumQP);
  if (Number.isNaN(pageNumQP)) return 0;
  if (Number(pageNumQP) < 0) return 0;
  return numberPageNumQP;
}

export function useUpdateURLSearchQueryParam(
  searchParamName: string,
  newValue: string,
) {
  const [_, setSearchParams] = useSearchParams();
  setSearchParams((prev) => {
    const newParams = new URLSearchParams(prev);
    newParams.set(searchParamName, newValue);
    return newParams;
  });
}
