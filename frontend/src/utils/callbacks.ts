import { toast } from "react-toastify";

export const mutationErrorCallbackCreator = (prefixErrStr: string) => {
  return (error: Error) => {
    const errMsg: string = error.message;
    toast.error(`${prefixErrStr}: ${errMsg}`);
  };
};
