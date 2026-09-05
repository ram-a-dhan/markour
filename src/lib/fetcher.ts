import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// ---- Raw shape backend routes are expected to return ----
interface IRawRes<T, M> {
  data: T;
  meta?: M;
}

interface IRawErr {
  error?: string;
  message?: string;
  code?: string;
  details?: unknown;
};

const instance = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<IRawErr>) => {
    const normalized: IFetchErr = error.response
      ? {
          status: error.response.status,
          message:
            error.response.data?.error ??
            error.response.data?.message ??
            error.message ??
            "Request failed",
          code: error.response.data?.code,
          details: error.response.data?.details,
        }
      : {
          status: 0,
          message: error.message || "Network error",
        };

    return Promise.reject(normalized);
  }
);

export async function fetcher<T, M = undefined>(
  url: string,
  config?: AxiosRequestConfig
): Promise<IFetchRes<T, M>> {
  const response = await instance.request<IRawRes<T, M>>({ url, ...config });
  return response.data as IFetchRes<T, M>;
}
