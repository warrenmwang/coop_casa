import { PropertyDetails } from "@app/types/Types";

export const costNumsToPresentableString = (
  costDollars: number,
  costCents: number,
) => {
  const start = `${costDollars}`;
  let res = "";
  let count = 0;
  for (let i = start.length - 1; i >= 0; i--) {
    count++;
    if (count === 4) {
      res = `${start[i]},${res}`;
      count = 1;
    } else {
      res = `${start[i]}${res}`;
    }
  }
  return "$" + res + "." + String(costCents).padStart(2, "0");
};

export const constructAddressString = (details: PropertyDetails): string => {
  return details.address2 === ""
    ? `${details.address1}, ${details.city}, ${details.state} ${details.zipcode}, ${details.country}`
    : `${details.address1}, ${details.address2}, ${details.city}, ${details.state} ${details.zipcode}, ${details.country}`;
};
