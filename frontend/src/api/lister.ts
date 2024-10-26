import axios from "axios";
import { z } from "zod";
import { PublicListerBasicInfoSchema } from "@app/types/Schema";
import { PublicListerBasicInfo } from "@app/types/Types";
import { apiListerLink } from "@app/urls";

// Get public, basic lister info
export const apiGetListerInfo = async (
  listerID: string,
): Promise<PublicListerBasicInfo> => {
  return (
    axios
      .get(`${apiListerLink}/${listerID}`, {
        headers: {
          Accept: "application/json",
        },
      })
      .then((res) => res.data)
      // .then((data) => data as ListerBasicInfo);
      .then((data) => {
        const res = PublicListerBasicInfoSchema.safeParse(data);
        if (res.success) return res.data;
        throw new Error(
          "Validation failed: received lister basic info does not match expected schema",
        );
      })
  );
};

// Get list of lister's
export const apiListerGetPageOfListersDetails = async (
  limit: number,
  page: number,
  nameFilter: string,
) => {
  return axios
    .get(
      `${apiListerLink}?limit=${limit}&page=${page}&nameFilter=${nameFilter}`,
      {
        headers: {
          Accept: "application/json",
        },
        withCredentials: true,
      },
    )
    .then((res) => res.data)
    .then((data) => {
      const res = z.array(PublicListerBasicInfoSchema).safeParse(data);
      if (res.success) return res.data;
    });
};
