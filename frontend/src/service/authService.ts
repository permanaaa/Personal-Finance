// services/loginService.ts
import axios from "axios";
import BaseUrl from "../utils/baseUrl";

interface LoginResponse {
  status: boolean;
  message: string;
  roomId: string;
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  status: boolean;
  message: string;
}

const loginService = async (
  email: string,
  password: string
): Promise<LoginResponse | null> => {
  try {
    const response = await axios.post(BaseUrl.login, {
      email: email,
      password: password,
    });

    return response.data as LoginResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};
const registerService = async (
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse | null> => {
  try {
    const response = await axios.post(BaseUrl.register, {
      name: name,
      email: email,
      password: password,
    });

    if (response) {
      return response.data as RegisterResponse;
    } else {
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

export { loginService, registerService };
