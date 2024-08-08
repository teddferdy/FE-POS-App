import axios, { AxiosError } from "axios";
import { ENDPOINT } from "../utils/endpoints";

const axiosInstance = axios.create({
  // .. where we make our configurations
  baseURL: ENDPOINT.BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

axiosInstance.interceptors.request.use(
  (req) => req,
  (err) => err
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err instanceof AxiosError) {
      return err.response;
    } else return err;
  }
);

export { axiosInstance };
