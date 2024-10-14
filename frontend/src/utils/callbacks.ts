import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

export const mutationErrorCallback = (error: Error | AxiosError) => {
  let errMsg: string = error.message;
  if (axios.isAxiosError(error)) {
    errMsg = `${(error as AxiosError).response?.data}`;
  }
  toast.error(`Failed to update because: ${errMsg}`);
};
