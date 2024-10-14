import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

export const mutationErrorCallbackCreator = (prefixErrStr: string) => {
  return (error: Error | AxiosError) => {
    let errMsg: string = error.message;
    if (axios.isAxiosError(error)) {
      errMsg = `${(error as AxiosError).response?.data}`;
    }
    toast.error(`${prefixErrStr}: ${errMsg}`);
  };
};
