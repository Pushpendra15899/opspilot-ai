import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = "ApiError";
    this.status = response.status;
    this.fieldErrors = response.fieldErrors;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data?.message) {
      return Promise.reject(new ApiError(error.response.data));
    }
    return Promise.reject(error);
  },
);