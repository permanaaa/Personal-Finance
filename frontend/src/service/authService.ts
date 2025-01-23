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

const loginService = async (
  email: string,
  password: string
): Promise<LoginResponse | null> => {
  try {
    const response = await axios.post(BaseUrl.login, {
      email: email,
      password: password,
    });

    if (response.status === 200) {
      return response.data as LoginResponse;
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

export default loginService;
