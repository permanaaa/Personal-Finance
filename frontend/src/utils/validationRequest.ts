import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import Cookies from "js-cookie";
import BaseUrl from "./baseUrl";

const API_BASE_URL = BaseUrl.apiBaseUrl;

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = Cookies.get("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token found in cookies");
  }

  const response = await axios.get(BaseUrl.refreshToken, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  const { accessToken } = response.data;

  if (!accessToken) {
    throw new Error("Access token not found in response");
  }

  Cookies.set("accessToken", accessToken, {
    expires: 1,
    secure: true,
    sameSite: "strict",
  });

  return accessToken;
};

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
          | CustomInternalAxiosRequestConfig
          | undefined;

      if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const newAccessToken = await refreshAccessToken();

          if (originalRequest.headers) {
            originalRequest.headers.set(
                "Authorization",
                `Bearer ${newAccessToken}`
            );
          }

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          throw refreshError;
        }
      }

      return Promise.reject(error);
    }
);

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = Cookies.get("accessToken");

    if (accessToken && config.headers) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default axiosInstance;
