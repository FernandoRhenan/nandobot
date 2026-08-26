import { IResponse } from "@/infra/responses";
import toast from "react-hot-toast";

export default class ResponseFilter {
  static parse<T>(response: IResponse<T>): IResponse<T> | null {
    if (!response.error) {
      if (response.message && response.action)
        toast.success(`${response.message}\n${response.action}`);
      else if (response.message) toast.success(`${response.message}`);
      return response;
    } else {
      if (response.message && response.action)
        toast.error(`${response.message}\n${response.action}`);
      else if (response.message) toast.error(`${response.message}`);
      else toast.error("An unexpected error occurs.\nLook for support.");
      return null;
    }
  }
}
