import { SetURLSearchParams } from "react-router-dom";
import { pageQPKey } from "../constants";

export function getURLSearchQueryParam(
  searchParams: URLSearchParams,
  searchParam: string,
  defaultValue: string,
): string {
  let value = searchParams.get(searchParam);
  if (value !== null) return value;
  return defaultValue;
}

export function getPageNumSearchQueryParam(
  searchParams: URLSearchParams,
): number {
  const pageNumQP = getURLSearchQueryParam(searchParams, pageQPKey, "0");
  const numberPageNumQP = Number(pageNumQP);
  if (Number.isNaN(pageNumQP)) return 0;
  if (Number(pageNumQP) < 0) return 0;
  return numberPageNumQP;
}

export function updateURLSearchQueryParam(
  setSearchParams: SetURLSearchParams,
  searchParam: string,
  value: string,
) {
  setSearchParams((prev) => {
    const newParams = new URLSearchParams(prev);
    newParams.set(searchParam, value);
    return newParams;
  });
}
