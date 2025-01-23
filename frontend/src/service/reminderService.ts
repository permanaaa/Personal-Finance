import BaseUrl from "@/utils/baseUrl";
import axiosInstance from "@/utils/validationRequest";
import axios from "axios";

export interface Reminder {
  _id: string;
  userId: string;
  allocationId: string;
  allocationName: string;
  title: string;
  amount: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ReminderResponse {
  status: boolean;
  data: Reminder[];
  page: number;
  totalPage: number;
  totalReminder: number;
}

interface postReminder {
  status: boolean;
  message: string;
}

interface detailReminder {
  status: boolean;
  data: Reminder;
}

const getAllReminders = async (
  search: string = "", // Default value is an empty string if search is not provided
  perPage: number = 10, // Default value is 10 if perPage is not provided
  page: number = 1, // Default value is 1 if page is not provided
  allocationId?: string
) => {
  try {
    const response = await axiosInstance.get(
      `${BaseUrl.reminder}?search=${search || ""}&perPage=${
        perPage || 10
      }&page=${page || 1}&allocationId=${allocationId}`
    );
    return response.data as ReminderResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const postReminders = async (
  allocationId: string,
  title: string,
  amount: number,
  dueDate: Date = new Date()
) => {
  try {
    const utcDueDate = dueDate.toISOString();
    const response = await axiosInstance.post(BaseUrl.reminder, {
      allocationId,
      amount,
      title,
      dueDate: utcDueDate,
    });
    return response.data as postReminder;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const getDetailReminders = async (id: string) => {
  try {
    const response = await axiosInstance.get(`${BaseUrl.reminder}/${id}`);
    return response.data as detailReminder;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const updateReminders = async (
  id: string,
  allocationId: string,
  title: string,
  amount: number,
  dueDate: Date = new Date()
) => {
  try {
    const utcDueDate = dueDate.toISOString();
    const response = await axiosInstance.put(`${BaseUrl.reminder}/${id}`, {
      allocationId,
      title,
      amount,
      dueDate: utcDueDate,
    });
    return response.data as postReminder;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const deleteReminders = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`${BaseUrl.reminder}/${id}`);
    return response.data as postReminder;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

export {
  getAllReminders,
  postReminders,
  deleteReminders,
  getDetailReminders,
  updateReminders,
};
