import { PublicListerBasicInfoSchema } from "@app/types/Schema";
import { PublicListerBasicInfo } from "@app/types/Types";
import { apiListerLink } from "@app/urls";
import { z } from "zod";

// Get public, basic lister info
export async function apiGetListerInfo(
  listerID: string,
): Promise<PublicListerBasicInfo> {
  return (
    fetch(`${apiListerLink}/${listerID}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => res.json())
      // .then((data) => data as ListerBasicInfo);
      .then((data) => {
        const res = PublicListerBasicInfoSchema.safeParse(data);
        if (res.success) return res.data;
        throw new Error(
          "Validation failed: received lister basic info does not match expected schema",
        );
      })
  );
}

// Get list of lister's
export async function apiListerGetPageOfListersDetails(
  limit: number,
  page: number,
  nameFilter: string,
) {
  return fetch(
    `${apiListerLink}?limit=${limit}&page=${page}&nameFilter=${nameFilter}`,
    {
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    },
  )
    .then((res) => res.json())
    .then((data) => {
      const res = z.array(PublicListerBasicInfoSchema).safeParse(data);
      if (res.success) return res.data;
    });
}
